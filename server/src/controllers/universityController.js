const mongoose = require("mongoose");

const Problem = require("../models/Problems");
const UniversityAcceptance = require("../models/UniversityAcceptance");

// Faculty accounts belong to a university admin account; use that parent for
// routing, acceptance, and project ownership.
const universityAccountId = (user) => user.universityId || user._id;

const assignedProblemQuery = (user) => {
  const university = universityAccountId(user);
  return {
    $or: [
      { acceptedUniversity: university },
      { acceptedUniversity: null, targetUniversities: university },
    ],
  };
};

/*
|--------------------------------------------------------------------------
| HELPER: Resolve University Matching for Current User
|--------------------------------------------------------------------------
*/

const resolveUniversityMatch = (user, problem) => {
  const matches =
    problem.aiAnalysis?.universityMatches ||
    problem.aiAnalysis?.universityMatching?.topMatches ||
    [];

  if (!Array.isArray(matches) || matches.length === 0) {
    return null;
  }

  const userName = (user?.name || "").toLowerCase().trim();
  const userUniId = (user?.universityId || "").toString().toLowerCase().trim();
  const institutionCode = (user?.institutionCode || "").toUpperCase().trim();

  // 1. Stable dataset code match (for example, HEI001).
  let found = institutionCode && matches.find(
    (m) => String(m.id || m.universityId || "").toUpperCase() === institutionCode
  );

  // 2. Legacy direct ID match.
  if (!found) found = matches.find(
    (m) => (m.id || m.universityId || "").toLowerCase() === userUniId
  );

  // 3. Direct Name substring match
  if (!found && userName) {
    found = matches.find((m) => {
      const mName = (m.name || m.universityName || "").toLowerCase();
      const mShort = (m.shortName || "").toLowerCase();
      return (
        mName.includes(userName) ||
        userName.includes(mName) ||
        (mShort && (mShort.includes(userName) || userName.includes(mShort)))
      );
    });
  }

  // 4. Significant word overlap match
  if (!found && userName) {
    const userTokens = userName
      .split(/[\s,.-]+/)
      .filter((t) => t.length > 2);

    found = matches.find((m) => {
      const mText = `${m.name || ""} ${m.shortName || ""}`.toLowerCase();
      const overlapCount = userTokens.filter((token) =>
        mText.includes(token)
      ).length;
      return (
        overlapCount >= 2 ||
        (userTokens.length === 1 && overlapCount === 1)
      );
    });
  }

  if (!found) return null;

  const scoreBreakdown = found.scoreBreakdown || {};
  const matchedDomains = found.matchedElements?.matchedDomains || [];
  const matchedResearch = found.matchedElements?.matchedResearch || [];
  const matchedSkills = found.matchedElements?.matchedSkills || [];

  const matchingReasons = [
    ...(matchedDomains.map((d) => `Domain alignment in ${d}`)),
    ...(matchedResearch.map((r) => `Active research in ${r}`)),
    ...(matchedSkills.map((s) => `Institutional skill match: ${s}`)),
  ];

  if (matchingReasons.length === 0 && found.prototypeNotes) {
    matchingReasons.push(found.prototypeNotes);
  }

  return {
    isMatched: true,
    institutionId: found.id || found.universityId,
    institutionName: found.name || found.universityName,
    shortName: found.shortName || found.name,
    matchScore: found.totalMatchScore || found.overallScore || 0,
    rank: found.rank || 1,
    scoreBreakdown,
    matchedDomains,
    matchedResearch,
    matchedSkills,
    prototypeNotes: found.prototypeNotes || "",
    matchingReasons:
      matchingReasons.length > 0
        ? matchingReasons.slice(0, 4)
        : ["Recommended based on domain analysis & capability evaluation"],
  };
};

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
      ...assignedProblemQuery(req.user),
    })
      .sort({ createdAt: -1 })
      .select(
        "title description category district block location status priority validationStatus aiAnalysis aiCategory aiPriority aiUrgency aiMatchedKeywords createdAt"
      )
      .lean();

    // Enrich problems with match data for current university
    const enrichedProblems = validatedProblems.map((p) => {
      const aiMatch = resolveUniversityMatch(req.user, p);
      return {
        ...p,
        aiMatch,
      };
    });

    // Filter recommended problems (those with a match) & sort by score descending
    const recommendedProblems = enrichedProblems
      .filter((p) => p.aiMatch && p.aiMatch.matchScore > 0)
      .sort((a, b) => (b.aiMatch?.matchScore || 0) - (a.aiMatch?.matchScore || 0));

    const validatedProblemsCount = validatedProblems.length;

    const acceptedProblemsCount =
      await UniversityAcceptance.countDocuments({
        university: universityAccountId(req.user),
        status: "Accepted",
      });

    const stats = {
      validatedProblems: validatedProblemsCount,
      recommendedProblems: recommendedProblems.length,
      acceptedProblems: acceptedProblemsCount,
      projects: 0,
      activeProjects: 0,
    };

    res.status(200).json({
      success: true,
      stats,
      problems: enrichedProblems.slice(0, 10),
      recommendedProblems: recommendedProblems.slice(0, 6),
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
      recommended,
      minScore,
      sortBy,
    } = req.query;

    const query = {
      validationStatus: "Validated",
      status: "Validated",
      ...assignedProblemQuery(req.user),
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
        "title description category district block location status priority validationStatus aiAnalysis aiCategory aiPriority aiUrgency aiMatchedKeywords governmentDepartment createdAt"
      )
      .lean();

    const problemIds = problems.map((problem) => problem._id);

    const acceptedProblems =
      await UniversityAcceptance.find({
        university: universityAccountId(req.user),
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

    let enrichedProblems = problems.map((problem) => {
      const aiMatch = resolveUniversityMatch(req.user, problem);
      return {
        ...problem,
        acceptedByCurrentUniversity: acceptedSet.has(
          problem._id.toString()
        ),
        aiMatch,
      };
    });

    // Filter by recommended flag if requested
    if (recommended === "true" || recommended === true) {
      enrichedProblems = enrichedProblems.filter(
        (p) => p.aiMatch && p.aiMatch.matchScore > 0
      );
    }

    // Filter by minScore if provided
    if (minScore) {
      const threshold = parseFloat(minScore);
      if (!isNaN(threshold)) {
        enrichedProblems = enrichedProblems.filter(
          (p) => (p.aiMatch?.matchScore || 0) >= threshold
        );
      }
    }

    // Sort by match score if requested
    if (sortBy === "matchScore") {
      enrichedProblems.sort(
        (a, b) =>
          (b.aiMatch?.matchScore || 0) - (a.aiMatch?.matchScore || 0)
      );
    }

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
      ...assignedProblemQuery(req.user),
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
        university: universityAccountId(req.user),
        status: "Accepted",
      }).lean();

    const aiMatch = resolveUniversityMatch(req.user, problem);

    res.status(200).json({
      success: true,
      problem,
      aiMatch,
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
    const { note = "" } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID",
      });
    }

    const university = universityAccountId(req.user);

    const existingAcceptance =
      await UniversityAcceptance.findOne({
        problem: id,
        university,
        status: "Accepted",
      });

    if (existingAcceptance) {
      return res.status(409).json({
        success: false,
        message: "Your university has already accepted this problem.",
        acceptance: existingAcceptance,
      });
    }

    // This conditional update is the first-acceptance lock: only a targeted
    // university can claim an unclaimed problem, and only one request wins.
    const problem = await Problem.findOneAndUpdate(
      {
        _id: id,
        validationStatus: "Validated",
        status: "Validated",
        targetUniversities: university,
        acceptedUniversity: null,
      },
      { $set: { acceptedUniversity: university } },
      { returnDocument: "after" }
    );

    if (!problem) {
      return res.status(409).json({
        success: false,
        message: "This problem is not assigned to your university or has already been accepted by another university.",
      });
    }

    const acceptance = await UniversityAcceptance.create({
      problem: problem._id,
      university,
      note: String(note).trim(),
    });

    // Add activity to the problem timeline.
    problem.activity = problem.activity || [];

    problem.activity.push({
      action: "UNIVERSITY_ACCEPTED",
      description:
        `${req.user.name || "University"} accepted this validated problem.`,
      performedBy: req.user._id,
      metadata: {
        universityId: university,
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

