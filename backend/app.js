const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const indexRoutes = require("./routes/index.routes"); // 👈 Router tổng

dotenv.config();

// Kết nối MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // cho phép React truy cập
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());

// Mount router tổng
app.use("/api", indexRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

module.exports = app;
