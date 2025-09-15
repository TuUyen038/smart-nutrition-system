const { runNER } = require("./hf.service");
const { extractQuantityUnit } = require("../utils/regexParser");

async function parseRecipeText(recipeText) {
  const lines = recipeText.split(/,|\n/).map(l => l.trim()).filter(Boolean);

  const results = [];

  for (let line of lines) {
    const regexResult = extractQuantityUnit(line)[0] || {};
    const nerResult = await runNER(line);

    const ingredientTokens = nerResult
      .filter(ent =>
        ["MISC", "ORG", "PER"].includes(ent.entity_group)
      )
      .map(ent => ent.word);

    results.push({
      quantity: regexResult.quantity || null,
      unit: regexResult.unit || null,
      ingredient: ingredientTokens.join(" ") || regexResult.ingredient || line
    });
  }

  return results;
}

module.exports = { parseRecipeText };
