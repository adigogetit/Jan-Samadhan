const mongoose = require("mongoose");

const Project = require("../models/Project");
const Problem = require("../models/Problems");
const UniversityAcceptance = require("../models/UniversityAcceptance");
const User = require("../models/User");
const ProjectInterest = require("../models/ProjectInterest");

const teamMemberFields = "name email department universityId organizationId";

const projectPopulate = (query) =>
  query
    .populate("problem", "title description category district block location priority status")
    .populate("university", "name email universityId department district")
    .populate("facultyLead", teamMemberFields)
    .populate("students", teamMemberFields)
    .populate("industryPartner", "name email department");

// A member can be linked through the university account's id, its universityId,
// or its organizationId. Only non-null values are used so an unlinked account
// never accidentally becomes eligible.
const universityMembershipQuery = (universityUser) => {
  const membership = [{ universityId: universityUser._id }];

  if (universityUser.universityId) membership.push({ universityId: universityUser.universityId });
  if (universityUser.organizationId) membership.push({ organizationId: universityUser.organizationId });

  return { $or: membership };
};

const getOwnedProject = (id, universityId) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
  return Project.findOne({ _id: id, university: universityId });
};

const loadProject = (projectId) => projectPopulate(Project.findById(projectId)).lean();

/*
|--------------------------------------------------------------------------
| Create Project From Accepted Problem
|--------------------------------------------------------------------------
*/

const createProject = async (req, res) => {
  try {
    // IMPORTANT:
    // Frontend sends problemId in req.body
    const {
      problemId,
      title,
      description,
      objective = "",
      proposedSolution = "",
      expectedCompletionDate = null,
    } = req.body;

    // ------------------------------------------------------------
    // Validate Problem ID
    // ------------------------------------------------------------

    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: "Problem ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID.",
      });
    }

    // ------------------------------------------------------------
    // Validate Project Fields
    // ------------------------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project title is required.",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project description is required.",
      });
    }

    // ------------------------------------------------------------
    // Check Problem
    // ------------------------------------------------------------

    const problem = await Problem.findOne({
      _id: problemId,
      validationStatus: "Validated",
      status: "Validated",
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Validated problem not found.",
      });
    }

    // ------------------------------------------------------------
    // Check University Acceptance
    // ------------------------------------------------------------

    const acceptance = await UniversityAcceptance.findOne({
      problem: problem._id,
      university: req.user._id,
      status: "Accepted",
    });

    if (!acceptance) {
      return res.status(403).json({
        success: false,
        message:
          "Your university must accept this problem before creating a project.",
      });
    }

    // ------------------------------------------------------------
    // Prevent Duplicate Project
    // ------------------------------------------------------------

    const existingProject = await Project.findOne({
      problem: problem._id,
      university: req.user._id,
      status: { $ne: "Cancelled" },
    });

    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: "A project already exists for this problem.",
        project: existingProject,
      });
    }

    // ------------------------------------------------------------
    // Create Project
    // ------------------------------------------------------------

    const project = await Project.create({
      problem: problem._id,
      university: req.user._id,

      title: title.trim(),
      description: description.trim(),
      objective: objective?.trim() || "",
      proposedSolution: proposedSolution?.trim() || "",

      category: problem.category,
      district: problem.district,

      status: "Planning",

      startDate: new Date(),

      expectedCompletionDate:
        expectedCompletionDate || null,

      activityTimeline: [
        {
          action: "Project Created",
          description:
            `Project created from accepted problem "${problem.title}".`,
          performedBy: req.user._id,
          metadata: {
            problemId: problem._id,
            acceptanceId: acceptance._id,
          },
          createdAt: new Date(),
        },
      ],
    });

    // ------------------------------------------------------------
    // Update Problem Timeline
    // ------------------------------------------------------------

    problem.activityTimeline =
      problem.activityTimeline || [];

    problem.activityTimeline.push({
      action: "Converted to Project",
      description:
        `University created project "${project.title}".`,
      performedBy: req.user._id,
      metadata: {
        projectId: project._id,
      },
      createdAt: new Date(),
    });

    await problem.save();

    // ------------------------------------------------------------
    // Populate Created Project
    // ------------------------------------------------------------

    const populatedProject =
      await Project.findById(project._id)
        .populate(
          "problem",
          "title category district"
        )
        .populate(
          "university",
          "name email universityId"
        )
        .populate(
          "facultyLead",
          "name email department"
        )
        .lean();

    // ------------------------------------------------------------
    // Response
    // ------------------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project: populatedProject,
    });

  } catch (error) {
    console.error(
      "Create project error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create project.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get University Projects
|--------------------------------------------------------------------------
*/

const getUniversityProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      university: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate(
        "problem",
        "title category district status priority"
      )
      .populate(
        "facultyLead",
        "name email department"
      )
      .lean();

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });

  } catch (error) {
    console.error(
      "Get university projects error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load university projects.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Single University Project
|--------------------------------------------------------------------------
*/

const getUniversityProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // ------------------------------------------------------------
    // Validate Project ID
    // ------------------------------------------------------------

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    // ------------------------------------------------------------
    // Find Project
    // ------------------------------------------------------------

    const project = await Project.findOne({
      _id: id,
      university: req.user._id,
    })
      .populate(
        "problem",
        "title description category district block location priority status"
      )
      .populate(
        "university",
        "name email universityId department district"
      )
      .populate(
        "facultyLead",
        "name email department"
      )
      .populate(
        "students",
        "name email department"
      )
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });

  } catch (error) {
    console.error(
      "Get university project error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load project.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update University Project Status
|--------------------------------------------------------------------------
*/

const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = [
      "Planning",
      "Development",
      "Testing",
      "Pilot",
      "Deployment",
      "Completed",
      "Cancelled",
    ];

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project status.",
      });
    }

    const project = await Project.findOne({
      _id: id,
      university: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const previousStatus = project.status;
    project.status = status;
    project.completedAt = status === "Completed" ? new Date() : null;
    project.activityTimeline = project.activityTimeline || [];
    project.activityTimeline.push({
      action: "Project Status Updated",
      description: `Project status changed from "${previousStatus}" to "${status}".`,
      performedBy: req.user._id,
      metadata: {
        previousStatus,
        status,
      },
      createdAt: new Date(),
    });

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("problem", "title description category district block location priority status")
      .populate("university", "name email universityId department district")
      .populate("facultyLead", "name email department")
      .populate("students", "name email department")
      .populate("industryPartner", "name email department")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Project status updated successfully.",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update project status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update project status.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

const getEligibleFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ role: "university", isActive: true, _id: { $ne: req.user._id }, ...universityMembershipQuery(req.user) }).select(teamMemberFields).sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, faculty });
  } catch (error) {
    console.error("Get eligible faculty error:", error);
    return res.status(500).json({ success: false, message: "Failed to load eligible faculty." });
  }
};

const getEligibleStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student", isActive: true, ...universityMembershipQuery(req.user) }).select(teamMemberFields).sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, students });
  } catch (error) {
    console.error("Get eligible students error:", error);
    return res.status(500).json({ success: false, message: "Failed to load eligible students." });
  }
};

const updateFacultyLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { facultyId } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid project ID." });
    if (!facultyId || !mongoose.Types.ObjectId.isValid(facultyId)) return res.status(400).json({ success: false, message: "Invalid faculty ID." });
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    const faculty = await User.findOne({ _id: facultyId, role: "university", isActive: true, ...universityMembershipQuery(req.user) }).select(teamMemberFields);
    if (!faculty) return res.status(400).json({ success: false, message: "Selected faculty does not belong to your university." });
    const previousFacultyId = project.facultyLead?.toString();
    project.facultyLead = faculty._id;
    project.activityTimeline = project.activityTimeline || [];
    project.activityTimeline.push({ action: previousFacultyId ? "Faculty Lead Changed" : "Faculty Lead Assigned", description: previousFacultyId ? `Faculty lead changed to ${faculty.name} (${faculty.email}).` : `Faculty lead assigned: ${faculty.name} (${faculty.email}).`, performedBy: req.user._id, metadata: { previousFacultyId: previousFacultyId || null, facultyId: faculty._id }, createdAt: new Date() });
    await project.save();
    return res.status(200).json({ success: true, message: "Faculty lead updated successfully.", project: await loadProject(project._id) });
  } catch (error) {
    console.error("Update faculty lead error:", error);
    return res.status(500).json({ success: false, message: "Unable to update faculty lead." });
  }
};

const removeFacultyLead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid project ID." });
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    if (!project.facultyLead) return res.status(400).json({ success: false, message: "This project has no faculty lead to remove." });
    const previousFacultyId = project.facultyLead.toString();
    project.facultyLead = null;
    project.activityTimeline = project.activityTimeline || [];
    project.activityTimeline.push({ action: "Faculty Lead Removed", description: "Faculty lead removed from the project.", performedBy: req.user._id, metadata: { previousFacultyId }, createdAt: new Date() });
    await project.save();
    return res.status(200).json({ success: true, message: "Faculty lead removed successfully.", project: await loadProject(project._id) });
  } catch (error) {
    console.error("Remove faculty lead error:", error);
    return res.status(500).json({ success: false, message: "Unable to remove faculty lead." });
  }
};

const addProjectStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid project ID." });
    if (!Array.isArray(studentIds) || !studentIds.length || studentIds.some((studentId) => !mongoose.Types.ObjectId.isValid(studentId))) return res.status(400).json({ success: false, message: "studentIds must be a non-empty array of valid student IDs." });
    const uniqueStudentIds = [...new Set(studentIds.map(String))];
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    const students = await User.find({ _id: { $in: uniqueStudentIds }, role: "student", isActive: true, ...universityMembershipQuery(req.user) }).select(teamMemberFields);
    if (students.length !== uniqueStudentIds.length) return res.status(400).json({ success: false, message: "One or more selected students do not belong to your university." });
    const existingIds = new Set(project.students.map((studentId) => studentId.toString()));
    const newStudents = students.filter((student) => !existingIds.has(student._id.toString()));
    if (!newStudents.length) return res.status(400).json({ success: false, message: "Selected students are already assigned to this project." });
    project.students.push(...newStudents.map((student) => student._id));
    project.activityTimeline = project.activityTimeline || [];
    project.activityTimeline.push({ action: "Students Assigned", description: `Assigned ${newStudents.length} student${newStudents.length === 1 ? "" : "s"}: ${newStudents.map((student) => student.name).join(", ")}.`, performedBy: req.user._id, metadata: { studentIds: newStudents.map((student) => student._id) }, createdAt: new Date() });
    await project.save();
    return res.status(200).json({ success: true, message: "Students assigned successfully.", project: await loadProject(project._id) });
  } catch (error) {
    console.error("Add project students error:", error);
    return res.status(500).json({ success: false, message: "Unable to assign students." });
  }
};

const removeProjectStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid project ID." });
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) return res.status(400).json({ success: false, message: "Invalid student ID." });
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    const student = project.students.find((assignedId) => assignedId.toString() === studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student is not assigned to this project." });
    const studentUser = await User.findById(student).select("name email");
    project.students = project.students.filter((assignedId) => assignedId.toString() !== studentId);
    if (project.acceptedStudents) {
      project.acceptedStudents = project.acceptedStudents.filter((assignedId) => assignedId.toString() !== studentId);
    }
    project.activityTimeline = project.activityTimeline || [];
    project.activityTimeline.push({ action: "Student Removed", description: `Removed student ${studentUser?.name || studentUser?.email || "from the project"}.`, performedBy: req.user._id, metadata: { studentId }, createdAt: new Date() });
    await project.save();
    return res.status(200).json({ success: true, message: "Student removed successfully.", project: await loadProject(project._id) });
  } catch (error) {
    console.error("Remove project student error:", error);
    return res.status(500).json({ success: false, message: "Unable to remove student." });
  }
};

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Get Project Industry / Investor Interests
| GET /api/university/projects/:id/interests
|--------------------------------------------------------------------------
*/
const getProjectInterests = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid project ID." });
    }

    const project = await getOwnedProject(id, req.user._id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or not owned by your university." });
    }

    const interests = await ProjectInterest.find({ project: id })
      .sort({ createdAt: -1 })
      .populate("investor", "name email department phone organizationId")
      .lean();

    return res.status(200).json({
      success: true,
      count: interests.length,
      interests,
    });
  } catch (error) {
    console.error("Get project interests error:", error);
    return res.status(500).json({ success: false, message: "Failed to load project interests." });
  }
};

/*
|--------------------------------------------------------------------------
| Accept Industry Partnership Request
| PATCH /api/university/interests/:id/accept
|--------------------------------------------------------------------------
*/
const acceptProjectInterest = async (req, res) => {
  try {
    const interestId = req.params.interestId || req.params.id;
    if (!interestId || !mongoose.Types.ObjectId.isValid(interestId)) {
      return res.status(400).json({ success: false, message: "Invalid interest ID." });
    }

    const interest = await ProjectInterest.findById(interestId).populate("investor", "name email department organizationId");
    if (!interest) {
      return res.status(404).json({ success: false, message: "Interest request not found." });
    }

    const project = await getOwnedProject(interest.project, req.user._id);
    if (!project) {
      return res.status(403).json({ success: false, message: "You are not authorized to manage partnerships for this project." });
    }

    if (interest.status === "Accepted") {
      return res.status(400).json({ success: false, message: "This partnership request is already accepted." });
    }

    if (project.industryPartner && project.industryPartner.toString() !== interest.investor._id.toString()) {
      return res.status(409).json({
        success: false,
        message: "This project already has an assigned industry partner. Manage or remove the existing partner before accepting a new one.",
      });
    }

    interest.status = "Accepted";
    interest.respondedAt = new Date();
    await interest.save();

    project.industryPartner = interest.investor._id;
    project.activityTimeline = project.activityTimeline || [];
    const partnerName = interest.organizationName || interest.investor.name || "Industry Partner";
    project.activityTimeline.push({
      action: "Industry Partnership Accepted",
      description: partnerName + " was accepted as an industry partner (" + interest.supportType + ").",
      performedBy: req.user._id,
      metadata: {
        investorId: interest.investor._id,
        investorName: interest.investor.name,
        supportType: interest.supportType,
      },
      createdAt: new Date(),
    });
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Industry partnership accepted successfully.",
      project: await loadProject(project._id),
      interest,
    });
  } catch (error) {
    console.error("Accept project interest error:", error);
    return res.status(500).json({ success: false, message: "Failed to accept partnership request." });
  }
};

/*
|--------------------------------------------------------------------------
| Reject Industry Partnership Request
| PATCH /api/university/interests/:id/reject
|--------------------------------------------------------------------------
*/
const rejectProjectInterest = async (req, res) => {
  try {
    const interestId = req.params.interestId || req.params.id;
    if (!interestId || !mongoose.Types.ObjectId.isValid(interestId)) {
      return res.status(400).json({ success: false, message: "Invalid interest ID." });
    }

    const interest = await ProjectInterest.findById(interestId).populate("investor", "name email");
    if (!interest) {
      return res.status(404).json({ success: false, message: "Interest request not found." });
    }

    const project = await getOwnedProject(interest.project, req.user._id);
    if (!project) {
      return res.status(403).json({ success: false, message: "You are not authorized to manage partnerships for this project." });
    }

    if (interest.status === "Rejected") {
      return res.status(400).json({ success: false, message: "This partnership request is already rejected." });
    }

    if (project.industryPartner && project.industryPartner.toString() === interest.investor._id.toString()) {
      project.industryPartner = null;
    }

    interest.status = "Rejected";
    interest.respondedAt = new Date();
    await interest.save();

    project.activityTimeline = project.activityTimeline || [];
    project.activityTimeline.push({
      action: "Industry Interest Rejected",
      description: "External partnership request (" + interest.supportType + ") was rejected by the university.",
      performedBy: req.user._id,
      metadata: {
        investorId: interest.investor._id,
        supportType: interest.supportType,
      },
      createdAt: new Date(),
    });
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Industry partnership request rejected.",
      project: await loadProject(project._id),
      interest,
    });
  } catch (error) {
    console.error("Reject project interest error:", error);
    return res.status(500).json({ success: false, message: "Failed to reject partnership request." });
  }
};

module.exports = {
  getProjectInterests,
  acceptProjectInterest,
  rejectProjectInterest,
  createProject,
  getUniversityProjects,
  getUniversityProjectById,
  updateProjectStatus,
  getEligibleFaculty,
  getEligibleStudents,
  updateFacultyLead,
  removeFacultyLead,
  addProjectStudents,
  removeProjectStudent,
};
