const mongoose = require("mongoose");

const Problem = require("../models/Problems");
const UniversityAcceptance = require("../models/UniversityAcceptance");


/*
|--------------------------------------------------------------------------
| Get University Dashboard
|--------------------------------------------------------------------------
*/

const getUniversityDashboard = async (req, res) => {
  try {
    const validatedProblems = await Problem.find({
      validationStatus: "Validated",
      status: "Validated",
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "title description category district block location status priority validationStatus createdAt"
      )
      .lean();

    const validatedProblemsCount = await Problem.countDocuments({
      validationStatus: "Validated",
      status: "Validated",
    });

    const acceptedProblemsCount =
      await UniversityAcceptance.countDocuments({
        university: req.user._id,
        status: "Accepted",
      });

    const stats = {
      validatedProblems: validatedProblemsCount,
      acceptedProblems: acceptedProblemsCount,
      projects: 0,
      activeProjects: 0,
    };

    res.status(200).json({
      success: true,
      stats,
      problems: validatedProblems,
    });
  } catch (error) {
    console.error("University dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load university dashboard",
    });
  }
};


/*
|--------------------------------------------------------------------------
| Get Validated Problems
|--------------------------------------------------------------------------
*/

const getUniversityProblems = async (req, res) => {
  try {
    const {
      search,
      category,
      district,
      priority,
    } = req.query;

    const query = {
      validationStatus: "Validated",
      status: "Validated",
    };

    if (category) {
      query.category = category;
    }

    if (district) {
      query.district = district;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
        {
          district: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const problems = await Problem.find(query)
      .sort({ createdAt: -1 })
      .select(
        "title description category district block location status priority validationStatus aiCategory aiPriority aiUrgency aiMatchedKeywords governmentDepartment createdAt"
      )
      .lean();

    const problemIds = problems.map((problem) => problem._id);

    const acceptedProblems =
      await UniversityAcceptance.find({
        university: req.user._id,
        problem: { $in: problemIds },
        status: "Accepted",
      })
        .select("problem")
        .lean();

    const acceptedSet = new Set(
      acceptedProblems.map((item) =>
        item.problem.toString()
      )
    );

    const enrichedProblems = problems.map((problem) => ({
      ...problem,
      acceptedByCurrentUniversity: acceptedSet.has(
        problem._id.toString()
      ),
    }));

    res.status(200).json({
      success: true,
      count: enrichedProblems.length,
      problems: enrichedProblems,
    });
  } catch (error) {
    console.error("University problems error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load university problems",
    });
  }
};


/*
|--------------------------------------------------------------------------
| Get Single University Problem
|--------------------------------------------------------------------------
*/

const getUniversityProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID",
      });
    }

    const problem = await Problem.findOne({
      _id: id,
      validationStatus: "Validated",
      status: "Validated",
    })
      .populate("reportedBy", "name")
      .lean();

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Validated problem not found",
      });
    }

    const acceptance =
      await UniversityAcceptance.findOne({
        problem: problem._id,
        university: req.user._id,
        status: "Accepted",
      }).lean();

    res.status(200).json({
      success: true,
      problem,
      acceptedByCurrentUniversity: !!acceptance,
      acceptance: acceptance || null,
    });
  } catch (error) {
    console.error(
      "University problem details error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load problem details",
    });
  }
};


/*
|--------------------------------------------------------------------------
| Accept Problem
|--------------------------------------------------------------------------
*/

const acceptProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { note = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID",
      });
    }

    const problem = await Problem.findOne({
      _id: id,
      validationStatus: "Validated",
      status: "Validated",
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message:
          "Only government-validated problems can be accepted.",
      });
    }

    const existingAcceptance =
      await UniversityAcceptance.findOne({
        problem: problem._id,
        university: req.user._id,
        status: "Accepted",
      });

    if (existingAcceptance) {
      return res.status(409).json({
        success: false,
        message: "Your university has already accepted this problem.",
        acceptance: existingAcceptance,
      });
    }

    const acceptance =
      await UniversityAcceptance.create({
        problem: problem._id,
        university: req.user._id,
        note: note.trim(),
      });

    // Add activity to the problem timeline.
    problem.activityTimeline =
      problem.activityTimeline || [];

    problem.activityTimeline.push({
      action: "University Accepted",
      description:
        `${req.user.name || "University"} accepted this validated problem.`,
      performedBy: req.user._id,
      metadata: {
        universityId: req.user.universityId || null,
        acceptanceId: acceptance._id,
      },
      createdAt: new Date(),
    });

    await problem.save();

    res.status(201).json({
      success: true,
      message: "Problem accepted successfully.",
      acceptance,
    });
  } catch (error) {
    console.error("Accept problem error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Your university has already accepted this problem.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to accept problem",
    });
  }
};


module.exports = {
  getUniversityDashboard,
  getUniversityProblems,
  getUniversityProblemById,
  acceptProblem,
};

