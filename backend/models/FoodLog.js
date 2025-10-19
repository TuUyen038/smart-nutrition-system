const mongoose = require("mongoose");

const foodLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  // Có thể là món ăn (recipe) hoặc nguyên liệu (ingredient)
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", default: null },
  ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient", default: null },

  // Khối lượng hoặc khẩu phần ăn
  quantity: { type: Number, required: true }, // gram hoặc khẩu phần
  unit: { type: String, default: "g" },

  // Thông tin dinh dưỡng tại thời điểm ăn (snapshot)
  nutrition: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  },

  // Bữa ăn thuộc thời điểm nào trong ngày
  mealType: { 
    type: String, 
    enum: ["breakfast", "lunch", "dinner", "snack"], 
    required: true 
  },

  date: { type: Date, default: Date.now },

}, { timestamps: true });

// Index để tối ưu truy vấn lịch sử người dùng theo ngày
foodLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("FoodLog", foodLogSchema);
