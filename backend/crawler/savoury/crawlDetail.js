const fs = require("fs");
const path = require("path");
const crawlDetail = require("./detail");
//1 quả xoài chín: 250g
// 15 lá chanh: 10g
// 1 quả quất: 8g
//1 trứng cút 9g(ăn được)
//1 hoa hồi khô: 0.25g
//1 thảo quả: 2g
//1 quả chanh: 50g (ăn được)
//1 ớt tươi: 4g
//1 củ sả: 12g (ăn được)
//1 lá nguyệt quế: 0.2g
//1 nhánh gừng: 12g
//1 lòng đỏ trứng gà: 19g
//1 quả bưởi (phần ăn được): 600g
//(trong công thức) ớt 2 quả 7g
//trứng gà (phần ăn được) 50g
//1 lòng đỏ trứng muối 18g
//1 lá lốt: 1.2g

//amout + unit = null: không tính nutriiton của nguyê nlieeu jđó
async function crawlAllDetail() {
  const categoryPath = path.join(__dirname, "data", "category.json");
  const categoryData = JSON.parse(
    fs.readFileSync(categoryPath)
  );

  const fullRecipes = [];

  for (let i = 0; i < 50; i++) {
    const recipe = categoryData[i];

    console.log(`(${i + 1}/${categoryData.length}) Crawling: ${recipe.title}`);

    try {
      const detail = await crawlDetail(recipe.detailUrl);

      fullRecipes.push({
        ...recipe,
        ...detail,
      });

      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.log("❌ Failed:", recipe.title);
    }
  }

  const recipesPath = path.join(__dirname, "data", "recipes.json");
  fs.writeFileSync(
    recipesPath,
    JSON.stringify(fullRecipes, null, 2)
  );

  console.log("✅ Saved to", recipesPath);
}

crawlAllDetail();