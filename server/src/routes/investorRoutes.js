const express = require("express");
const {
  getInvestorDashboard,
  getInvestorProjects,
  getInvestorProjectById,
  expressProjectInterest,
  getInvestorInterests,
  withdrawProjectInterest,
} = require("../controllers/investorController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Guard all investor routes
router.use(protect);
router.use(authorize("investor"));

// Dashboard
router.get("/dashboard", getInvestorDashboard);

// Projects Discovery
router.get("/projects", getInvestorProjects);
router.get("/projects/:id", getInvestorProjectById);
router.post("/projects/:id/interest", expressProjectInterest);

// Interests Management
router.get("/interests", getInvestorInterests);
router.patch("/interests/:id/withdraw", withdrawProjectInterest);

module.exports = router;
