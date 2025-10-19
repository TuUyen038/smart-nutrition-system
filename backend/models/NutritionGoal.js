const mongoose = require("mongoose");

const nutritionGoalSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  calories_target: Number,
  protein_target: Number,
  fat_target: Number,
  carb_target: Number,
  fiber_target: Number,
  sugar_limit: Number,
  sodium_limit: Number,
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  period: { type: String, enum: ["day", "week", "month"], default: "week" },
}, { timestamps: true });

module.exports = mongoose.model("NutritionGoal", nutritionGoalSchema);
