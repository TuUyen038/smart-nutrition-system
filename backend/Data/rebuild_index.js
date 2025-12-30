// Script để rebuild index sau khi import dữ liệu mới
// Usage: node Data/rebuild_index.js

const { exec } = require("child_process");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env");
  process.exit(1);
}

console.log("🔄 Rebuilding ingredient index after import...");
console.log(`📊 MongoDB URI: ${MONGO_URI.split("@")[0]}@...`);

// Đường dẫn đến build_index.py
const nutritionMappingDir = path.join(__dirname, "../../nutrition-mapping");
const buildScript = path.join(nutritionMappingDir, "build_index.py");

// Set MONGO_URI environment variable và chạy Python script
const env = { ...process.env, MONGO_URI };

exec(
  `cd "${nutritionMappingDir}" && python build_index.py`,
  { env },
  (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error rebuilding index:", error.message);
      console.error(stderr);
      process.exit(1);
    }

    console.log(stdout);
    console.log("\n✅ Rebuild index thành công!");
  }
);

