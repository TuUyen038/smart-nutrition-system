const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Recipe = require("../models/Recipe");

// ---------- Mongo connect ----------
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env");
  process.exit(1);
}

// ---------- helpers ----------
function convertDate(dateStr) {
  if (!dateStr) return null;

  const [day, month, year] = dateStr.split("-");

  return new Date(`${year}-${month}-${day}`);
}

// ---------- import ----------
async function importRecipes() {
  await mongoose.connect(MONGO_URI);

  console.log("✅ Connected to MongoDB");

  try {
    const filePath = path.join(
      __dirname,
      "../crawler/savoury/data/recipes.json",
    );

    const raw = fs.readFileSync(filePath);

    const recipes = JSON.parse(raw);

    console.log(`📄 Loaded ${recipes.length} recipes`);

    // transform data
    const transformed = recipes.map((r) => ({
      ...r,
      date: convertDate(r.date),
      // ✅ Normalize quantity structure
      ingredients: (r.ingredients || []).map((ing) => {
        const raw = ing.name;

        return {
          ...ing,

          // lưu name JSON thành cả name và rawName
          name: raw,
          rawName: raw,

          quantity: {
            amount: ing.quantity?.amount ?? 0,
            unit: ing.quantity?.unit ?? "g",
            originalAmount:
              ing.quantity?.originalAmount ?? ing.quantity?.amount ?? 0,
            originalUnit:
              ing.quantity?.originalUnit ?? ing.quantity?.unit ?? "g",
          },
        };
      }),
    }));

    // insertMany
    try {
      const result = await Recipe.insertMany(transformed, {
        ordered: false,
      });

      console.log(`✅ Inserted ${result.length} recipes`);
    } catch (err) {
      console.log("⚠️ Some recipes failed");

      if (err.writeErrors) {
        err.writeErrors.forEach((e) => {
          const doc = e.err.op;

          const log = {
            title: doc.title,
            detailUrl: doc.detailUrl,
            error: e.errmsg,
          };

          console.log(`❌ FAILED: ${doc.title}`);

          fs.appendFileSync(
            path.join(__dirname, "recipe-import-errors.log"),
            JSON.stringify(log) + "\n",
          );
        });
      }
    }
  } catch (err) {
    console.error("❌ Fatal error:", err);
  } finally {
    await mongoose.disconnect();

    console.log("🔌 Disconnected MongoDB");
  }
}

importRecipes();
