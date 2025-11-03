const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: String, enum: ["main", "side", "dessert", "drink"] },

  instructions: [String],
  ingredients: [ 
    {
      ingredientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Ingredient", 
        // required: true 
      },
      quantity: {
        amount: { type: Number, required: false },
        unit: { type: String, enum: ['g', 'kg','l', 'ml', 'cup', 'tbsp', 'tsp', 'unit'], required: false }, 
      },
      name: { type: String, required: false, trim: true },
    }
  ],

  servings: { type: Number, default: 1 },

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
  createdBy: { type: String, enum: ["admin", "user", "ai"] },
  verified: { type: Boolean, default: false },


  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

recipeSchema.index({ name: 'text' }); // Index dạng text cho tìm kiếm toàn văn (nếu cần)
recipeSchema.index({ ownerId: 1 }); // Index đơn giản cho tìm kiếm theo ID
recipeSchema.index({ category: 1 }); // Index đơn giản cho bộ lọc danh mục

recipeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Recipe", recipeSchema);
