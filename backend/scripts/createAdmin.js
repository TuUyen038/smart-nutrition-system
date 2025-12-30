#!/usr/bin/env node
/**
 * Script để tạo Admin user
 *
 * Usage:
 *   node scripts/createAdmin.js
 *   node scripts/createAdmin.js --email=admin@example.com --password=admin123
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set in .env file");
  process.exit(1);
}

// Parse arguments
const args = process.argv.slice(2);
const emailArg = args.find((arg) => arg.startsWith("--email="))?.split("=")[1];
const passwordArg = args
  .find((arg) => arg.startsWith("--password="))
  ?.split("=")[1];

const adminEmail = emailArg || "admin@example.com";
const adminPassword = passwordArg || "admin123";
const adminName = "Admin";

async function createAdmin() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      // Update role thành ADMIN nếu đã có
      if (existingUser.role !== "ADMIN") {
        existingUser.role = "ADMIN";
        await existingUser.save();
        console.log(`✅ Updated user ${adminEmail} to ADMIN role`);
      } else {
        console.log(`ℹ️  User ${adminEmail} is already an ADMIN`);
      }
      await mongoose.disconnect();
      return;
    }

    // Tạo admin mới
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: ADMIN`);
    console.log("\n⚠️  Lưu ý: Đổi mật khẩu sau lần đăng nhập đầu tiên!");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
}

createAdmin();
