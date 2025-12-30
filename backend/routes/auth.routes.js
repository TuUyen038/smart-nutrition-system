const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth");

// Public routes (không cần authentication)
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes (cần authentication)
router.get("/me", authenticate, authController.getMe);
router.put("/change-password", authenticate, authController.changePassword);

module.exports = router;

