const mongoose = require("mongoose");
const xlsx = require("xlsx");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Ingredient = require("../models/Ingredient");
const Recipe = require("../models/Recipe");

// Kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
  console.log("✅ Connected to MongoDB");

  try {
    const filePath = path.join(__dirname, "data.xlsx");
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`Đọc được ${data.length} dòng từ Excel`);

    // 📋 Duyệt từng hàng và chuẩn hóa dữ liệu
    const ingredients = data.map((item) => ({
      name: item.name_vi_fixed || item.name_vi || item.name || "Không tên",
      name_en: item.name_en || "",
      nutrition: {
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        fat: Number(item.fat) || 0,
        carbs: Number(item.carbs) || 0,
        fiber: Number(item.fiber) || 0,
        sugar: Number(item.sugar) || 0,
        sodium: Number(item.sodium) || 0,
      },
      category: "other", // vì file chưa có cột category
      source: "VTN FTC 2007"
    }));

    

    await Ingredient.deleteMany({});
    console.log("Đã xóa dữ liệu cũ trong collection ingredient");

    // Lưu vào MongoDB
    await Ingredient.insertMany(ingredients);
    console.log(`Đã import thành công ${ingredients.length} nguyên liệu`);

  } catch (err) {
    console.error("Lỗi khi import:", err);
  } finally {
    mongoose.connection.close();
    console.log("Đã đóng kết nối MongoDB");
  }
});
//node Data/import_ingredients.js 