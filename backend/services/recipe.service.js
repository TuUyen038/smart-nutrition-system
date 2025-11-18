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
exports.saveRecipeToDB = async (recipeData) => {
  try {
    const newRecipe = new Recipe({
      ...recipeData,
      verified: recipeData.verified ?? false,
    });

    const savedRecipe = await newRecipe.save();
    console.log(`Đã lưu công thức: ${savedRecipe.name}`);
    return savedRecipe;
  } catch (error) {
    throw new Error("Lỗi khi lưu công thức vào cơ sở dữ liệu: " + error.message);
  }
};
//danh sach mon an
exports.getVerifiedRecipes = async () => {
  try {
    const recipes = await Recipe.find(
      { verified: true },
      { name: 1, "totalNutrition.calories": 1, imageUrl: 1, public_id: 1 } // projection
    );
    return recipes;
  } catch (error) {
    throw new Error(
      "Lỗi khi lấy danh sách công thức đã xác minh: " + error.message
    );
  }
};



