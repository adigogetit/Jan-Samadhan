const express = require("express");

const {
  getUniversityDashboard,
  getUniversityProblems,
  getUniversityProblemById,
  acceptProblem,
} = require("../controllers/universityController");

const {
  acceptProjectInterest,
  rejectProjectInterest,
} = require("../controllers/projectController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| University Authentication
|--------------------------------------------------------------------------
*/

router.use(protect);
router.use(authorize("university"));

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  getUniversityDashboard
);

/*
|--------------------------------------------------------------------------
| Problems
|--------------------------------------------------------------------------
*/

router.get(
  "/problems",
  getUniversityProblems
);

router.get(
  "/problems/:id",
  getUniversityProblemById
);

/*
|--------------------------------------------------------------------------
| Accept Problem
|--------------------------------------------------------------------------
*/

router.post(
  "/problems/:id/accept",
  acceptProblem
);

/*
|--------------------------------------------------------------------------
| Manage Industry / Investor Interests
|--------------------------------------------------------------------------
*/

router.patch(
  "/interests/:id/accept",
  acceptProjectInterest
);

router.patch(
  "/interests/:id/reject",
  rejectProjectInterest
);

module.exports = router;
