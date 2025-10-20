const express = require("express");
const router = express.Router();

// Import các router con
const userRoutes = require("./user.routes");
const ingredientRoutes = require("./ingredient.routes");
const nutritionGoalRoutes = require("./nutritionGoal.routes");
const mealRoutes = require("./meal.routes");

router.use("/users", userRoutes);
router.use("/ingredients", ingredientRoutes);
router.use("/nutrition-goal", nutritionGoalRoutes);
router.use("/meals", mealRoutes);

// Export router tổng
module.exports = router;
