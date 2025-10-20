/**
 * Tính toán tổng dinh dưỡng của một bữa ăn từ mảng recipes.
 * @param {Array} recipes - Mảng các đối tượng { recipeId, portion, ... }
 * @returns {Object} totalNutrition - Tổng calo, protein, v.v.
 */
exports.calculateTotalNutrition = async (recipes) => {
    // Giả định bạn có một Model Recipe để lấy dữ liệu dinh dưỡng
    const Recipe = require("../models/Recipe");

    let totalNutrition = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
    };

    if (!recipes || recipes.length === 0) {
        return totalNutrition;
    }

    for (const item of recipes) {
        const recipe = await Recipe.findById(item.recipeId);
        
        if (recipe && recipe.totalNutrition) {
            // Lấy dinh dưỡng trên mỗi khẩu phần của công thức (giả định Recipe lưu dinh dưỡng cho 1 portion)
            const baseNutri = recipe.totalNutrition; 
            const portion = item.portion || 1;

            totalNutrition.calories += baseNutri.calories * portion;
            totalNutrition.protein += baseNutri.protein * portion;
            totalNutrition.fat += baseNutri.fat * portion;
            totalNutrition.carbs += baseNutri.carbs * portion;
            totalNutrition.fiber += baseNutri.fiber * portion;
            totalNutrition.sugar += baseNutri.sugar * portion;
            totalNutrition.sodium += baseNutri.sodium * portion;
        }
    }

    // Làm tròn kết quả để tránh số thập phân quá dài
    for (const key in totalNutrition) {
        totalNutrition[key] = parseFloat(totalNutrition[key].toFixed(2));
    }

    return totalNutrition;
};