const express = require("express");
const Problem = require("../models/Problems");
const { checkAIHealth, getAIStats } = require("../services/aiService");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AI SERVICE HEALTH
| GET /api/ai/health
|--------------------------------------------------------------------------
| Returns live connectivity status and metadata from Python AI service.
*/
router.get("/health", async (req, res) => {
  try {
    const health = await checkAIHealth();
    return res.status(200).json({
      success: true,
      aiService: health,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking AI service health",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| AI SYSTEM STATS (Admin / System Monitoring)
| GET /api/ai/stats
|--------------------------------------------------------------------------
*/
router.get(
  "/stats",
  protect,
  authorize("admin", "government"),
  async (req, res) => {
    try {
      const stats = await getAIStats(Problem);
      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to load AI system stats",
        error: error.message,
      });
    }
  }
);

module.exports = router;

