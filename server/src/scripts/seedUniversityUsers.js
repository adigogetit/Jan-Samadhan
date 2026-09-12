require("dotenv").config();

const path = require("path");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const Problem = require("../models/Problems");
const Project = require("../models/Project");

const universitiesJsonPath = path.join(
  __dirname,
  "../../../university_matching/universities_25.json"
);
const universitiesDataset = require(universitiesJsonPath).universities;

const PASSWORD = "123456789";
const FACULTY_PER_UNIVERSITY = 3;
const STUDENTS_PER_UNIVERSITY = 6;
const departments = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
];

function userData({
  name,
  email,
  role,
  universityId = null,
  institutionCode,
  department,
  district,
  state = "Jharkhand",
  passwordHash,
}) {
  return {
    name,
    email,
    passwordHash,
    role,
    universityId,
    institutionCode,
    department,
    district,
    state,
    isActive: true,
    isApproved: true,
  };
}

async function upsertUser(data) {
  return User.findOneAndUpdate(
    { email: data.email },
    { $set: data },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );
}

async function seed() {
  if (!process.env.MONGODB_URI)
    throw new Error("MONGODB_URI is missing from server/.env.");

  await mongoose.connect(process.env.MONGODB_URI);
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const emailByCode = new Map();

  for (let index = 0; index < universitiesDataset.length; index += 1) {
    const u = universitiesDataset[index];
    const universityNumber = String(index + 1).padStart(2, "0");
    const institutionCode = u.id || `HEI${String(index + 1).padStart(3, "0")}`;
    const universityName = u.name;
    const shortName = u.shortName || u.name;
    const district = u.city || "Ranchi";
    const state = u.state || "Jharkhand";
    const adminEmail = `uni${universityNumber}.admin@uvi.com`;

    emailByCode.set(institutionCode.toUpperCase(), adminEmail);

    const admin = await upsertUser(
      userData({
        name: `${universityName} Admin`,
        email: adminEmail,
        role: "university",
        institutionCode,
        department: "Administration",
        district,
        state,
        passwordHash,
      })
    );

    for (
      let facultyIndex = 0;
      facultyIndex < FACULTY_PER_UNIVERSITY;
      facultyIndex += 1
    ) {
      const memberNumber = String(facultyIndex + 1).padStart(2, "0");
      await upsertUser(
        userData({
          name: `Faculty ${memberNumber} - ${shortName}`,
          email: `uni${universityNumber}.faculty${memberNumber}@uvi.com`,
          role: "university",
          universityId: admin._id,
          institutionCode,
          department: departments[facultyIndex % departments.length],
          district,
          state,
          passwordHash,
        })
      );
    }

    for (
      let studentIndex = 0;
      studentIndex < STUDENTS_PER_UNIVERSITY;
      studentIndex += 1
    ) {
      const memberNumber = String(studentIndex + 1).padStart(2, "0");
      await upsertUser(
        userData({
          name: `Student ${memberNumber} - ${shortName}`,
          email: `uni${universityNumber}.student${memberNumber}@uvi.com`,
          role: "student",
          universityId: admin._id,
          institutionCode,
          department: departments[studentIndex % departments.length],
          district,
          state,
          passwordHash,
        })
      );
    }
  }

  // Sync existing problem documents in MongoDB so aiAnalysis.universityMatches stores the correct email
  const problems = await Problem.find({
    "aiAnalysis.universityMatches": { $exists: true, $ne: [] },
  });

  let updatedProblemsCount = 0;
  for (const problem of problems) {
    let modified = false;
    if (problem.aiAnalysis && Array.isArray(problem.aiAnalysis.universityMatches)) {
      problem.aiAnalysis.universityMatches = problem.aiAnalysis.universityMatches.map(
        (match) => {
          const code = String(match.id || match.universityId || "").toUpperCase();
          const email = emailByCode.get(code) || null;
          if (match.email !== email) {
            modified = true;
          }
          return {
            ...match,
            email,
          };
        }
      );
    }

    if (modified) {
      problem.markModified("aiAnalysis");
      await problem.save();
      updatedProblemsCount += 1;
    }
  }

  // Clean up any legacy activity strings on projects
  const projects = await Project.find();
  for (const proj of projects) {
    let projModified = false;
    if (proj.activityTimeline && Array.isArray(proj.activityTimeline)) {
      proj.activityTimeline.forEach((act) => {
        if (act.description && act.description.includes("Dhanbad Science University")) {
          act.description = act.description.replace(
            /Dhanbad Science University/g,
            "Birsa Agricultural University"
          );
          projModified = true;
        }
      });
    }
    if (projModified) {
      proj.markModified("activityTimeline");
      await proj.save();
    }
  }

  const seededUsers = await User.countDocuments({ email: /@uvi\.com$/ });
  console.log(
    `Successfully synced all 25 universities from universities_25.json!`
  );
  console.log(
    `Total active @uvi.com accounts: ${seededUsers} across 25 universities.`
  );
  console.log(
    `Updated ${updatedProblemsCount} problem documents with synced university emails.`
  );
  console.log(`All accounts password: ${PASSWORD}`);
}

seed()
  .catch((error) => {
    console.error("University user seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
