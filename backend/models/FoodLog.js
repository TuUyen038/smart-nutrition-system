const mongoose = require("mongoose");

const foodLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recipe_id: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
  ingre_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" },
  quantity: Number,
  date: Date,
  totalCalories: Number
});

module.exports = mongoose.model("FoodLog", foodLogSchema);
