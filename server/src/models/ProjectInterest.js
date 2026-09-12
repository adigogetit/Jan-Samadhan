const mongoose = require("mongoose");

const projectInterestSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    organizationName: {
      type: String,
      trim: true,
      default: "",
    },

    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    supportType: {
      type: String,
      enum: [
        "Mentorship",
        "Technical Support",
        "Industry Collaboration",
        "Resources",
        "Funding Interest",
        "Pilot Support",
        "Other",
      ],
      default: "Other",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "Withdrawn",
      ],
      default: "Pending",
      index: true,
    },

    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active interest requests per investor per project
projectInterestSchema.index({ project: 1, investor: 1 }, { unique: true });

const ProjectInterest = mongoose.model("ProjectInterest", projectInterestSchema);

module.exports = ProjectInterest;
