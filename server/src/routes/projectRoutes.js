const express = require("express");

const {
  createProject,
  getUniversityProjects,
  getUniversityProjectById,
  updateProjectStatus,
  getEligibleFaculty,
  getEligibleStudents,
  updateFacultyLead,
  removeFacultyLead,
  addProjectStudents,
  removeProjectStudent,
  getProjectInterests,
  acceptProjectInterest,
  rejectProjectInterest,
} = require("../controllers/projectController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// UNIVERSITY AUTH
// ============================================================

router.use(protect);
router.use(authorize("university"));

// ============================================================
// PROJECT ROUTES
// ============================================================

router.post("/", createProject);

router.get("/", getUniversityProjects);

router.get("/faculty", getEligibleFaculty);
router.get("/students", getEligibleStudents);

router.get("/:id", getUniversityProjectById);

router.patch("/:id/faculty", updateFacultyLead);
router.delete("/:id/faculty", removeFacultyLead);
router.patch("/:id/students", addProjectStudents);
router.delete("/:id/students/:studentId", removeProjectStudent);

// ============================================================
// INDUSTRY / INVESTOR PARTNERSHIP INTERESTS
// ============================================================

router.get("/:id/interests", getProjectInterests);
router.patch("/:id/interests/:interestId/accept", acceptProjectInterest);
router.patch("/:id/interests/:interestId/reject", rejectProjectInterest);

// ============================================================
// UPDATE PROJECT STATUS
// PATCH /api/university/projects/:id/status
// ============================================================

router.patch("/:id/status", updateProjectStatus);

module.exports = router;
