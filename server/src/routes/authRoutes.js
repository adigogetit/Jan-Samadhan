const express = require("express");

const router = express.Router();

const {signup,login,getMe,logout,googleLogin} = require("../controllers/authController");

const {protect,authorize} = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", googleLogin);
router.get("/me", protect, getMe);

router.get("/test-government",protect,authorize("government"),(req, res) => {
    res.json({
      success: true,
      message: "Government access granted",
      user: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
    });
  }
);

module.exports = router;