const mongoose = require("mongoose");

const universityAcceptanceSchema = new mongoose.Schema(
  {
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true,
    },

    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["Accepted", "Withdrawn"],
      default: "Accepted",
    },

    note: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    acceptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One university can accept a particular problem only once.
universityAcceptanceSchema.index(
  { problem: 1, university: 1 },
  { unique: true }
);

const UniversityAcceptance = mongoose.model(
  "UniversityAcceptance",
  universityAcceptanceSchema
);

module.exports = UniversityAcceptance;
