const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    // Original civic problem
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    // University that owns the project
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    objective: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    proposedSolution: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      default: null,
    },

    district: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Planning",
        "Development",
        "Testing",
        "Pilot",
        "Deployment",
        "Completed",
        "Cancelled",
      ],
      default: "Planning",
      index: true,
    },

    // Project team will be added later.
    facultyLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    acceptedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    industryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    startDate: {
      type: Date,
      default: null,
    },

    expectedCompletionDate: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    activityTimeline: [
      {
        action: {
          type: String,
          required: true,
        },

        description: {
          type: String,
          default: "",
        },

        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },

        metadata: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

projectSchema.index({
  university: 1,
  status: 1,
});

projectSchema.index({
  problem: 1,
});

projectSchema.index({
  students: 1,
});

projectSchema.index({
  industryPartner: 1,
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;

