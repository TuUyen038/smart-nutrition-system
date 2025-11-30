const mongoose = require("mongoose");

const nutritionGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  targetNutrition: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number,
  },
  
  status: { type: String, enum: ["active", "archived"], default: "active" },
  period: { type: String, enum: ["day", "week", "month", "custom"], default: "day" },
  periodValue: { type: Number, default: 1 }, // số ngày nếu là custom
}, { timestamps: true });

module.exports = mongoose.model("NutritionGoal", nutritionGoalSchema);
