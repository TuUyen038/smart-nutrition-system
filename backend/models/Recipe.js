const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: String, enum: ["main", "side", "dessert", "drink"] },

  instructions: [String],

  servings: { type: Number, default: 1 },
  cookTime: Number,
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },

  totalNutrition: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number,
  },

  imageUrl: String,
  tags: [String],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

recipeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Recipe", recipeSchema);
