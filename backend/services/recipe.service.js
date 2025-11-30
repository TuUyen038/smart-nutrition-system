const Recipe = require("../models/Recipe");
const { searchByName } = require("../utils/search.util");
const Ingredient = require("../models/Ingredient");

const escapeRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
exports.searchRecipesByIngredientName = async (keyword, options = {}) => {
  const page = Number(options.page) > 0 ? Number(options.page) : 1;
  const limit = Number(options.limit) > 0 ? Number(options.limit) : 10;
  const skip = (page - 1) * limit;

  if (!keyword || !keyword.trim()) {
    return {
      recipes: [],
      total: 0,
      page,
      limit,
    };
  }

  const cleanKeyword = keyword.trim();
  const regex = new RegExp(escapeRegex(cleanKeyword), "i"); // "i" = không phân biệt hoa thường

  const query = {
    "ingredients.name": regex,
  };

  const total = await Recipe.countDocuments(query);

  const recipes = await Recipe.find(query)
    .select("name description category imageUrl totalNutrition ingredients")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    recipes,
    total,
    page,
    limit,
  };
};

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
    throw new Error(
      "Lỗi khi lưu công thức vào cơ sở dữ liệu: " + error.message
    );
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
