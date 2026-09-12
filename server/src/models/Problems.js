const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Roads & Transport",
        "Water & Sanitation",
        "Electricity",
        "Healthcare",
        "Education",
        "Agriculture",
        "Environment",
        "Public Safety",
        "Waste Management",
        "Other",
      ],
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    block: {
      type: String,
      trim: true,
    },

    location: {
      address: {
        type: String,
        trim: true,
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },

    images: [
      {
        type: String,
      },
    ],

    videos: [
      {
        type: String,
      },
    ],

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ========================================================
    // COMPLAINT STATUS
    // ========================================================

    status: {
      type: String,
      enum: [
        "Pending",
        "Under Review",
        "Validated",
        "In Progress",
        "Resolved",
        "Rejected",
        "Duplicate",
      ],
      default: "Pending",
    },

    // ========================================================
    // PRIORITY
    // ========================================================

    priority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical",
      ],
      default: "Medium",
    },

    // ========================================================
    // AUTOMATIC GOVERNMENT DEPARTMENT
    // ========================================================

    governmentDepartment: {
      type: String,
      trim: true,
    },

    // ========================================================
    // ACTIVITY TIMELINE
    // ========================================================

    activity: [
      {
        action: {
          type: String,
          required: true,
        },

        description: {
          type: String,
          required: true,
        },

        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        metadata: {
          type: mongoose.Schema.Types.Mixed,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ========================================================
    // VALIDATION
    // ========================================================

    validationStatus: {
      type: String,
      enum: [
        "Pending",
        "Validated",
        "Rejected",
        "Duplicate",
      ],
      default: "Pending",
    },

    // Only these AI-selected university accounts may view and claim the problem.
    targetUniversities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Atomically set when the first targeted university accepts the problem.
    acceptedUniversity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // ========================================================
    // AI FIELDS
    // ========================================================

    aiCategory: {
      type: String,
      trim: true,
    },

    aiPriority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical",
      ],
    },

    aiLanguage: {
      type: String,
      trim: true,
    },

    aiUrgency: {
      type: String,
      trim: true,
    },

    aiMatchedKeywords: {
      type: mongoose.Schema.Types.Mixed,
    },

    aiAnalysis: {
      status: {
        type: String,
        enum: ["Pending", "Processing", "Completed", "Failed"],
        default: "Pending",
      },
      analyzedAt: {
        type: Date,
      },
      error: {
        type: String,
      },
      routingType: {
        type: String,
      },
      structuredProblem: {
        type: mongoose.Schema.Types.Mixed,
      },
      deterministicPriority: {
        type: mongoose.Schema.Types.Mixed,
      },
      universityMatching: {
        type: mongoose.Schema.Types.Mixed,
      },
      universityMatches: [
        {
          type: mongoose.Schema.Types.Mixed,
        },
      ],
    },

    // ========================================================
    // DUPLICATE REFERENCE
    // ========================================================

    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Problem",
  problemSchema
);
