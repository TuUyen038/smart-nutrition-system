const fs = require("fs");
const path = require("path");

/**
 * Validate a single recipe against schema
 * @param {Object} recipe - Recipe object
 * @param {number} index - Recipe index
 * @returns {Object} - { valid: boolean, errors: [], warnings: [] }
 */
function validateRecipe(recipe, index) {
  const errors = [];
  const warnings = [];

  // 1️⃣ Check recipe name
  if (!recipe.name && !recipe.title) {
    errors.push("❌ Missing 'name' or 'title'");
  }

  const recipeName = recipe.name || recipe.title || `[Recipe #${index}]`;

  // 2️⃣ Check ingredients array
  if (!recipe.ingredients) {
    errors.push("❌ Missing 'ingredients' array");
    return { valid: false, errors, warnings, recipe: recipeName };
  }

  if (!Array.isArray(recipe.ingredients)) {
    errors.push("❌ 'ingredients' is not an array");
    return { valid: false, errors, warnings, recipe: recipeName };
  }

  if (recipe.ingredients.length === 0) {
    errors.push("⚠️  'ingredients' array is empty");
  }

  // 3️⃣ Check each ingredient
  for (let i = 0; i < recipe.ingredients.length; i++) {
    const ing = recipe.ingredients[i];

    // Required fields
    if (!ing.name || typeof ing.name !== "string" || !ing.name.trim()) {
      errors.push(`  Ingredient #${i}: Missing or empty 'name'`);
    }

    if (!ing.quantity) {
      errors.push(`  Ingredient #${i} (${ing.name}): Missing 'quantity' object`);
      continue;
    }

    // Quantity validation
    const qty = ing.quantity;

    if (
      qty.originalAmount === null ||
      qty.originalAmount === undefined ||
      typeof qty.originalAmount !== "number"
    ) {
      errors.push(
        `  Ingredient #${i} (${ing.name}): Missing or invalid 'originalAmount'`
      );
    }

   
    // Converted amount check
    // Allow both amount and unit to be null (e.g., "salt to taste")
    const amountIsNull = qty.amount === null || qty.amount === undefined;
    const unitIsNull = !qty.unit || typeof qty.unit !== "string";

    if (!amountIsNull || !unitIsNull) {
      // If either amount or unit is provided, both must be valid
      if (
        qty.amount === null ||
        qty.amount === undefined ||
        typeof qty.amount !== "number"
      ) {
        errors.push(
          `  Ingredient #${i} (${ing.name}): Missing or invalid 'amount' (after conversion)`
        );
      } else if (qty.amount <= 0) {
        errors.push(
          `  Ingredient #${i} (${ing.name}): 'amount' must be > 0 (got ${qty.amount})`
        );
      }

      if (!qty.unit || typeof qty.unit !== "string") {
        errors.push(
          `  Ingredient #${i} (${ing.name}): Missing or invalid 'unit' (should be 'g')`
        );
      }
    }
  }

  // 4️⃣ Check instructions
  if (!recipe.instructions) {
    warnings.push("⚠️  Missing 'instructions'");
  } else if (!Array.isArray(recipe.instructions)) {
    errors.push("❌ 'instructions' is not an array");
  } else if (recipe.instructions.length === 0) {
    warnings.push("⚠️  'instructions' array is empty");
  }

  // 5️⃣ Check servings
  if (!recipe.servings || typeof recipe.servings !== "number" || recipe.servings <= 0) {
    warnings.push("⚠️  Missing or invalid 'servings' (default will be 1)");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    recipe: recipeName,
    ingredientCount: recipe.ingredients?.length || 0,
  };
}

/**
 * Main validation
 */
function validateAllRecipes() {
  try {
    console.log("🔍 Loading recipes for validation...\n");

    const recipesPath = path.join(__dirname, "../crawler/savoury/data/recipes.json");

    if (!fs.existsSync(recipesPath)) {
      console.error(`❌ File not found: ${recipesPath}`);
      process.exit(1);
    }

    const recipes = JSON.parse(fs.readFileSync(recipesPath, "utf-8"));
    console.log(`✅ Loaded ${recipes.length} recipes\n`);

    // Validate all
    const results = recipes.map((recipe, index) =>
      validateRecipe(recipe, index)
    );

    // Statistics
    const valid = results.filter((r) => r.valid).length;
    const invalid = results.filter((r) => !r.valid).length;
    const hasWarnings = results.filter((r) => r.warnings.length > 0).length;

    console.log("=" + "=".repeat(70));
    console.log("📊 VALIDATION REPORT");
    console.log("=" + "=".repeat(70));
    console.log(`\n✅ Valid recipes: ${valid}/${recipes.length}`);
    console.log(`❌ Invalid recipes: ${invalid}/${recipes.length}`);
    console.log(`⚠️  Recipes with warnings: ${hasWarnings}/${recipes.length}`);

    // Show invalid recipes
    const invalidRecipes = results.filter((r) => !r.valid);
    if (invalidRecipes.length > 0) {
      console.log("\n" + "=".repeat(70));
      console.log("❌ INVALID RECIPES (Need fixing before mapping)");
      console.log("=".repeat(70));

      invalidRecipes.forEach((result, idx) => {
        console.log(`\n${idx + 1}. "${result.recipe}"`);
        console.log(`   Ingredients: ${result.ingredientCount}`);
        result.errors.forEach((err) => {
          console.log(`   ${err}`);
        });
      });
    }

    // Show recipes with warnings
    const withWarnings = results.filter((r) => r.warnings.length > 0);
    if (withWarnings.length > 0) {
      console.log("\n" + "=".repeat(70));
      console.log("⚠️  RECIPES WITH WARNINGS (Should be OK, but check)");
      console.log("=".repeat(70));

      withWarnings.forEach((result) => {
        console.log(`\n"${result.recipe}"`);
        result.warnings.forEach((warn) => {
          console.log(`   ${warn}`);
        });
      });
    }

    // Export invalid list to file for reference
    if (invalidRecipes.length > 0) {
      const invalidList = invalidRecipes.map((r) => ({
        recipe: r.recipe,
        ingredientCount: r.ingredientCount,
        errors: r.errors,
      }));

      const outputPath = path.join(__dirname, "validation-errors.json");
      fs.writeFileSync(outputPath, JSON.stringify(invalidList, null, 2), "utf-8");
      console.log(`\n💾 Detailed error list saved: validation-errors.json`);
    }

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("📋 SUMMARY");
    console.log("=".repeat(70));
    console.log(`Total recipes: ${recipes.length}`);
    console.log(`✅ Ready for mapping: ${valid}`);
    console.log(`❌ Need fixing: ${invalid}`);
    console.log(`⚠️  Check manually: ${hasWarnings}`);

    if (invalid === 0) {
      console.log("\n✨ All recipes are valid! Ready to run:");
      console.log("   node Data/mapIngredientsAndExportCSV.js\n");
    } else {
      console.log("\n⚠️  Fix invalid recipes before mapping.");
      console.log("   Edit Data/validation-errors.json for details.\n");
    }

    console.log("=" + "=".repeat(70) + "\n");

    process.exit(invalid > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run validation
validateAllRecipes();
