const mongoose = require("mongoose");

/**
 * Model Favorite - Lưu snapshot đầy đủ của món ăn yêu thích
 * Mục đích: Giữ nguyên dữ liệu món ăn tại thời điểm favorite,
 * không bị ảnh hưởng khi admin update/delete Recipe
 */
const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
      index: true,
    },
    
    // ✅ SNAPSHOT - Đầy đủ thông tin món ăn tại thời điểm favorite
    recipeSnapshot: {
      name: { type: String, required: true },
      description: { type: String, default: "" },
      category: {
        type: String,
        enum: ["main", "side", "dessert", "drink"],
      },
      imageUrl: String,
      servings: { type: Number, default: 1 },
      
      // Ingredients snapshot
      ingredients: [
        {
          ingredientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
          },
          name: { type: String, required: true },
          quantity: {
            amount: { type: Number, required: true },
            unit: {
              type: String,
              enum: ["g", "kg", "l", "ml", "cup", "tbsp", "tsp", "unit"],
            },
          },
        },
      ],
      
      // Instructions snapshot
      instructions: [String],
      
      // Nutrition snapshot
      totalNutrition: {
        calories: Number,
        protein: Number,
        fat: Number,
        carbs: Number,
        fiber: Number,
        sugar: Number,
        sodium: Number,
      },
      
      // Metadata
      createdBy: {
        type: String,
        enum: ["admin", "user", "ai"],
        default: "admin",
      },
    },
    
    // ✅ Metadata
    snapshotAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Có thể thêm version để track nếu cần
    // snapshotVersion: String, // recipe.updatedAt hoặc recipe._id.getTimestamp()
  },
  { timestamps: true }
);

// Index để query nhanh
favoriteSchema.index({ userId: 1, createdAt: -1 });
favoriteSchema.index({ recipeId: 1 });
favoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true }); // Mỗi user chỉ favorite 1 recipe 1 lần

module.exports = mongoose.model("Favorite", favoriteSchema);

