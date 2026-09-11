const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    passwordHash: {
      type: String,
      default: null,
    },

    googleId: {
      type: String,
      default: null,
      index: true,
    },

    role: {
      type: String,
      enum: [
        "citizen",
        "government",
        "university",
        "student",
        "investor",
        "admin",
      ],
      required: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },

    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      default: null,
    },

    department: {
      type: String,
      trim: true,
      default: null,
    },

    district: {
      type: String,
      trim: true,
      default: null,
    },

    state: {
      type: String,
      default: "Jharkhand",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;