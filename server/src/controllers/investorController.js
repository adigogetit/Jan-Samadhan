const mongoose = require("mongoose");
const Project = require("../models/Project");
const Problem = require("../models/Problems");
const ProjectInterest = require("../models/ProjectInterest");
const User = require("../models/User");

/*
|--------------------------------------------------------------------------
| Get Investor Dashboard Data
| GET /api/investor/dashboard
|--------------------------------------------------------------------------
*/
const getInvestorDashboard = async (req, res) => {
  try {
    const investorId = req.user._id;

    const [
      availableProjects,
      myInterestedProjects,
      pendingRequests,
      acceptedPartnerships,
      supportedProjects,
      recentProjects,
    ] = await Promise.all([
      Project.countDocuments({ status: { $ne: "Cancelled" } }),
      ProjectInterest.countDocuments({ investor: investorId }),
      ProjectInterest.countDocuments({ investor: investorId, status: "Pending" }),
      ProjectInterest.countDocuments({ investor: investorId, status: "Accepted" }),
      Project.countDocuments({ industryPartner: investorId }),
      Project.find({ status: { $ne: "Cancelled" } })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("problem", "title category district priority status")
        .populate("university", "name department district")
        .populate("facultyLead", "name department")
        .populate("industryPartner", "name department")
        .lean(),
    ]);

    // Attach student count without exposing private student records
    const formattedRecent = recentProjects.map((proj) => ({
      ...proj,
      studentsCount: Array.isArray(proj.students) ? proj.students.length : 0,
      students: undefined,
    }));

    return res.status(200).json({
      success: true,
      stats: {
        availableProjects,
        myInterestedProjects,
        pendingRequests,
        acceptedPartnerships,
        supportedProjects,
      },
      recentProjects: formattedRecent,
    });
  } catch (error) {
    console.error("Investor dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load investor dashboard.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Browse Available Projects
| GET /api/investor/projects
|--------------------------------------------------------------------------
*/
const getInvestorProjects = async (req, res) => {
  try {
    const { category, district, status, search, supported } = req.query;

    const filter = {};

    if (supported === "true") {
      filter.industryPartner = req.user._id;
    }

    if (status && status !== "All") {
      filter.status = status;
    } else if (!supported) {
      filter.status = { $ne: "Cancelled" };
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (district && district !== "All") {
      filter.district = district;
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };

      const [matchingProblems, matchingUniversities] = await Promise.all([
        Problem.find({
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { district: searchRegex },
          ],
        }).select("_id"),
        User.find({
          role: "university",
          name: searchRegex,
        }).select("_id"),
      ]);

      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { district: searchRegex },
        { problem: { $in: matchingProblems.map((p) => p._id) } },
        { university: { $in: matchingUniversities.map((u) => u._id) } },
      ];
    }

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .populate("problem", "title description category district priority status")
      .populate("university", "name department district")
      .populate("facultyLead", "name department")
      .populate("industryPartner", "name department")
      .lean();

    const formattedProjects = projects.map((proj) => ({
      ...proj,
      studentsCount: Array.isArray(proj.students) ? proj.students.length : 0,
      students: undefined,
    }));

    return res.status(200).json({
      success: true,
      count: formattedProjects.length,
      projects: formattedProjects,
    });
  } catch (error) {
    console.error("Investor projects error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load projects.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Project Details for Industry/Investor
| GET /api/investor/projects/:id
|--------------------------------------------------------------------------
*/
const getInvestorProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findById(id)
      .populate(
        "problem",
        "title description category district priority status validationStatus"
      )
      .populate("university", "name department district state")
      .populate("facultyLead", "name department")
      .populate("industryPartner", "name department")
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Check if the requesting investor has an existing interest for this project
    const userInterest = await ProjectInterest.findOne({
      project: id,
      investor: req.user._id,
    }).lean();

    const studentsCount = Array.isArray(project.students)
      ? project.students.length
      : 0;

    const sanitizedProject = {
      ...project,
      studentsCount,
      students: undefined,
      acceptedStudents: undefined,
    };

    return res.status(200).json({
      success: true,
      project: sanitizedProject,
      userInterest: userInterest || null,
    });
  } catch (error) {
    console.error("Get investor project by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load project details.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Express Interest in a Project
| POST /api/investor/projects/:id/interest
|--------------------------------------------------------------------------
*/
const expressProjectInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const { message = "", supportType = "Other", organizationName = "" } = req.body;

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

    if (project.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot express interest in a cancelled project.",
      });
    }

    const existingInterest = await ProjectInterest.findOne({
      project: id,
      investor: req.user._id,
    });

    if (existingInterest) {
      if (existingInterest.status === "Pending") {
        return res.status(409).json({
          success: false,
          message: "You have already submitted an interest request for this project that is pending review.",
        });
      }

      if (existingInterest.status === "Accepted") {
        return res.status(409).json({
          success: false,
          message: "You are already an accepted industry partner for this project.",
        });
      }

      if (existingInterest.status === "Rejected") {
        return res.status(400).json({
          success: false,
          message: "Your previous interest request for this project was not accepted by the university.",
        });
      }

      // If status is Withdrawn, allow resubmission
      if (existingInterest.status === "Withdrawn") {
        existingInterest.status = "Pending";
        existingInterest.message = message.trim();
        existingInterest.supportType = supportType;
        existingInterest.organizationName =
          organizationName.trim() || req.user.department || "";
        existingInterest.respondedAt = null;
        await existingInterest.save();

        // Add timeline entry
        project.activityTimeline = project.activityTimeline || [];
        project.activityTimeline.push({
          action: "Industry Interest Submitted",
          description: `${req.user.name} re-submitted interest in supporting this project (${supportType}).`,
          performedBy: req.user._id,
          metadata: {
            investorId: req.user._id,
            investorName: req.user.name,
            supportType,
          },
          createdAt: new Date(),
        });
        await project.save();

        return res.status(200).json({
          success: true,
          message: "Interest re-submitted successfully.",
          interest: existingInterest,
        });
      }
    }

    const interest = await ProjectInterest.create({
      project: id,
      investor: req.user._id,
      organizationName: organizationName.trim() || req.user.department || "",
      message: message.trim(),
      supportType,
      status: "Pending",
    });

    // Record timeline entry
    project.activityTimeline = project.activityTimeline || [];
    project.activityTimeline.push({
      action: "Industry Interest Submitted",
      description: `${req.user.name} expressed interest in supporting this project (${supportType}).`,
      performedBy: req.user._id,
      metadata: {
        investorId: req.user._id,
        investorName: req.user.name,
        supportType,
      },
      createdAt: new Date(),
    });
    await project.save();

    return res.status(201).json({
      success: true,
      message: "Interest submitted successfully.",
      interest,
    });
  } catch (error) {
    console.error("Express project interest error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An active interest request already exists for this project.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to submit interest in project.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get All Interests for Logged-in Investor
| GET /api/investor/interests
|--------------------------------------------------------------------------
*/
const getInvestorInterests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { investor: req.user._id };

    if (status && status !== "All") {
      filter.status = status;
    }

    const interests = await ProjectInterest.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "project",
        select:
          "title description category district status startDate expectedCompletionDate",
        populate: [
          { path: "university", select: "name department district" },
          { path: "facultyLead", select: "name department" },
        ],
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: interests.length,
      interests,
    });
  } catch (error) {
    console.error("Get investor interests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load your interests.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Withdraw Interest Request
| PATCH /api/investor/interests/:id/withdraw
|--------------------------------------------------------------------------
*/
const withdrawProjectInterest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interest ID.",
      });
    }

    const interest = await ProjectInterest.findById(id);

    if (!interest) {
      return res.status(404).json({
        success: false,
        message: "Interest request not found.",
      });
    }

    if (interest.investor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to withdraw this request.",
      });
    }

    if (interest.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending interest requests can be withdrawn.",
      });
    }

    interest.status = "Withdrawn";
    await interest.save();

    // Timeline entry
    const project = await Project.findById(interest.project);
    if (project) {
      project.activityTimeline = project.activityTimeline || [];
      project.activityTimeline.push({
        action: "Industry Interest Withdrawn",
        description: `${req.user.name} withdrew their partnership interest request.`,
        performedBy: req.user._id,
        metadata: {
          investorId: req.user._id,
          investorName: req.user.name,
        },
        createdAt: new Date(),
      });
      await project.save();
    }

    return res.status(200).json({
      success: true,
      message: "Interest request withdrawn successfully.",
      interest,
    });
  } catch (error) {
    console.error("Withdraw interest error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to withdraw interest request.",
    });
  }
};

module.exports = {
  getInvestorDashboard,
  getInvestorProjects,
  getInvestorProjectById,
  expressProjectInterest,
  getInvestorInterests,
  withdrawProjectInterest,
};
