const Ingredient = require("../models/Ingredient");

/**
 * Convert quantity to grams
 */
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

/**
 * Calculate total nutrition for a recipe from its ingredients
 */
async function calculateRecipeNutrition(ingredients, servings = 1) {
  const totalNutrition = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return totalNutrition;
  }

  // Process each ingredient
  for (const ing of ingredients) {
    // Skip if no ingredientId (not mapped to DB)
    if (!ing.ingredientId) {
      continue;
    }

    // Skip if no quantity
    if (!ing.quantity || !ing.quantity.amount || ing.quantity.amount <= 0) {
      continue;
    }

    try {
      // Fetch ingredient from DB
      const ingredientDoc = await Ingredient.findById(ing.ingredientId);
      if (!ingredientDoc || !ingredientDoc.nutrition) {
        continue;
      }

      // Convert quantity to grams
      const amountInGrams = convertToGrams(
        ing.quantity.amount,
        ing.quantity.unit
      );
      if (amountInGrams <= 0) {
        continue;
      }

      // Calculate factor (nutrition is per 100g)
      const factor = amountInGrams / 100;

      // Add nutrition values
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
      // Continue with next ingredient
      continue;
    }
  }

  // Round to 2 decimal places
  for (const key in totalNutrition) {
    totalNutrition[key] = Math.round(totalNutrition[key] * 100) / 100;
  }

  return totalNutrition;
}

module.exports = {
  calculateRecipeNutrition,
  convertToGrams,
};
