const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");
const { authenticate } = require("../middlewares/auth");

// Tất cả routes đều cần authentication
router.use(authenticate);

// Lấy danh sách món ăn yêu thích
router.get("/", favoriteController.getFavorites);

// Kiểm tra trạng thái yêu thích của một recipe
router.get("/check/:recipeId", favoriteController.checkFavorite);

// Toggle favorite (thêm nếu chưa có, xóa nếu đã có) - KHUYẾN NGHỊ
router.post("/toggle/:recipeId", favoriteController.toggleFavorite);

// Thêm vào danh sách yêu thích
router.post("/:recipeId", favoriteController.addFavorite);

// Xóa khỏi danh sách yêu thích
router.delete("/:recipeId", favoriteController.removeFavorite);

module.exports = router;

