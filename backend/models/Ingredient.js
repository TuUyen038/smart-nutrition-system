const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  name_en: { type: String, required: false, trim: true },
  nutrition: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number,
  },
  unit: { type: String, default: "g" },
  category: {
    type: String,
    enum: ["protein", "carb", "fat", "vegetable", "fruit", "dairy", "seasoning", "beverage", "other"],
    default: "other",
  }

});

module.exports = mongoose.model("Ingredient", ingredientSchema);
