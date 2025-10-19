// models/UserMeal.js
const mongoose = require("mongoose");

const userMealSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  recommend_meal_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "RecommendMeal", 
    default: null 
  },

  date: { 
    type: Date, 
    default: Date.now 
  },

  totalCalories: Number,
  totalProtein: Number,
  totalFat: Number,
  totalCarbs: Number,

  // Món ăn mà user thật sự ăn
  recipes: [
    {
      recipe_id: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
      portion: Number,
      mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"] },
      note: String
    }
  ],

  feedback: String,
  status: { 
    type: String, 
    enum: ["completed", "skipped", "planned"], 
    default: "completed" 
  },

  actual: { 
    type: Boolean, 
    default: true 
  }

}, { timestamps: true });

module.exports = mongoose.model("UserMeal", userMealSchema);
