const fs = require("fs");
const path = require("path");
const crawlCategory = require("./category");

async function crawlAllCategory() {
  let page = 1;
  let allRecipes = [];

  while (true) {
    const recipes = await crawlCategory(page);

    if (!recipes.length) {
      console.log("No more pages. Stop.");
      break;
    }

    allRecipes.push(...recipes);

    // delay 800ms tránh block
    await new Promise((r) => setTimeout(r, 800));

    page++;
  }

  console.log("====================================");
  console.log("TOTAL RECIPES:", allRecipes.length);

  const dataPath = path.join(__dirname, "data", "category.json");
  fs.writeFileSync(
    dataPath,
    JSON.stringify(allRecipes, null, 2)
  );

  console.log("Saved to", dataPath);
}

crawlAllCategory();