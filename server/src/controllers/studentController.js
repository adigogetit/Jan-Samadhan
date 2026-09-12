const mongoose = require("mongoose");
const Project = require("../models/Project");
const Problem = require("../models/Problems");
const User = require("../models/User");

const teamMemberFields = "name email department universityId organizationId phone";

/*
|--------------------------------------------------------------------------
| Get Student Dashboard Data
| GET /api/student/dashboard
|--------------------------------------------------------------------------
*/
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      testingProjects,
      pilotProjects,
      recentProjects,
    ] = await Promise.all([
      Project.countDocuments({ students: studentId }),
      Project.countDocuments({
        students: studentId,
        status: { $in: ["Planning", "Development", "Testing", "Pilot", "Deployment"] },
      }),
      Project.countDocuments({ students: studentId, status: "Completed" }),
      Project.countDocuments({ students: studentId, status: "Testing" }),
      Project.countDocuments({ students: studentId, status: "Pilot" }),
      Project.find({ students: studentId })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("problem", "title category district priority status")
        .populate("university", "name email universityId department district")
        .populate("facultyLead", teamMemberFields)
        .populate("students", teamMemberFields)
        .populate("acceptedStudents", teamMemberFields)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        testingProjects,
        pilotProjects,
      },
      recentProjects,
    });
  } catch (error) {
    console.error("Student dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load student dashboard.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get All Projects Assigned to Logged-in Student
| GET /api/student/projects
|--------------------------------------------------------------------------
*/
const getStudentProjects = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { status, search } = req.query;

    const filter = {
      students: studentId,
    };

    if (status && status !== "All") {
      if (status.toLowerCase() === "active") {
        filter.status = {
          $in: ["Planning", "Development", "Testing", "Pilot", "Deployment"],
        };
      } else {
        filter.status = status;
      }
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };

      const matchingProblems = await Problem.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
          { district: searchRegex },
        ],
      }).select("_id");

      const problemIds = matchingProblems.map((p) => p._id);

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { district: searchRegex },
        { problem: { $in: problemIds } },
      ];
    }

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .populate("problem", "title description category district status priority")
      .populate("university", "name email universityId department district")
      .populate("facultyLead", teamMemberFields)
      .populate("students", teamMemberFields)
      .populate("acceptedStudents", teamMemberFields)
      .lean();

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Student projects error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load student projects.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Single Project by ID for Logged-in Student
| GET /api/student/projects/:id
|--------------------------------------------------------------------------
*/
const getStudentProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const isAssigned = Array.isArray(project.students) &&
      project.students.some((s) => s.toString() === studentId.toString());

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this project.",
      });
    }

    const populatedProject = await Project.findById(id)
      .populate(
        "problem",
        "title description category district block locality location priority status validationStatus createdAt"
      )
      .populate("university", "name email universityId department district")
      .populate("facultyLead", teamMemberFields)
      .populate("students", teamMemberFields)
      .populate("acceptedStudents", teamMemberFields)
      .populate("activityTimeline.performedBy", "name email role")
      .lean();

    if (Array.isArray(populatedProject.activityTimeline)) {
      populatedProject.activityTimeline.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return res.status(200).json({
      success: true,
      project: populatedProject,
    });
  } catch (error) {
    console.error("Get student project by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load project details.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Accept Project Assignment
| POST /api/student/projects/:id/accept
|--------------------------------------------------------------------------
*/
const acceptProjectAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const isAssigned = Array.isArray(project.students) &&
      project.students.some((s) => s.toString() === studentId.toString());

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this project.",
      });
    }

    project.acceptedStudents = project.acceptedStudents || [];

    const alreadyAccepted = project.acceptedStudents.some(
      (s) => s.toString() === studentId.toString()
    );

    if (alreadyAccepted) {
      return res.status(400).json({
        success: false,
        message: "Project assignment already accepted.",
      });
    }

    project.acceptedStudents.push(studentId);

    project.activityTimeline = project.activityTimeline || [];
    project.activityTimeline.push({
      action: "Assignment Accepted",
      description: `Student ${req.user.name} (${req.user.email}) accepted the project assignment.`,
      performedBy: studentId,
      metadata: {
        studentId,
        studentName: req.user.name,
        studentEmail: req.user.email,
        acceptedAt: new Date(),
      },
      createdAt: new Date(),
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate(
        "problem",
        "title description category district block locality location priority status validationStatus createdAt"
      )
      .populate("university", "name email universityId department district")
      .populate("facultyLead", teamMemberFields)
      .populate("students", teamMemberFields)
      .populate("acceptedStudents", teamMemberFields)
      .populate("activityTimeline.performedBy", "name email role")
      .lean();

    if (Array.isArray(populatedProject.activityTimeline)) {
      populatedProject.activityTimeline.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return res.status(200).json({
      success: true,
      message: "Project assignment accepted.",
      project: populatedProject,
    });
  } catch (error) {
    console.error("Accept project assignment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to accept project assignment.",
    });
  }
};

module.exports = {
  getStudentDashboard,
  getStudentProjects,
  getStudentProjectById,
  acceptProjectAssignment,
};
