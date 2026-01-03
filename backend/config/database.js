const mongoose = require("mongoose");
const createDefaultAdmin = require("../utils/createDefaultAdmin");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected to DB: ${conn.connection.name}`);
    
    // Tạo admin mặc định nếu chưa có
    await createDefaultAdmin();
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Dừng server nếu kết nối lỗi
  }
};

module.exports = connectDB;
