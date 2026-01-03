const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth");

// Public routes (không cần authentication)
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post(
  "/verify-reset-password-otp",
  authController.verifyResetPasswordOTP
);
router.post("/reset-password", authController.resetPassword);
router.post(
  "/resend-reset-password-otp",
  authController.resendResetPasswordOTP
);
router.post("/send-verification-otp", authController.sendVerificationOTP);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification-otp", authController.resendVerificationOTP);

// Protected routes (cần authentication)
router.get("/me", authenticate, authController.getMe);
router.put("/change-password", authenticate, authController.changePassword);

module.exports = router;
