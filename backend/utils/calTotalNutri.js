const Recipe = require('../models/Recipe');

exports.calculateTotalNutrition = async recipes => {
  let totalNutrition = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  if (!recipes?.length) return totalNutrition;

  for (const item of recipes) {
    const recipe = await Recipe.findById(item.recipeId);
    if (!recipe?.totalNutrition) continue;

    const portion = item.portion || 1;

    for (const key in totalNutrition) {
      totalNutrition[key] += (recipe.totalNutrition[key] || 0) * portion;
    }
  }

  for (const key in totalNutrition) {
    totalNutrition[key] = parseFloat(totalNutrition[key].toFixed(2));
  }

  return totalNutrition;
};
