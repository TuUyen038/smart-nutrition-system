const mongoose = require("mongoose");

const nutritionGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  caloriesTarget: Number,
  proteinTarget: Number,
  fatTarget: Number,
  carbTarget: Number,
  fiberTarget: Number,
  sugarLimit: Number,
  sodiumLimit: Number,

  status: { type: String, enum: ["active", "archived"], default: "active" },
  period: { type: String, enum: ["day", "week", "month", "custom"], default: "day" },
  periodValue: { type: Number, default: 7 }, // số ngày nếu là custom
}, { timestamps: true });

module.exports = mongoose.model("NutritionGoal", nutritionGoalSchema);
