const express = require("express");
const router = express.Router();
const nutritionGoalController = require("../controllers/nutritionGoal.controller");

// GET /api/nutrition-goal/:userId
router.get("/:userId", nutritionGoalController.getByUser);

module.exports = router;
