const express = require("express");
const router = express.Router();

// Import các router con
const userRoutes = require("./user.routes");
const ingredientRoutes = require("./ingredient.routes");
const nutritionGoalRoutes = require("./nutritionGoal.routes");
const mealRoutes = require("./meal.routes");
const mealPlanRoutes = require("./mealPlan.routes");
const recipeRoutes = require("./recipe.routes");
const uploadImageRoutes = require("./uploadImage.routes");

router.use("/users", userRoutes);
router.use("/ingredients", ingredientRoutes);
router.use("/nutrition-goal", nutritionGoalRoutes);
router.use("/meals", mealRoutes);
router.use("/meal-plans", mealPlanRoutes);
router.use("/recipes", recipeRoutes);
router.use("/upload-image", uploadImageRoutes);
// Export router tổng
module.exports = router;
