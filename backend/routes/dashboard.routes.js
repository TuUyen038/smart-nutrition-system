const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { authenticate, authorize } = require("../middlewares/auth");

// Route chỉ dành cho ADMIN
router.get("/stats", authenticate, authorize("ADMIN"), dashboardController.getDashboardStats);

router.get("/stats", authenticate, authorize("USER"), dashboardController.getDashboardStats);
module.exports = router;

