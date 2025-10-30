const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/database");
const indexRoutes = require("./routes/index.routes"); // 👈 Router tổng


// Kết nối MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3001", // cho phép React truy cập
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Mount router tổng
app.use("/api", indexRoutes);

module.exports = app;
