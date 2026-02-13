const express = require("express");
const router = express.Router();
const nutritionGoalController = require("../controllers/nutritionGoal.controller");
const { authenticate } = require("../middlewares/auth");

router.use(authenticate);

router.get("/", nutritionGoalController.getAllGoals);
router.get("/active", nutritionGoalController.getActiveGoal);

module.exports = router;
