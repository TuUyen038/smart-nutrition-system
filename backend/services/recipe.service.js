const Recipe = require("../models/Recipe");
const { searchByName } = require("../utils/search.util");

exports.searchRecipes = async (name) => {
  return await searchByName(Recipe, name);
};

exports.getRecipeById = async (id) => {
  return await Recipe.findById(id);
};

exports.createRecipe = async (recipe) => {
  return await Recipe.create(recipe);
};
// Ví dụ: file services/recipeService.js hoặc đặt ngay bên trên controller
exports.saveRecipeToDB = async (recipeData) => {
  const { name, description = null, category = null, instructions, ingredients, totalNutrition = null, createdBy, verified = false } = recipeData;

  try {
    const newRecipe = new Recipe({ // Giả sử Recipe đã được import
      name,
      description,
      category,
      instructions,
      ingredients,
      totalNutrition,
      createdBy,
      verified
    });

    const savedRecipe = await newRecipe.save();
    console.log(`✅ Đã lưu công thức chờ duyệt: ${savedRecipe.name}`);
    return savedRecipe;
  } catch (error) {
    console.error("🚨 Lỗi khi lưu công thức vào DB:", error);
    // Bạn có thể chọn re-throw lỗi hoặc chỉ log và trả về null/false
    throw new Error("Lỗi khi lưu công thức vào cơ sở dữ liệu.");
  }
};