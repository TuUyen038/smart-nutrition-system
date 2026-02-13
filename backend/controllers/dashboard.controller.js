const User = require("../models/User");
const Recipe = require("../models/Recipe");
const MealPlan = require("../models/MealPlan");
const DailyMenu = require("../models/DailyMenu");

/**
 * Lấy thống kê tổng quan cho admin dashboard
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Stats cards: tổng users, recipes, meal plans
    const [totalUsers, totalRecipes, totalMealPlans] = await Promise.all([
      User.countDocuments({ role: "USER" }), // Chỉ đếm user, không đếm admin
      Recipe.countDocuments({ deleted: { $ne: true } }),
      MealPlan.countDocuments(),
    ]);

    // 2. Top recipe được sử dụng nhiều nhất (trong DailyMenu)
    const topRecipesAggregation = await DailyMenu.aggregate([
      { $unwind: "$recipes" },
      { $match: { "recipes.recipeId": { $ne: null } } },
      {
        $group: {
          _id: "$recipes.recipeId",
          usageCount: { $sum: 1 },
          avgCalories: {
            $avg: {
              $ifNull: [
                "$recipes.recipeSnapshot.totalNutrition.calories",
                { $literal: 0 },
              ],
            },
          },
        },
      },
      { $sort: { usageCount: -1 } },
      { $limit: 5 },
    ]);

    // Lấy tên món phổ biến nhất
    let mostPopularRecipe = "Chưa có dữ liệu";
    if (topRecipesAggregation.length > 0) {
      const topRecipeId = topRecipesAggregation[0]._id;
      const topRecipe = await Recipe.findById(topRecipeId);
      mostPopularRecipe = topRecipe ? topRecipe.name : "Chưa có dữ liệu";
    }

    // 3. User growth by month (6 tháng gần nhất)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1); // Đặt về ngày đầu tháng

    const userGrowthAggregation = await User.aggregate([
      { $match: { role: "USER", createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Tạo labels và data cho 6 tháng gần nhất
    const monthLabels = [];
    const userGrowthData = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const monthLabel = `Th${date.getMonth() + 1}`;
      monthLabels.push(monthLabel);

      // Tìm count trong aggregation
      const monthData = userGrowthAggregation.find(
        (item) =>
          item._id.year === date.getFullYear() && item._id.month === date.getMonth() + 1
      );
      userGrowthData.push(monthData ? monthData.count : 0);
    }

    // 4. Recipe distribution by category
    const recipeCategoryAggregation = await Recipe.aggregate([
      { $match: { deleted: { $ne: true } } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const categoryMap = {
      main: "Món chính",
      side: "Món phụ",
      dessert: "Tráng miệng",
      drink: "Đồ uống",
    };

    const recipeDistribution = {
      labels: recipeCategoryAggregation.map((item) => categoryMap[item._id] || item._id || "Khác"),
      data: recipeCategoryAggregation.map((item) => item.count),
    };

    // 5. Top recipes table với thông tin đầy đủ
    const topRecipesTable = await Promise.all(
      topRecipesAggregation.map(async (item) => {
        const recipe = await Recipe.findById(item._id).lean();
        return {
          id: item._id,
          name: recipe?.name || "Unknown",
          author: recipe?.createdBy === "admin" ? "admin" : "user",
          usageCount: item.usageCount,
          avgCalories: Math.round(item.avgCalories || recipe?.totalNutrition?.calories || 0),
        };
      })
    );

    res.json({
      stats: {
        totalUsers,
        totalRecipes,
        totalMealPlans,
        mostPopularRecipe,
      },
      userGrowth: {
        labels: monthLabels,
        data: userGrowthData,
      },
      recipeDistribution,
      topRecipes: topRecipesTable,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

