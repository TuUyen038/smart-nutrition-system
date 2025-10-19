const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: Number,
  protein: Number,
  fat: Number,
  carbs: Number,
  fiber: Number,
  sugar: Number,
  sodium: Number,
  unit: String,
  category: String
});

module.exports = mongoose.model("Ingredient", ingredientSchema);
