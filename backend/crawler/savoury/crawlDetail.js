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
//1 củ hành khô: 20g
//amout + unit = null: không tính nutriiton của nguyê nlieeu jđó
//đùi tỏi gà: 80g ăn được
//1 nấm hương khô: 5g
//1 nấm hương tươi: 20g
//1 tép tỏi: 4g
//1 củ gừng: 20
//1 củ hành tây: 200g
//1 cây tỏi tây: 150g
//1 cuộn mì trứng: 50g
//2 cây hành lá: 15g
//1 cây thìa là: 4g
//1 củ cà rốt; 100g


//bỏ bánh trung thu, bánh dẻo lạnh singapore, [VIDEO] Cách làm thịt bò khô chuẩn vị..., Giò bò, chả lụa, chả cốm, chả cá mực(có thể tham khảo Giò lụa để hoàn thành),
//Thịt bò ướt dẻo - Ô mai bò, Chè Bobo Chacha, chín tầng mây
async function crawlAllDetail() {
  const categoryPath = path.join(__dirname, "data", "category.json");
  const categoryData = JSON.parse(
    fs.readFileSync(categoryPath)
  );

  const fullRecipes = [];

  for (let i = 50; i < 119; i++) {
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