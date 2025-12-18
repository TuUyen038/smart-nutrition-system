const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, enum: ["main", "side", "dessert", "drink"] },

    instructions: [String],
    ingredients: [
      {
        ingredientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
          required: false, // mapping xong mới có
        },
        quantity: {
          amount: { type: Number, required: true }, // cho phép null thì không cần required
          unit: {
            type: String,
            enum: ["g", "kg", "l", "ml", "cup", "tbsp", "tsp", "unit"],
          },
        },
        // tên nguyên liệu (thô hoặc theo Ingredient)
        name: { type: String, required: true, trim: true },
      },
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
    public_id: String,
    createdBy: {
      type: String,
      enum: ["admin", "user", "ai"],
      default: "admin",
    },
    verified: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },

  },
  { timestamps: true }
);

recipeSchema.index({ name: "text" }); // Index dạng text cho tìm kiếm toàn văn (nếu cần)
recipeSchema.index({ ownerId: 1 }); // Index đơn giản cho tìm kiếm theo ID
recipeSchema.index({ category: 1 }); // Index đơn giản cho bộ lọc danh mục
recipeSchema.index({ "ingredients.ingredientId": 1 });

module.exports = mongoose.model("Recipe", recipeSchema);
