const express = require("express");
const router = express.Router();

// Import các router con
const userRoutes = require("./user.routes");

// Mount router con
router.use("/users", userRoutes);

// Export router tổng
module.exports = router;
