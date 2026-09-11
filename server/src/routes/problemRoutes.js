const express = require("express");

const {
  createProblem,
  getMyProblems,
  getProblemById,
  getGovernmentProblems,
  updateGovernmentProblem,
  getPublicProblemOverview,
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
//
// Exact routes must be registered before dynamic routes like
// "/:id" to avoid route shadowing.
//
// No authentication required.
//
// Used by:
// - JAN-SAMADHAN landing page
// - Public Jharkhand district map
// - Public statistics
// - Public category statistics
// - Recent public complaints
//
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
// GET PROBLEM DETAILS
// ============================================================
//
// Authentication required.
// Controller decides whether the logged-in user
// is allowed to view the problem.
//
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