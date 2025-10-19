const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ["main", "side", "dessert", "drink"] },
  instruction: String,
  totalCalories: Number,
  totalProtein: Number,
  totalFat: Number,
  totalCarbs: Number,
  totalFiber: Number,
  totalSugar: Number,
  totalSodium: Number,
  image_url: String,
  tags: [String],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Recipe", recipeSchema);
