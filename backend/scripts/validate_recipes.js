const path = require("path");
const fs = require("fs");

// Danh sách category hợp lệ
const VALID_CATEGORIES = [
  "main", "side", "soup", "breakfast", "lunch", "dinner",
  "snack", "dessert", "drink", "salad", "sauce", "baked",
  "fried", "steamed", "boiled", "vegetarian"
];

function validateRecipe(recipe) {
  const errors = [];
  if (!recipe.name?.trim()) errors.push("Thiếu tên món ăn");
  if (recipe.serving !== undefined && (typeof recipe.serving !== "number" || recipe.serving < 1 || recipe.serving > 100))
    errors.push("Khẩu phần phải là số từ 1 đến 100");
  if (recipe.category && !VALID_CATEGORIES.includes(recipe.category))
    errors.push(`Danh mục không hợp lệ: ${recipe.category}`);
  if (!Array.isArray(recipe.ingredients)) errors.push("Nguyên liệu phải là mảng");
  (recipe.ingredients || []).forEach((ing, idx) => {
    if (!ing.name?.trim()) errors.push(`Nguyên liệu thứ ${idx + 1} thiếu tên`);
    if (ing.quantity) {
      if (ing.quantity.unit !== "g") errors.push(`Nguyên liệu '${ing.name}' đơn vị không hợp lệ: ${ing.quantity.unit}`);
      if (typeof ing.quantity.amount !== "number" || isNaN(ing.quantity.amount)) errors.push(`Nguyên liệu '${ing.name}' số lượng không hợp lệ: ${ing.quantity.amount}`);
    } else {
      errors.push(`Nguyên liệu '${ing.name}' thiếu thông tin số lượng`);
    }
  });
  return errors;
}

function main() {
  const filePath = path.join(__dirname, "../crawler/savoury/data/recipes.json");
  const raw = fs.readFileSync(filePath);
  const recipes = JSON.parse(raw);
  let hasError = false;
  recipes.forEach((recipe, idx) => {
    const errors = validateRecipe(recipe);
    if (errors.length > 0) {
      hasError = true;
      console.log(`\n❌ Món thứ ${idx + 1}: ${recipe.name || recipe.title}`);
      errors.forEach(e => console.log("   - " + e));
    }
  });
  if (!hasError) {
    console.log("\n✅ Tất cả món đều hợp lệ!");
  }
}

main();
