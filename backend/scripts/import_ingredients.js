const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const XLSX = require("xlsx");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Ingredient = require("../models/Ingredient");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env");
  process.exit(1);
}

// ----------------- helpers -----------------

function parseNumber(value) {
  if (value === undefined || value === null || value === "") return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

function parseAliases(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizeName(str) {
  if (!str) return "";
  return String(str).trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeString(str) {
  if (!str) return "";
  return String(str).trim();
}

function buildExternalRefs(row) {
  const source = String(row.source || "")
    .trim()
    .toLowerCase();
  const id = row.id ? String(row.id).trim() : null;

  const providerMap = {
    usda: "USDA_FDC",
    fao: "FAO",
  };

    if (!id) {
    return [
      {
        provider: "VTN_FCT_2007",
      },
    ];
  }

  if (!providerMap[source]) return null;

  return [
    {
      provider: providerMap[source],
      external_id: id,
    },
  ];
}

// ----------------- import -----------------

async function importIngredients() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected MongoDB");

  try {
    const filePath = path.join(__dirname, "../ingredients.xlsx");

    if (!fs.existsSync(filePath)) {
      console.error("❌ File not found:", filePath);
      process.exit(1);
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(`📄 Loaded ${rows.length} rows`);

    const filteredRows = rows.filter(
      (row) => row.name_vi && String(row.name_vi).trim() !== "",
    );

    console.log(`Valid rows: ${filteredRows.length}`);

    let insertedCount = 0;
    let updatedCount = 0;
    let processedCount = 0;

    for (const row of filteredRows) {
      const normalizedName = normalizeName(row.name_vi);
      const externalRefs = buildExternalRefs(row);

      const updatePayload = {
        name: normalizedName,
        name_en: normalizeString(row.name_en),

        nutrition: {
          calories: parseNumber(row.calories),
          protein: parseNumber(row.protein),
          fat: parseNumber(row.fat),
          carbs: parseNumber(row.carbs),
          fiber: parseNumber(row.fiber),
          sugar: parseNumber(row.sugar),
          sodium: parseNumber(row.sodium),
        },

        aliases: parseAliases(row.alias),

        unit: "g",
        category: "other",

        source: "Imported",
      };

      if (externalRefs) {
        updatePayload.external_refs = externalRefs;
      }

      const result = await Ingredient.updateOne(
        { name: normalizedName },
        { $set: updatePayload },
        { upsert: true },
      );

      processedCount++;

      if (result.upsertedCount > 0) {
        insertedCount++;
      } else if (result.modifiedCount > 0) {
        updatedCount++;
      }
    }

    console.log("\n📊 ===== IMPORT SUMMARY =====");
    console.log(`📦 Total processed: ${processedCount}`);
    console.log(`🆕 Inserted: ${insertedCount}`);
    console.log(`🔄 Updated: ${updatedCount}`);
    console.log("🎉 Import finished successfully");
  } catch (err) {
    console.error("❌ Import error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected MongoDB");
  }
}

importIngredients();
