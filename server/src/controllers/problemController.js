const mongoose = require("mongoose");
const Problem = require("../models/Problems");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const { classifyWithAI } = require("../services/aiService");

// ============================================================
// CATEGORY → GOVERNMENT DEPARTMENT
// ============================================================

const CATEGORY_DEPARTMENT_MAP = {
  "Roads & Transport": "Road & Transport",
  "Water & Sanitation": "Water Supply",
  Electricity: "Electricity",
  Healthcare: "Health",
  Education: "Education",
  Agriculture: "Agriculture",
  Environment: "Environment",
  "Public Safety": "Police",
  "Waste Management": "Municipal Corporation",
  Other: "Other",
};

// ============================================================
// ALLOWED GOVERNMENT DEPARTMENTS
// ============================================================

const ALLOWED_DEPARTMENTS = [
  "Agriculture",
  "Road & Transport",
  "Water Supply",
  "Electricity",
  "Health",
  "Education",
  "Environment",
  "Municipal Corporation",
  "Police",
  "Other",
];

// ============================================================
// ALLOWED COMPLAINT STATUSES
// ============================================================

const ALLOWED_STATUSES = [
  "Pending",
  "Under Review",
  "Validated",
  "In Progress",
  "Resolved",
  "Rejected",
  "Duplicate",
];

// ============================================================
// ALLOWED PRIORITIES
// ============================================================

const ALLOWED_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

// ============================================================
// ALLOWED VALIDATION STATUSES
// ============================================================

const ALLOWED_VALIDATION_STATUSES = [
  "Pending",
  "Validated",
  "Rejected",
  "Duplicate",
];

// ============================================================
// HELPER: UPLOAD BUFFER TO CLOUDINARY
// ============================================================

const uploadBufferToCloudinary = (
  buffer,
  resourceType,
  folder
) => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result);
        }
      );

    Readable.from(buffer).pipe(uploadStream);
  });
};

// ============================================================
// CREATE PROBLEM - CITIZEN
// ============================================================

const createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      district,
      block,
      address,
      latitude,
      longitude,
    } = req.body;

    let parsedLocation = {};

    if (req.body.location) {
      try {
        parsedLocation =
          typeof req.body.location === "string"
            ? JSON.parse(req.body.location)
            : req.body.location;
      } catch (error) {
        parsedLocation = {};
      }
    }

    const resolvedAddress =
      address || parsedLocation.address || "";
    const resolvedLatitude =
      latitude !== undefined && latitude !== ""
        ? Number(latitude)
        : parsedLocation.latitude !== undefined
          ? Number(parsedLocation.latitude)
          : undefined;
    const resolvedLongitude =
      longitude !== undefined && longitude !== ""
        ? Number(longitude)
        : parsedLocation.longitude !== undefined
          ? Number(parsedLocation.longitude)
          : undefined;

    // ----------------------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------------------

    if (!title || !description || !district) {
      return res.status(400).json({
        success: false,
        message: "Title, description and district are required.",
      });
    }

    let finalCategory = category || "Other";

    // ----------------------------------------------------------
    // MEDIA ARRAYS
    // ----------------------------------------------------------

    const images = [];
    const videos = [];

    const files = req.files || [];

    // ----------------------------------------------------------
    // UPLOAD MEDIA
    // ----------------------------------------------------------

    for (const file of files) {
      const isVideo =
        file.mimetype.startsWith("video/");

      const result =
        await uploadBufferToCloudinary(
          file.buffer,
          isVideo ? "video" : "image",
          "jan-samadhan/problems"
        );

      if (isVideo) {
        videos.push(result.secure_url);
      } else {
        images.push(result.secure_url);
      }
    }

    // ----------------------------------------------------------
    // AI CLASSIFICATION
    // ----------------------------------------------------------

    const aiText = `${title} ${description}`;
    const aiResult = await classifyWithAI(aiText);

    // ----------------------------------------------------------
    // DETERMINE FINAL CATEGORY, DEPARTMENT, PRIORITY
    // ----------------------------------------------------------

    let finalPriority = "Medium";          // safe default
    let aiFields = {};                     // AI fields to save
    const activityEntries = [];

    activityEntries.push({
      action: "PROBLEM_REPORTED",
      description: "Citizen reported a new problem.",
      performedBy: req.user._id,
      metadata: { category },
    });

    if (aiResult) {
      // ── AI SUCCESS ──────────────────────────────────────────

      // Use AI category if it maps to a valid JAN-SAMADHAN category.
      const aiMappedCategory =
        Object.keys(CATEGORY_DEPARTMENT_MAP).includes(
          aiResult.category
        )
          ? aiResult.category
          : category;

      finalCategory = aiMappedCategory;
      finalPriority = aiResult.priority;

      aiFields = {
        aiCategory: aiResult.category,
        aiPriority: aiResult.priority,
        aiLanguage: aiResult.language,
        aiUrgency: aiResult.urgency,
        aiMatchedKeywords: aiResult.matchedKeywords,
      };

      activityEntries.push({
        action: "AI_CLASSIFIED",
        description: `AI classified complaint as "${aiResult.category}" (normalised: "${finalCategory}") with ${aiResult.priority} priority in ${aiResult.language}.`,
        performedBy: req.user._id,
        metadata: {
          aiCategory: aiResult.category,
          normalizedCategory: finalCategory,
          aiPriority: aiResult.priority,
          aiLanguage: aiResult.language,
          aiUrgency: aiResult.urgency,
          matchedKeywords: aiResult.matchedKeywords,
        },
      });
    } else {
      // ── AI FALLBACK ─────────────────────────────────────────

      activityEntries.push({
        action: "AI_CLASSIFICATION_FALLBACK",
        description:
          "AI service was unavailable. Using citizen-selected category and Medium priority.",
        performedBy: req.user._id,
        metadata: {
          reason: "AI service unavailable",
          category,
          priority: "Medium",
        },
      });
    }

    // ----------------------------------------------------------
    // AUTOMATIC DEPARTMENT ROUTING
    // ----------------------------------------------------------

    const governmentDepartment =
      CATEGORY_DEPARTMENT_MAP[finalCategory];

    if (!governmentDepartment) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem category.",
      });
    }

    activityEntries.push({
      action: "DEPARTMENT_AUTO_ASSIGNED",
      description: `Problem automatically routed to ${governmentDepartment} based on ${aiResult ? "AI-classified" : "citizen-selected"} category "${finalCategory}".`,
      performedBy: req.user._id,
      metadata: {
        category: finalCategory,
        governmentDepartment,
        automatic: true,
        aiDriven: Boolean(aiResult),
      },
    });

    // ----------------------------------------------------------
    // CREATE PROBLEM
    // ----------------------------------------------------------

    const problem = await Problem.create({
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      district: district.trim(),
      block: block?.trim(),

      location: {
        address: resolvedAddress?.trim(),
        latitude: resolvedLatitude,
        longitude: resolvedLongitude,
      },

      images,
      videos,

      reportedBy: req.user._id,

      governmentDepartment,

      status: "Pending",

      priority: finalPriority,

      validationStatus: "Pending",

      ...aiFields,

      activity: activityEntries,
    });

    return res.status(201).json({
      success: true,
      message:
        "Problem reported successfully and automatically routed to the appropriate department.",
      problem,
    });
  } catch (error) {
    console.error("Create problem error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create problem.",
      error: error.message,
    });
  }
};

// ============================================================
// GET MY PROBLEMS - CITIZEN
// ============================================================

const getMyProblems = async (req, res) => {
  try {
    const problems =
      await Problem.find({
        reportedBy: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .populate(
          "reportedBy",
          "name email"
        );

    return res.status(200).json({
      success: true,
      problems,
    });
  } catch (error) {
    console.error("Get my problems error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch your problems.",
      error: error.message,
    });
  }
};

// ============================================================
// GET GOVERNMENT PROBLEMS
// ============================================================

const getGovernmentProblems = async (
  req,
  res
) => {
  try {
    const {
      search,
      status,
      priority,
      category,
      district,
      department,
    } = req.query;

    const filter = {};

    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------

    if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid complaint status.",
        });
      }

      filter.status = status;
    }

    // ----------------------------------------------------------
    // PRIORITY
    // ----------------------------------------------------------

    if (priority) {
      if (!ALLOWED_PRIORITIES.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority.",
        });
      }

      filter.priority = priority;
    }

    // ----------------------------------------------------------
    // CATEGORY
    // ----------------------------------------------------------

    if (category) {
      if (
        !Object.keys(
          CATEGORY_DEPARTMENT_MAP
        ).includes(category)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid problem category.",
        });
      }

      filter.category = category;
    }

    // ----------------------------------------------------------
    // DISTRICT
    // ----------------------------------------------------------

    if (district) {
      filter.district = district;
    }

    // ----------------------------------------------------------
    // DEPARTMENT
    // ----------------------------------------------------------

    if (department) {
      if (
        !ALLOWED_DEPARTMENTS.includes(
          department
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid government department.",
        });
      }

      filter.governmentDepartment =
        department;
    }

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (search) {
      filter.$or = [
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
          district: {
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
          governmentDepartment: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ----------------------------------------------------------
    // FETCH
    // ----------------------------------------------------------

    const problems =
      await Problem.find(filter)
        .sort({
          createdAt: -1,
        })
        .populate(
          "reportedBy",
          "name email"
        );

    return res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });
  } catch (error) {
    console.error(
      "Get government problems error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch government problems.",
      error: error.message,
    });
  }
};

// ============================================================
// GET PUBLIC PROBLEM OVERVIEW
// ============================================================
// This endpoint is used by the public JAN-SAMADHAN landing page.
// It does NOT expose citizen identity/contact information.
// ============================================================

const getPublicProblemOverview = async (
  req,
  res
) => {
  try {
    const [
      statusStats,
      districtStats,
      categoryStats,
      recentProblems,
    ] = await Promise.all([
      // --------------------------------------------------------
      // OVERALL STATUS STATISTICS
      // --------------------------------------------------------

      Problem.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]),

      // --------------------------------------------------------
      // DISTRICT-WISE STATISTICS
      // --------------------------------------------------------

      Problem.aggregate([
        {
          $group: {
            _id: "$district",

            total: {
              $sum: 1,
            },

            pending: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Pending",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            underReview: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Under Review",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            validated: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Validated",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            inProgress: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "In Progress",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            resolved: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Resolved",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            rejected: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Rejected",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            duplicate: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "Duplicate",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },

        {
          $project: {
            _id: 0,

            district: "$_id",

            total: 1,
            pending: 1,
            underReview: 1,
            validated: 1,
            inProgress: 1,
            resolved: 1,
            rejected: 1,
            duplicate: 1,

            resolutionRate: {
              $cond: [
                {
                  $gt: [
                    "$total",
                    0,
                  ],
                },

                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$resolved",
                            "$total",
                          ],
                        },
                        100,
                      ],
                    },
                    1,
                  ],
                },

                0,
              ],
            },
          },
        },

        {
          $sort: {
            total: -1,
            district: 1,
          },
        },
      ]),

      // --------------------------------------------------------
      // CATEGORY-WISE STATISTICS
      // --------------------------------------------------------

      Problem.aggregate([
        {
          $group: {
            _id: "$category",
            count: {
              $sum: 1,
            },
          },
        },

        {
          $project: {
            _id: 0,
            category: "$_id",
            count: 1,
          },
        },

        {
          $sort: {
            count: -1,
            category: 1,
          },
        },
      ]),

      // --------------------------------------------------------
      // RECENT PUBLIC PROBLEMS
      // --------------------------------------------------------
      // Only safe public fields are returned.
      // Citizen name/email/phone are NOT exposed.
      // --------------------------------------------------------

      Problem.find(
        {},
        {
          title: 1,
          district: 1,
          category: 1,
          status: 1,
          priority: 1,
          createdAt: 1,
        }
      )
        .sort({
          createdAt: -1,
        })
        .limit(12)
        .lean(),
    ]);

    // ----------------------------------------------------------
    // OVERALL STATISTICS
    // ----------------------------------------------------------

    const stats = {
      total: 0,
      pending: 0,
      underReview: 0,
      validated: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
      duplicate: 0,
      active: 0,
      resolutionRate: 0,
    };

    statusStats.forEach((item) => {
      const count = item.count || 0;

      stats.total += count;

      switch (item._id) {
        case "Pending":
          stats.pending = count;
          break;

        case "Under Review":
          stats.underReview = count;
          break;

        case "Validated":
          stats.validated = count;
          break;

        case "In Progress":
          stats.inProgress = count;
          break;

        case "Resolved":
          stats.resolved = count;
          break;

        case "Rejected":
          stats.rejected = count;
          break;

        case "Duplicate":
          stats.duplicate = count;
          break;

        default:
          break;
      }
    });

    // ----------------------------------------------------------
    // ACTIVE COMPLAINTS
    // ----------------------------------------------------------

    stats.active =
      stats.pending +
      stats.underReview +
      stats.validated +
      stats.inProgress;

    // ----------------------------------------------------------
    // RESOLUTION RATE
    // ----------------------------------------------------------

    stats.resolutionRate =
      stats.total > 0
        ? Number(
          (
            (stats.resolved /
              stats.total) *
            100
          ).toFixed(1)
        )
        : 0;

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.status(200).json({
      success: true,
      stats,
      districts: districtStats,
      categories: categoryStats,
      recentProblems,
    });
  } catch (error) {
    console.error(
      "Get public problem overview error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load public civic data.",
    });
  }
};

// ============================================================
// GET SINGLE PROBLEM
// ============================================================

const getProblemById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID.",
      });
    }

    const problem =
      await Problem.findById(req.params.id)
        .populate(
          "reportedBy",
          "name email phone"
        )
        .populate(
          "activity.performedBy",
          "name email role"
        );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }

    // Government can view any complaint.
    if (req.user.role === "government") {
      return res.status(200).json({
        success: true,
        problem,
      });
    }

    // Citizen can only view their own complaint.
    if (req.user.role === "citizen") {
      const reportedById =
        problem.reportedBy?._id?.toString();

      const currentUserId =
        req.user._id?.toString();

      if (
        !reportedById ||
        reportedById !== currentUserId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this problem.",
        });
      }

      return res.status(200).json({
        success: true,
        problem,
      });
    }

    return res.status(403).json({
      success: false,
      message:
        "You are not authorized to view this problem.",
    });
  } catch (error) {
    console.error(
      "Get problem by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch problem.",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE GOVERNMENT PROBLEM
// ============================================================

const updateGovernmentProblem = async (
  req,
  res
) => {
  try {
    const {
      status,
      priority,
      governmentDepartment,
      validationStatus,
      duplicateOf,
    } = req.body;

    // ----------------------------------------------------------
    // VALIDATE PROBLEM ID
    // ----------------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID.",
      });
    }

    // ----------------------------------------------------------
    // FIND PROBLEM
    // ----------------------------------------------------------

    const problem =
      await Problem.findById(
        req.params.id
      );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }

    // ----------------------------------------------------------
    // VALIDATE INPUTS BEFORE CHANGING ANYTHING
    // ----------------------------------------------------------

    if (
      status !== undefined &&
      !ALLOWED_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint status.",
      });
    }

    if (
      priority !== undefined &&
      !ALLOWED_PRIORITIES.includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority.",
      });
    }

    if (
      governmentDepartment !== undefined &&
      governmentDepartment &&
      !ALLOWED_DEPARTMENTS.includes(
        governmentDepartment
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid government department.",
      });
    }

    if (
      validationStatus !== undefined &&
      !ALLOWED_VALIDATION_STATUSES.includes(
        validationStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid validation status.",
      });
    }

    if (
      duplicateOf !== undefined &&
      duplicateOf &&
      !mongoose.Types.ObjectId.isValid(
        duplicateOf
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid duplicate complaint ID.",
      });
    }

    // ----------------------------------------------------------
    // OLD VALUES
    // ----------------------------------------------------------

    const oldStatus = problem.status;
    const oldPriority = problem.priority;
    const oldDepartment =
      problem.governmentDepartment;
    const oldValidationStatus =
      problem.validationStatus;

    // ----------------------------------------------------------
    // PRIORITY
    // ----------------------------------------------------------

    if (priority !== undefined) {
      problem.priority = priority;

      if (oldPriority !== priority) {
        problem.activity.push({
          action: "PRIORITY_CHANGED",
          description: `Complaint priority changed from ${oldPriority} to ${priority}.`,
          performedBy: req.user._id,
          metadata: {
            from: oldPriority,
            to: priority,
          },
        });
      }
    }

    // ----------------------------------------------------------
    // DEPARTMENT CORRECTION
    // ----------------------------------------------------------

    if (
      governmentDepartment !==
      undefined
    ) {
      const newDepartment =
        governmentDepartment || undefined;

      problem.governmentDepartment =
        newDepartment;

      if (
        oldDepartment !==
        newDepartment
      ) {
        problem.activity.push({
          action: "DEPARTMENT_CORRECTED",
          description: newDepartment
            ? `Government corrected the department from ${oldDepartment || "Unassigned"
            } to ${newDepartment}.`
            : "Government removed the assigned department.",
          performedBy: req.user._id,
          metadata: {
            from:
              oldDepartment || null,
            to:
              newDepartment || null,
            automaticRouting: false,
            correction: true,
          },
        });
      }
    }

    // ----------------------------------------------------------
    // VALIDATION STATUS
    // ----------------------------------------------------------

    if (
      validationStatus !== undefined &&
      validationStatus !==
      oldValidationStatus
    ) {
      problem.validationStatus =
        validationStatus;

      let syncedStatus = problem.status;

      if (validationStatus === "Validated") {
        syncedStatus = "Validated";
      }

      if (validationStatus === "Rejected") {
        syncedStatus = "Rejected";
      }

      if (validationStatus === "Duplicate") {
        syncedStatus = "Duplicate";
      }

      if (validationStatus === "Pending") {
        syncedStatus = "Pending";
      }

      const statusChanged =
        syncedStatus !== problem.status;

      const previousStatus =
        problem.status;

      problem.status = syncedStatus;

      // ONE timeline event for validation + synchronized status.
      problem.activity.push({
        action:
          "VALIDATION_STATUS_CHANGED",
        description: statusChanged
          ? `Validation status changed from ${oldValidationStatus} to ${validationStatus}. Complaint status changed from ${previousStatus} to ${syncedStatus}.`
          : `Validation status changed from ${oldValidationStatus} to ${validationStatus}.`,
        performedBy: req.user._id,
        metadata: {
          from: oldValidationStatus,
          to: validationStatus,
          previousStatus,
          newStatus: syncedStatus,
          statusSynchronized:
            statusChanged,
        },
      });
    } else if (
      status !== undefined &&
      status !== oldStatus
    ) {
      // --------------------------------------------------------
      // NORMAL STATUS CHANGE
      // --------------------------------------------------------

      problem.status = status;

      problem.activity.push({
        action: "STATUS_CHANGED",
        description: `Complaint status changed from ${oldStatus} to ${status}.`,
        performedBy: req.user._id,
        metadata: {
          from: oldStatus,
          to: status,
        },
      });
    }

    // ----------------------------------------------------------
    // DUPLICATE REFERENCE
    // ----------------------------------------------------------

    if (
      duplicateOf !== undefined
    ) {
      problem.duplicateOf =
        duplicateOf || undefined;
    }

    // ----------------------------------------------------------
    // SAVE
    // ----------------------------------------------------------

    await problem.save();

    // ----------------------------------------------------------
    // FETCH UPDATED PROBLEM
    // ----------------------------------------------------------

    const updatedProblem =
      await Problem.findById(
        problem._id
      )
        .populate(
          "reportedBy",
          "name email"
        )
        .populate(
          "activity.performedBy",
          "name email role"
        );

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Problem updated successfully.",
      problem: updatedProblem,
    });
  } catch (error) {
    console.error(
      "Update government problem error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update problem.",
      error: error.message,
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createProblem,
  getMyProblems,
  getGovernmentProblems,
  getPublicProblemOverview,
  getProblemById,
  updateGovernmentProblem,
};