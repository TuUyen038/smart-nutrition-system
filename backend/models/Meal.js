const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  mealPlanId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "MealPlan", 
    default: null 
  },

  source: { 
    type: String, 
    enum: ["ai", "user"], 
    default: "user" 
  },

  generatedBy: { type: String, default: null },

  // ngày áp dụng (ví dụ: 2025-10-19)
  date: { 
    type: Date, 
    required: true 
  },

  totalNutrition: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number,
  },

  mealType: { 
        type: String, 
        enum: ["breakfast", "lunch", "dinner", "snack"], 
        required: true 
  },

  recipes: [
    {
      recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
      portion: Number,
      note: String,
    },
  ],

  //id cua meal duoc goi y ban dau
  originalMealId: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: "Meal", 
  default: null 
  },

  status: { 
    type: String, 
    enum: ["suggested", "selected", "completed", "skipped", "edited", "archived_suggestion"], 
    default: "suggested" 
  },

  feedback: String,

}, { timestamps: true });

mealSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Meal", mealSchema);
