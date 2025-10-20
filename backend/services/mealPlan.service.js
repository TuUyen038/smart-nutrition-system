// src/services/meal.service.js

const Meal = require('../models/Meal');
const MealPlan = require('../models/MealPlan'); // Đảm bảo MealPlan được import

// ... (Các hàm khác: getMealHistory, calculateTotalNutrition, v.v.)

/**
 * Cập nhật MealPlan sau khi một Meal (gợi ý AI) được nhân bản/chỉnh sửa.
 * @param {ObjectId} mealPlanId - ID của MealPlan cần cập nhật.
 * @param {ObjectId} oldMealId - ID của Meal gốc (A) bị thay thế.
 * @param {ObjectId} newMealId - ID của Meal mới (B) đã chỉnh sửa.
 */
exports.updateMealPlanOnMealClone = async (mealPlanId, oldMealId, newMealId) => {
    if (!mealPlanId) return;

    try {
        // Tìm và cập nhật MealPlan
        const updatedPlan = await MealPlan.findByIdAndUpdate(
            mealPlanId,
            {
                // 1. Loại bỏ ID cũ (A) và thêm ID mới (B) vào mảng meals
                $pull: { meals: oldMealId },
                $push: { meals: newMealId },
                // 2. Đánh dấu Plan đã bị chỉnh sửa
                $set: { isModified: true } 
            },
            { new: true } // Trả về bản ghi đã cập nhật
        );

        if (!updatedPlan) {
            console.warn(`MealPlan ID ${mealPlanId} not found during meal clone update.`);
        }

    } catch (error) {
        console.error('Error updating MealPlan on meal clone:', error);
        // Tùy chọn: Xử lý lỗi, ví dụ log lại hoặc gửi thông báo.
    }
};