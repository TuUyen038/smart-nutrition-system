// src/controllers/meal.controller.js

const mealService = require('../services/meal.service');
const Recipe = require('../models/Recipe');

exports.createMeal = async (req, res) => {
  try {
    const meal = await mealService.createMeal(req.body);
    res.status(200).json(meal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getMeal = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy userId từ middleware xác thực
        const detail = await mealService.getMealDetail(userId);
        res.status(200).json(detail);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving meal detail' });
    }
}
// API: GET /api/meals/history
exports.getHistory = async (req, res) => {
    try {
        //const userId = req.user.id; // Lấy userId từ middleware xác thực
        const userId = req.body.id;
        const history = await mealService.getMealHistory(userId);
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving meal history' });
    }
};

// API: POST /api/meals/add-recipe
exports.addRecipe = async (req, res) => {
    try {
        // const userId = req.user.id;
        const userId = req.body.id;
        const { date, mealType, recipeId, portion } = req.body;

        if (!date || !mealType || !recipeId) {
            return res.status(400).json({ message: "Missing required fields: date, mealType, recipeId" });
        }
        
        // Gọi service để xử lý logic thêm/tạo và tính toán dinh dưỡng
        const updatedMeal = await mealService.addRecipeToMeal(userId, req.body);
        
        res.status(200).json(updatedMeal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding recipe to meal' });
    }
};

// API: PUT /api/meals/:mealId/status
exports.updateStatus = async (req, res) => {
    try {
        const { mealId } = req.params;
        const { newStatus } = req.body;
        
        // Kiểm tra quyền sở hữu (quyền logic nên nằm trong service, nhưng ta đơn giản hóa ở đây)
        // const meal = await Meal.findById(mealId); 
        // if (meal.userId.toString() !== req.user.id) return res.status(403).send('Forbidden');

        const updatedMeal = await mealService.updateMealStatus(mealId, newStatus);
        res.status(200).json(updatedMeal);
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: error.message || 'Error updating meal status' });
    }
};

// src/controllers/meal.controller.js (Bổ sung)

// API: PUT /api/meals/:mealId
exports.updateMeal = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy ID người dùng từ token
        const { mealId } = req.params;
        const updateData = req.body;
        
        // Gọi service để thực hiện cập nhật và xử lý logic phức tạp
        const updatedMeal = await mealService.updateMeal(mealId, updateData, userId);
        
        res.status(200).json(updatedMeal);
    } catch (error) {
        console.error(error);
        if (error.message.includes('not found')) {
             return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('Permission denied')) {
             return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error updating meal: ' + error.message });
    }
};