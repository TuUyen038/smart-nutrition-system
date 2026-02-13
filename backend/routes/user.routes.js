const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth");

router.use(authenticate);

router.get("/", authorize("ADMIN"), userController.getAllUsers);
router.get("/me", userController.getMe);
router.get("/:id", userController.getUserById);
router.patch("/:id", userController.updateUser);
router.patch("/soft-delete/:id", authorize("ADMIN"), userController.deleteUser);
router.get("/dashboard/stats", userController.getDashboardStats);

module.exports = router;
