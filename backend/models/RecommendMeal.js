// models/RecommendMeal.js
const mongoose = require("mongoose");

const recommendMealSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  period: { 
    type: String, 
    enum: ["day", "week"], 
    default: "day" 
  },

  startDate: Date,
  endDate: Date,

  // Tổng năng lượng
  totalCalories: Number,

  // Danh sách món ăn được gợi ý
  recipes: [
    {
      recipe_id: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
      portion: Number,  // khẩu phần ăn
      mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"] },
      note: String
    }
  ],

  status: { 
    type: String, 
    enum: ["suggested", "accepted", "rejected"], 
    default: "suggested" 
  },

  source: { type: String, default: "ai" },
  generatedBy: { type: String, default: "nutrition_ai_v1" }

}, { timestamps: true });

module.exports = mongoose.model("RecommendMeal", recommendMealSchema);
