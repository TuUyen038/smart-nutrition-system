const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: { type: String, required: true, trim: true },
    totalWeight: Number,
    source: {
      type: String,
      // enum: ["savoury", "usda", "fatsecret", "manual"],
      required: true,
      default: "savoury",
      index: true,
    },

    version: {
      type: Number,
      required: true,
      default: 2,
      index: true,
    },

    description: { type: String, trim: true },
    category: {
      type: String,
      enum: [
        "main", // món chính
        "side", // món phụ
        "soup", // canh, súp

        "breakfast", // món ăn sáng
        "lunch", // món ăn trưa
        "dinner", // món ăn tối

        "snack", // ăn vặt
        "dessert", // món tráng miệng
        "drink", // đồ uống

        "salad", // salad
        "sauce", // nước sốt

        "baked", // món nướng, bánh
        "fried", // món chiên
        "steamed", // hấp
        "boiled", // luộc

        "vegetarian", // chay
      ],
    },

    instructions: [String],
    ingredients: [
      {
        ingredientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
        },
        quantity: {
          amount: { type: Number, required: true },
          unit: {
            type: String,
            enum: ["g"],
          },
          originalAmount: Number,
          originalUnit: String,
        },
        note: String,
        name: { type: String, required: true, trim: true },
        rawName: String,
      },
    ],

    servings: { type: Number},

    totalNutrition: {
      calories: Number,
      protein: Number,
      fat: Number,
      carbs: Number,
      fiber: Number,
      sugar: Number,
      sodium: Number,
    },

    totalNutritionPerServing: {
      calories: Number,
      protein: Number,
      fat: Number,
      carbs: Number,
      fiber: Number,
      sugar: Number,
      sodium: Number,
    },

    totalNutritionPer100g: {
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
    verified: { type: Boolean, default: true },
    // isPublic: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false }, // Soft delete
  },
  { timestamps: true },
);

recipeSchema.index({ name: "text" }); // Index dạng text cho tìm kiếm toàn văn (nếu cần)
recipeSchema.index({ ownerId: 1 }); // Index đơn giản cho tìm kiếm theo ID
recipeSchema.index({ category: 1 }); // Index đơn giản cho bộ lọc danh mục
recipeSchema.index({ "ingredients.ingredientId": 1 });

module.exports = mongoose.model("Recipe", recipeSchema);
