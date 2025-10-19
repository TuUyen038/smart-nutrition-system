const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected to DB: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Dừng server nếu kết nối lỗi
  }
};

module.exports = connectDB;
