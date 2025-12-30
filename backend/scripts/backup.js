#!/usr/bin/env node
/**
 * Script để backup MongoDB database
 *
 * Usage:
 *   node scripts/backup.js
 *   node scripts/backup.js --restore /path/to/backup
 */

const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const BACKUP_DIR = path.join(__dirname, "../backups");
const DATE = new Date().toISOString().split("T")[0]; // 2024-01-15
const BACKUP_PATH = path.join(BACKUP_DIR, `backup-${DATE}`);

// Parse arguments
const args = process.argv.slice(2);
const restorePath = args
  .find((arg) => arg.startsWith("--restore="))
  ?.split("=")[1];

/**
 * Tạo backup
 */
function createBackup() {
  return new Promise((resolve, reject) => {
    // Tạo thư mục backup nếu chưa có
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log(`✅ Created backup directory: ${BACKUP_DIR}`);
    }

    // Kiểm tra nếu đã có backup hôm nay
    if (fs.existsSync(BACKUP_PATH)) {
      console.log(`⚠️  Backup for today already exists: ${BACKUP_PATH}`);
      console.log("   Deleting old backup...");
      fs.rmSync(BACKUP_PATH, { recursive: true });
    }

    console.log(`📦 Creating backup to: ${BACKUP_PATH}`);
    console.log(
      `   MongoDB URI: ${MONGO_URI ? MONGO_URI.replace(/\/\/.*@/, "//***:***@") : "Not set"}`
    );

    const command = `mongodump --uri="${MONGO_URI}" --out="${BACKUP_PATH}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Backup failed:", error.message);
        return reject(error);
      }

      if (stderr && !stderr.includes("writing")) {
        console.warn("⚠️  Warning:", stderr);
      }

      console.log("✅ Backup successful!");
      console.log(`   Location: ${BACKUP_PATH}`);

      // Tính kích thước backup
      const size = getDirectorySize(BACKUP_PATH);
      console.log(`   Size: ${formatBytes(size)}`);

      // Xóa backup cũ
      cleanupOldBackups();

      resolve();
    });
  });
}

/**
 * Restore từ backup
 */
function restoreBackup(restorePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(restorePath)) {
      return reject(new Error(`Backup path does not exist: ${restorePath}`));
    }

    console.log(`🔄 Restoring from: ${restorePath}`);
    console.log(
      `   MongoDB URI: ${MONGO_URI ? MONGO_URI.replace(/\/\/.*@/, "//***:***@") : "Not set"}`
    );
    console.log("   ⚠️  WARNING: This will overwrite existing data!");

    const command = `mongorestore --uri="${MONGO_URI}" --drop "${restorePath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Restore failed:", error.message);
        return reject(error);
      }

      if (stderr && !stderr.includes("restoring")) {
        console.warn("⚠️  Warning:", stderr);
      }

      console.log("✅ Restore successful!");
      resolve();
    });
  });
}

/**
 * Xóa backup cũ hơn 7 ngày
 */
function cleanupOldBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return;

    const files = fs.readdirSync(BACKUP_DIR);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    files.forEach((file) => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory() && stats.mtime.getTime() < sevenDaysAgo) {
        fs.rmSync(filePath, { recursive: true });
        console.log(`🗑️  Deleted old backup: ${file}`);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      console.log(`✅ Cleaned up ${deletedCount} old backup(s)`);
    }
  } catch (error) {
    console.error("❌ Error cleaning up old backups:", error.message);
  }
}

/**
 * Tính kích thước thư mục
 */
function getDirectorySize(dirPath) {
  let size = 0;

  try {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    });
  } catch (error) {
    // Ignore errors
  }

  return size;
}

/**
 * Format bytes thành human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Main
 */
async function main() {
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not set in .env file");
    process.exit(1);
  }

  try {
    if (restorePath) {
      await restoreBackup(restorePath);
    } else {
      await createBackup();
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Chạy script
if (require.main === module) {
  main();
}

module.exports = { createBackup, restoreBackup };
