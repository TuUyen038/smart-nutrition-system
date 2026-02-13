const NutritionGoal = require("../models/NutritionGoal");

exports.getAllGoals = async (req, res) => {
  try {
    const goal = await NutritionGoal.find({ userId: req.user._id });
    if (!goal) {
      return res
        .status(404)
        .json({ message: "Nutrition goal not found for this user" });
    }
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getActiveGoal = async (req, res) => {
  try {
    const goal = await NutritionGoal.findOne({
      userId: req.user._id,
      status: "active",
    }).sort({ createdAt: -1 });

    if (!goal) {
      return res.status(404).json({
        message: "No active nutrition goal found",
      });
    }

    res.status(200).json(goal);
  } catch (error) {
    console.error("Error fetching active nutrition goal:", error);
    res.status(500).json({
      message: "Server error while fetching active goal",
    });
  }
};
