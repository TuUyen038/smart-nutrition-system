const Recipe = require("../models/recipe.model");
const { searchByName } = require("../utils/search.util");

exports.searchRecipes = async (name) => {
  return await searchByName(Recipe, name);
};
