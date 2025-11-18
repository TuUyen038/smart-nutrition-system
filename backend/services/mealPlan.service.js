const Meal = require('../models/DailyMenu'); // Cần để tham chiếu (dù chưa dùng trong các hàm này)
const MealPlan = require('../models/MealPlan'); 
const { calculateEndDate } = require('../utils/mealPlan.util');
const mongoose = require("mongoose");
const DailyMenuService = require('../services/dailyMenu.service');

class MealPlanService {
    
    async updateMealPlanOnMealClone(mealPlanId, oldMealId, newMealId) {
        if (!mealPlanId) return null; 

        try {
            const updatedPlan = await MealPlan.findByIdAndUpdate(
                mealPlanId,
                {
                    // 1. Loại bỏ ID cũ (A)
                    $pull: { meals: oldMealId },
                    // 2. Thêm ID mới (B) vào mảng meals
                    $push: { meals: newMealId },
                    // 3. Đánh dấu Plan đã bị chỉnh sửa (YÊU CẦU: trường isModified: Boolean trong schema)
                    $set: { isModified: true }
                },
                // new: true trả về bản ghi đã cập nhật, runValidators: đảm bảo dữ liệu mới hợp lệ
                { new: true, runValidators: true } 
            );

            if (!updatedPlan) {
                console.warn(`MealPlan ID ${mealPlanId} not found during meal clone update.`);
            }
            
            return updatedPlan;

        } catch (error) {
            console.error('Lỗi khi cập nhật MealPlan on meal clone:', error);
            throw new Error("Lỗi khi cập nhật MealPlan sau khi chỉnh sửa Meal.");
        }
    }

    generateDateList(startDate, period) {
        const start = new Date(startDate);
        const days = period === "week" ? 7 : 1;
        const dates = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            dates.push(d);
        }
        return dates;
    }
    /** Tạo Plan + DailyMenus */
    async createPlan(userId, planData) {
        const { startDate, period="week", aiMeals } = planData;

        const endDate = calculateEndDate(startDate, period);

        const dates = this.generateDateList(startDate, period);

        const dailyMenuIds = [];

        for (let i = 0; i < dates.length; i++) {
            const date = dates[i];

            const recipes = aiMeals?.[i] || []; // AI generate thì có món, user tự tạo thì []

            const dailyMenu = await DailyMenuService.createMeal({
                userId,
                date,
                recipes,
                status: "planned",
            });

            dailyMenuIds.push(dailyMenu._id);
        }

        // Tạo MealPlan
        const newPlan = new MealPlan({
            ...planData,
            userId,
            startDate,
            endDate,
            dailyMenuIds, // <--- Lưu danh sách DailyMenu
            status: aiMeals ? "suggested" : "planned",
            source: aiMeals ? "ai" : "user",
        });

        await newPlan.save();

        return newPlan;
    }

    async getPlanByStartDate(userId, startDate) {
        return MealPlan.findOne({ userId, startDate })
            .populate("dailyMenuIds");  
    }


    async getPlansByUserId(userId, filter = {}) {
        // Lấy tất cả Plan của người dùng, sắp xếp theo startDate mới nhất
        return MealPlan.find({ userId, ...filter })
            .sort({ startDate: -1 })
            .populate("meals") // Populate các Meal liên quan nếu cần hiển thị chi tiết
            .lean();
    }

    async getPlanById(planId) {
        if (!mongoose.Types.ObjectId.isValid(planId)) {
            throw new Error("ID Plan không hợp lệ.");
        }
        return MealPlan.findById(planId).populate("meals").lean();
    }

    async updatePlanStatus(userId, planId, newStatus) {
        const validStatuses = ["suggested", "selected", "completed", "cancelled"];
        if (!validStatuses.includes(newStatus)) {
            throw new Error("Trạng thái không hợp lệ.");
        }

        const plan = await MealPlan.findOne({ _id: planId, userId });
        if (!plan) {
            throw new Error("Không tìm thấy MealPlan hoặc bạn không có quyền.");
        }

        // Ràng buộc 1: Chỉ có thể cập nhật trạng thái nếu nó không phải là "completed" hoặc "cancelled"
        if (plan.status === "completed" || plan.status === "cancelled") {
            throw new Error(`Không thể cập nhật Plan đã ở trạng thái ${plan.status}.`);
        }

        // Ràng buộc 2: Xử lý logic khi chuyển trạng thái sang "selected"
        if (newStatus === "planned") {
            // Hủy (cancelled) tất cả các MealPlan "suggested" khác đang bị chồng lấn thời gian
            await MealPlan.updateMany(
                {
                    userId,
                    _id: { $ne: planId }, // Loại trừ plan hiện tại
                    status: "suggested",
                },
                { $set: { status: "cancelled" } }
            );
        }

        plan.status = newStatus;
        await plan.save();
        return plan;
    }

    async deletePlan(userId, planId) {
        const result = await MealPlan.deleteOne({ _id: planId, userId, status: "suggested" });
        if (result.deletedCount === 0) {
            throw new Error("Không thể xóa Plan đã được chọn (selected) hoặc không tìm thấy.");
        }
    }
}

module.exports = new MealPlanService();