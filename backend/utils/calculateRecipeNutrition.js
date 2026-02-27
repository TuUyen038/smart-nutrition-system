const Ingredient = require("../models/Ingredient");

function convertToGrams(amount, unit) {
  if (!amount || amount <= 0) return 0;

  const unitLower = (unit || "g").toLowerCase();

  switch (unitLower) {
    case "kg":
      return amount * 1000;
    case "mg":
      return amount / 1000;
    case "l":
      return amount * 1000; // Assuming 1L = 1000g for liquids (approximate)
    case "ml":
      return amount; // Assuming 1ml = 1g for liquids (approximate)
    case "tbsp":
    case "muỗng":
      return amount * 15; // 1 tablespoon ≈ 15g
    case "tsp":
      return amount * 5; // 1 teaspoon ≈ 5g
    case "cup":
      return amount * 240; // 1 cup ≈ 240g (approximate)
    case "unit":
      return amount * 100; // Default: 1 unit = 100g (can be adjusted)
    case "g":
    default:
      return amount;
  }
}

async function calculateRecipeNutrition(ingredients, servings) {
  const totalNutrition = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  let totalWeight = 0;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return {
      totalNutrition,
      totalNutritionPer100g: null,
      totalNutritionPerServing: null,
      totalWeight: 0,
    };
  }

  // Process each ingredient
  for (const ing of ingredients) {
    if (!ing.ingredientId) continue;

    if (!ing.quantity?.amount || ing.quantity.amount <= 0) continue;

    try {
      const ingredientDoc = await Ingredient.findById(ing.ingredientId);

      if (!ingredientDoc?.nutrition) continue;

      const amountInGrams = convertToGrams(
        ing.quantity.amount,
        ing.quantity.unit
      );

      if (amountInGrams <= 0) continue;

      totalWeight += amountInGrams;

      const factor = amountInGrams / 100;
      const nutrition = ingredientDoc.nutrition;

      totalNutrition.calories += (nutrition.calories || 0) * factor;
      totalNutrition.protein += (nutrition.protein || 0) * factor;
      totalNutrition.fat += (nutrition.fat || 0) * factor;
      totalNutrition.carbs += (nutrition.carbs || 0) * factor;
      totalNutrition.fiber += (nutrition.fiber || 0) * factor;
      totalNutrition.sugar += (nutrition.sugar || 0) * factor;
      totalNutrition.sodium += (nutrition.sodium || 0) * factor;

    } catch (error) {
      console.error(
        `Error calculating nutrition for ingredient ${ing.ingredientId}:`,
        error
      );
    }
  }

  // ---------- ROUND TOTAL ----------
  for (const key in totalNutrition) {
    totalNutrition[key] =
      Math.round(totalNutrition[key] * 100) / 100;
  }

  // ---------- CALCULATE PER 100g ----------
  let totalNutritionPer100g = null;

  if (totalWeight > 0) {
    totalNutritionPer100g = {};

    for (const key in totalNutrition) {
      totalNutritionPer100g[key] =
        Math.round((totalNutrition[key] * 100 / totalWeight) * 100) / 100;
    }
  }

  // ---------- CALCULATE PER SERVING ----------
  let totalNutritionPerServing = null;

  if (servings && servings > 0) {
    totalNutritionPerServing = {};

    for (const key in totalNutrition) {
      totalNutritionPerServing[key] =
        Math.round((totalNutrition[key] / servings) * 100) / 100;
    }
  }

  return {
    totalNutrition,
    totalNutritionPer100g,
    totalNutritionPerServing,
    totalWeight: Math.round(totalWeight * 100) / 100,
  };
}

module.exports = {
  calculateRecipeNutrition,
  convertToGrams,
};
