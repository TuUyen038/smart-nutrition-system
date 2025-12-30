#!/usr/bin/env node
/**
 * Script để tự động thêm các biến môi trường tối thiểu vào file .env
 * 
 * Usage:
 *   node scripts/setup-env.js
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ENV_FILE = path.join(__dirname, "../.env");
const ENV_TEMPLATE = path.join(__dirname, "../.env.template");

// Các biến môi trường tối thiểu cần có
const REQUIRED_VARS = {
  MONGO_URI: "mongodb://localhost:27017/smart_nutrition",
  JWT_SECRET: () => crypto.randomBytes(32).toString("hex"), // Generate random secret
  JWT_EXPIRES_IN: "7d",
  NODE_ENV: "development",
};

/**
 * Đọc file .env hiện tại
 */
function readEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    return {};
  }

  const content = fs.readFileSync(ENV_FILE, "utf8");
  const vars = {};

  content.split("\n").forEach((line) => {
    line = line.trim();
    // Bỏ qua comment và dòng trống
    if (line && !line.startsWith("#") && line.includes("=")) {
      const [key, ...valueParts] = line.split("=");
      const value = valueParts.join("=").trim();
      vars[key.trim()] = value;
    }
  });

  return vars;
}

/**
 * Ghi file .env
 */
function writeEnvFile(vars) {
  let content = `# ============================================
# MONGODB CONFIGURATION
# ============================================
MONGO_URI=${vars.MONGO_URI}

# ============================================
# JWT AUTHENTICATION
# ============================================
# ⚠️ QUAN TRỌNG: JWT_SECRET đã được generate tự động
# Nếu muốn đổi, hãy generate một chuỗi ngẫu nhiên mạnh
JWT_SECRET=${vars.JWT_SECRET}
JWT_EXPIRES_IN=${vars.JWT_EXPIRES_IN}

# ============================================
# NODE ENVIRONMENT
# ============================================
NODE_ENV=${vars.NODE_ENV}

`;

  // Thêm các biến khác (như HF_API_KEY, CLOUDINARY, etc.)
  Object.keys(vars).forEach((key) => {
    if (!REQUIRED_VARS.hasOwnProperty(key)) {
      content += `# ${key}\n${key}=${vars[key]}\n\n`;
    }
  });

  fs.writeFileSync(ENV_FILE, content, "utf8");
}

/**
 * Main function
 */
function main() {
  console.log("🔧 Đang kiểm tra và cập nhật file .env...\n");

  // Đọc file .env hiện tại
  const existingVars = readEnvFile();
  console.log("📋 Các biến hiện có:", Object.keys(existingVars).join(", ") || "Không có");

  // Kiểm tra và thêm các biến còn thiếu
  let updated = false;
  const finalVars = { ...existingVars };

  Object.keys(REQUIRED_VARS).forEach((key) => {
    if (!finalVars[key]) {
      const defaultValue = typeof REQUIRED_VARS[key] === "function" 
        ? REQUIRED_VARS[key]() 
        : REQUIRED_VARS[key];
      
      finalVars[key] = defaultValue;
      console.log(`✅ Đã thêm: ${key} = ${key === "JWT_SECRET" ? "***" + defaultValue.substring(0, 10) + "..." : defaultValue}`);
      updated = true;
    } else {
      console.log(`✓ Đã có: ${key}`);
    }
  });

  if (updated) {
    // Ghi file .env
    writeEnvFile(finalVars);
    console.log("\n✅ Đã cập nhật file .env thành công!");
    console.log(`📁 Vị trí: ${ENV_FILE}`);
  } else {
    console.log("\n✅ Tất cả các biến cần thiết đã có trong file .env!");
  }

  console.log("\n📝 Các biến môi trường hiện có:");
  Object.keys(finalVars).forEach((key) => {
    const value = key === "JWT_SECRET" || key.includes("SECRET") || key.includes("KEY")
      ? "***" + finalVars[key].substring(0, 10) + "..."
      : finalVars[key];
    console.log(`   ${key} = ${value}`);
  });

  console.log("\n💡 Lưu ý:");
  console.log("   - JWT_SECRET đã được generate tự động");
  console.log("   - Nếu muốn đổi JWT_SECRET, hãy generate một chuỗi ngẫu nhiên mạnh");
  console.log("   - Kiểm tra MONGO_URI có đúng với MongoDB của bạn không");
}

// Chạy script
if (require.main === module) {
  main();
}

module.exports = { readEnvFile, writeEnvFile };

