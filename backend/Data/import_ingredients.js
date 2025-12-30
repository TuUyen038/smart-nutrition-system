const mongoose = require("mongoose");
const xlsx = require("xlsx");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Ingredient = require("../models/Ingredient");

// ---------- helpers ----------
function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function parseAliases(raw) {
  if (!raw) return [];
  const s = String(raw).trim();
  if (!s) return [];

  // alias trong excel dạng: "a, b, c"
  const parts = s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  // dedup case-insensitive
  const seen = new Set();
  const out = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(p);
    }
  }
  return out;
}

// ---------- Mongo connect ----------
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env");
  process.exit(1);
}

mongoose.connect(MONGO_URI);

mongoose.connection.once("open", async () => {
  console.log("✅ Connected to MongoDB");

  try {
    const filePath = path.join(__dirname, "data.xlsx");
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // defval để cell trống thành "" thay vì undefined
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    console.log(`📄 Đọc được ${data.length} dòng từ Excel`);

    const ingredients = data.map((item) => {
      // đúng header bạn cung cấp
      const name = String(item.name_vi || "").trim() || "Không tên";
      const name_en = String(item.name_en || "").trim();
      const source = String(item.source || "").trim() || "VTN FTC 2007";

      const aliasesFromExcel = parseAliases(item.alias);

      // (khuyến nghị) thêm name/name_en vào aliases để mapping chắc hơn
      const aliasesMerged = [
        ...aliasesFromExcel,
        name, // name_vi
        ...(name_en ? [name_en] : []),
      ];

      // dedup lần cuối (case-insensitive)
      const seen = new Set();
      const aliasesFinal = [];
      for (const a of aliasesMerged) {
        const s = String(a || "").trim();
        if (!s) continue;
        const key = s.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        aliasesFinal.push(s);
      }

      return {
        name,
        name_en,
        aliases: aliasesFinal,

        nutrition: {
          calories: toNumber(item.calories),
          protein: toNumber(item.protein),
          fat: toNumber(item.fat),
          carbs: toNumber(item.carbs),
          fiber: toNumber(item.fiber),
          sugar: toNumber(item.sugar),
          sodium: toNumber(item.sodium),
        },

        unit: "g",
        category: "other",
        source,
      };
    });

    await Ingredient.deleteMany({});
    console.log("🧹 Đã xóa dữ liệu cũ trong collection Ingredient");

    await Ingredient.insertMany(ingredients, { ordered: false });
    console.log(`✅ Đã import thành công ${ingredients.length} nguyên liệu`);

    console.log(
      "\n⚠️  LƯU Ý: Sau khi import, bạn CẦN rebuild index để model sử dụng dữ liệu mới:"
    );
    console.log("   node Data/rebuild_index.js");
    console.log(
      "   hoặc: cd ../../nutrition-mapping && MONGO_URI='...' python build_index.py"
    );
  } catch (err) {
    console.error("❌ Lỗi khi import:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 Đã đóng kết nối MongoDB");
  }
});

// node Data/import_ingredients.js
