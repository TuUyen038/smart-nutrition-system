const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  calories: Number,
  protein: Number,
  fat: Number,
  carbs: Number,
  fiber: Number,
  sugar: Number,
  sodium: Number,
  unit: String,
  category: {
    type: String,
    enum: [
      "protein",
      "carb",
      "fat",
      "vegetable",
      "fruit",
      "dairy",
      "seasoning",
      "beverage",
      "other",
    ],
    required: true,
  },
});

module.exports = mongoose.model("Ingredient", ingredientSchema);
