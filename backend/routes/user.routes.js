const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth");

// Tất cả routes đều cần authentication
router.use(authenticate);

// Route để user xem thông tin của chính mình
router.get("/me", userController.getMe);

// Routes chỉ dành cho ADMIN
router.get("/", authorize("ADMIN"), userController.getAllUsers);
router.delete("/:id", authorize("ADMIN"), userController.deleteUser);

// Routes cho cả USER và ADMIN (nhưng có kiểm tra ownership trong controller)
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);

module.exports = router;
