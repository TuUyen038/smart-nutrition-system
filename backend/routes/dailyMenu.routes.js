const express = require('express');
const dailyMenuController = require('../controllers/dailyMenu.controller');
// const authMiddleware = require('../middleware/auth'); // Giả định có middleware xác thực

const router = express.Router();

// Tất cả route đều nên dùng authMiddleware để xác định req.user.id
// router.use(authMiddleware); 

router.post('/', dailyMenuController.createDailyMenu);
router.get('/', dailyMenuController.getAllDailyMenu);
router.get('/recipes', dailyMenuController.getRecipesByDateAndStatus)
router.get('/history', dailyMenuController.getHistory);
router.get('/:id', dailyMenuController.getDailyMenuById);
router.post("/add-recipe", dailyMenuController.addRecipeToDailyMenu);
router.put('/:mealId/status', dailyMenuController.updateStatus);
router.put('/:mealId', dailyMenuController.updateMeal);
router.post("/suggest", dailyMenuController.suggestDailyMenu);

module.exports = router;