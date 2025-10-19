const NutritionGoal = require("../models/NutritionGoal");

exports.getByUser = async (req, res) => {
  try {
    const goal = await NutritionGoal.findOne({ userId: req.params.userId });
    if (!goal) {
      return res.status(404).json({ message: "Nutrition goal not found for this user" });
    }
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
