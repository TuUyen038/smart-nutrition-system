const mealPlanService = require('../services/mealPlan.service');


async function getWeekStatus (req, res) {
  try {
    const { userId, startDate, days } = req.query;

    if (!userId || !startDate) {
      return res.status(400).json({ message: "userId và startDate là bắt buộc" });
    }

    const result = await mealPlanService.checkWeekDailyMenus({
      userId,
      startDateStr: startDate,
      days: days ? Number(days) : 7,
    });

    return res.json(result);
  } catch (err) {
    console.error("getWeekStatus error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * POST /api/meal-plans/week/suggest
 * body: { userId, startDate, days? }
 */
async function suggestWeekPlan(req, res) {
  try {
    const { userId, startDate, days, mode } = req.body;
    // mode: "reuse" | "overwrite"

    if (!userId || !startDate) {
      return res.status(400).json({ message: "userId và startDate là bắt buộc" });
    }

    const mealPlan = await mealPlanService.suggestWeekPlan({
      userId,
      startDateStr: startDate,
      days: days || 7,
      mode: mode === "overwrite" ? "overwrite" : "reuse",
    });

    await mealPlan.populate({
      path: "dailyMenuIds",
      populate: {
        path: "recipes.recipeId",
        model: "Recipe",
      },
    });
    return res.status(201).json(mealPlan);
  } catch (err) {
    console.error("Error suggestWeekPlan:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


const getMealPlanByStartDate = async (req, res) => {
    try {
        const userId = "68f4394c4d4cc568e6bc5daa" // lấy từ middleware auth
        const { startDate } = req.query;
        if (!startDate) {
            return res.status(400).json({ error: "startDate là bắt buộc." });
        }

        const plan = await mealPlanService.getPlanByStartDate(userId, startDate);
        if (!plan) {
            return res.status(404).json({ error: "Không tìm thấy MealPlan cho ngày bắt đầu này." });
        }

        return res.status(200).json({ data: plan });
    } catch (error) {
        console.error("Lỗi khi lấy MealPlan theo startDate:", error);
        return res.status(500).json({ error: "Lỗi server nội bộ." });
    }
};

const createMealPlan = async (req, res) => {
    try {
        const userId = req.body.userId; // Hoặc lấy từ middleware Auth
        const planData = req.body;

        if ( !planData.startDate) {
            return res.status(400).json({ error: "startDate là bắt buộc." });
        }

        const newPlan = await mealPlanService.createPlan(userId, planData);
        return res.status(201).json({
            message: "MealPlan đã được tạo thành công.",
            data: newPlan,
        });
    } catch (error) {
        console.error("Lỗi khi tạo MealPlan:", error.message);
        return res.status(500).json({ error: error.message || "Lỗi server nội bộ." });
    }
};

const getMealPlans = async (req, res) => {
    try {
        const userId = req.userId;
        const plans = await mealPlanService.getPlansByUserId(userId, req.query);
        return res.status(200).json({ data: plans });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách MealPlan:", error.message);
        return res.status(500).json({ error: "Lỗi server nội bộ." });
    }
};

const getMealPlanDetail = async (req, res) => {
    try {
        const { planId } = req.params;
        const plan = await mealPlanService.getPlanById(planId);

        if (!plan || plan.userId.toString() !== req.userId) {
            return res.status(404).json({ error: "Không tìm thấy MealPlan." });
        }

        return res.status(200).json({ data: plan });
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết MealPlan:", error.message);
        return res.status(500).json({ error: error.message || "Lỗi server nội bộ." });
    }
};

const updatePlanStatus = async (req, res) => {
    try {
        const { planId } = req.params;
        const { newStatus } = req.body;
        const userId = req.userId;

        if (!newStatus) return res.status(400).json({ error: "newStatus là bắt buộc." });

        const updatedPlan = await mealPlanService.updatePlanStatus(userId, planId, newStatus);
        return res.status(200).json({
            message: `Đã cập nhật trạng thái Plan thành ${newStatus}.`,
            data: updatedPlan,
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái Plan:", error.message);
        if (error.message.includes("không hợp lệ") || error.message.includes("Không thể cập nhật")) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: "Lỗi server nội bộ." });
    }
};

const deleteMealPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const userId = req.userId;

        await mealPlanService.deletePlan(userId, planId);
        return res.status(200).json({ message: "MealPlan đã được xóa thành công." });
    } catch (error) {
        console.error("Lỗi khi xóa MealPlan:", error.message);
        if (error.message.includes("Không thể xóa Plan đã được chọn")) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: "Lỗi server nội bộ." });
    }
};

module.exports = {
    getMealPlanByStartDate,
    createMealPlan,
    getMealPlans,
    getMealPlanDetail,
    updatePlanStatus,
    deleteMealPlan,
    suggestWeekPlan,
    getWeekStatus
};
