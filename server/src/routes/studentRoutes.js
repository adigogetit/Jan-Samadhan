const express = require("express");
const {
  getStudentDashboard,
  getStudentProjects,
  getStudentProjectById,
  acceptProjectAssignment,
} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Enforce student role for all routes in this router
router.use(protect);
router.use(authorize("student"));

// Student Dashboard
router.get("/dashboard", getStudentDashboard);

// Student Projects
router.get("/projects", getStudentProjects);
router.get("/projects/:id", getStudentProjectById);
router.post("/projects/:id/accept", acceptProjectAssignment);

module.exports = router;
