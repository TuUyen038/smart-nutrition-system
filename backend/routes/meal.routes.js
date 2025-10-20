// src/routes/meal.routes.js

const express = require('express');
const mealController = require('../controllers/meal.controller');
// const authMiddleware = require('../middleware/auth'); // Giả định có middleware xác thực

const router = express.Router();

// Tất cả route đều nên dùng authMiddleware để xác định req.user.id
// router.use(authMiddleware); 

// 1. Lấy lịch sử ăn uống
router.get('/history', mealController.getHistory);

// 2. Thêm Recipe vào Meal (hoặc tạo Meal mới)
router.post('/add-recipe', mealController.addRecipe);

// 3. Cập nhật trạng thái (đánh dấu đã ăn, bỏ qua)
router.put('/:mealId/status', mealController.updateStatus);

// 4. Lấy chi tiết Meal (CRUD Read)
// router.get('/:mealId', mealController.getMealDetails); 

// 5. Cập nhật toàn bộ Meal (chỉnh sửa công thức, khẩu phần, note, v.v.)
router.put('/:mealId', mealController.updateMeal);
// ... Các routes cho PUT/DELETE/GET chi tiết khác

module.exports = router;