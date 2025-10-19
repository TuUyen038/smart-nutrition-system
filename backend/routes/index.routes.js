const express = require("express");
const router = express.Router();

// Import các router con
const userRoutes = require("./user.routes");
const ingredientRoutes = require("./ingredient.routes");

// Mount router con
router.use("/users", userRoutes);
router.use("/ingredients", ingredientRoutes);

// Export router tổng
module.exports = router;
