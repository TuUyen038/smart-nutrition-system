const express = require("express");
const router = express.Router();

// Import các router con
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const ingredientRoutes = require("./ingredient.routes");
const nutritionGoalRoutes = require("./nutritionGoal.routes");
const dailyMenuRoutes = require("./dailyMenu.routes");
const mealPlanRoutes = require("./mealPlan.routes");
const recipeRoutes = require("./recipe.routes");
const uploadImageRoutes = require("./uploadImage.routes");
const auditLogRoutes = require("./auditLog.routes");

// Public routes (không cần authentication)
router.use("/auth", authRoutes);

// Protected routes (cần authentication)
router.use("/users", userRoutes);
router.use("/ingredients", ingredientRoutes);
router.use("/nutrition-goal", nutritionGoalRoutes);
router.use("/daily-menu", dailyMenuRoutes);
router.use("/meal-plans", mealPlanRoutes);
router.use("/recipes", recipeRoutes);
router.use("/upload-image", uploadImageRoutes);

// Admin only routes
router.use("/audit-logs", auditLogRoutes);

// Export router tổng
module.exports = router;
