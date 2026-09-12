const express = require("express");

const {
  createProblem,
  getMyProblems,
  getProblemById,
  getGovernmentProblems,
  updateGovernmentProblem,
  getPublicProblemOverview,
  rerunAIAnalysis,
} = require("../controllers/problemController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// ============================================================
// CITIZEN CREATES A PROBLEM
// ============================================================

router.post(
  "/",
  protect,
  authorize("citizen"),
  upload.array("media", 8),
  createProblem
);

// ============================================================
// PUBLIC CIVIC DATA
// ============================================================

router.get("/public", getPublicProblemOverview);
router.get("/public/overview", getPublicProblemOverview);

// ============================================================
// CITIZEN GETS THEIR OWN PROBLEMS
// ============================================================

router.get(
  "/my",
  protect,
  authorize("citizen"),
  getMyProblems
);

// ============================================================
// GOVERNMENT GETS ALL PROBLEMS
// ============================================================

router.get(
  "/",
  protect,
  authorize("government"),
  getGovernmentProblems
);

// ============================================================
// GOVERNMENT UPDATES A PROBLEM
// ============================================================

router.patch(
  "/:id/government",
  protect,
  authorize("government"),
  updateGovernmentProblem
);

// ============================================================
// RE-RUN AI ANALYSIS
// ============================================================

router.post(
  "/:id/analyze",
  protect,
  authorize("government", "admin"),
  rerunAIAnalysis
);

// ============================================================
// GET PROBLEM DETAILS
// ============================================================

router.get(
  "/:id",
  protect,
  getProblemById
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;