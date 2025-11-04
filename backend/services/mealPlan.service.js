// mealPlan.service.js

// Đảm bảo import đúng các models và utility cần thiết
const Meal = require('../models/DailyMenu'); // Cần để tham chiếu (dù chưa dùng trong các hàm này)
const MealPlan = require('../models/MealPlan'); 
const { calculateEndDate } = require('../utils/mealPlan.util');
const mongoose = require("mongoose");


class MealPlanService {
    
    /**
     * Cập nhật MealPlan sau khi một Meal (gợi ý AI) được nhân bản/chỉnh sửa.
     * Sử dụng $pull và $push atomic operators để đảm bảo tính toàn vẹn và hiệu suất.
     * @param {ObjectId} mealPlanId - ID của MealPlan cần cập nhật.
     * @param {ObjectId} oldMealId - ID của Meal gốc (A) bị thay thế.
     * @param {ObjectId} newMealId - ID của Meal mới (B) đã chỉnh sửa.
     * @returns {Promise<object | null>} MealPlan đã cập nhật hoặc null nếu không tìm thấy.
     */
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


    /**
     * Tạo một MealPlan mới, tự động tính endDate.
     * @param {string} userId - ID người dùng.
     * @param {object} planData - Dữ liệu plan.
     * @returns {Promise<object>} MealPlan đã được tạo.
     */
    async createPlan(userId, planData) {
        const { period, startDate } = planData;

        // 1. Tính toán endDate dựa trên period
        const endDate = calculateEndDate(startDate, period);

        const newPlan = new MealPlan({
            ...planData,
            userId,
            endDate,
            // Mặc định status: suggested, source: ai
        });

        // 2. Lưu Plan
        await newPlan.save();
        return newPlan;
    }

    /**
     * Lấy danh sách MealPlan của người dùng.
     * @param {string} userId - ID người dùng.
     * @param {object} filter - Các điều kiện lọc bổ sung.
     * @returns {Promise<array>} Danh sách MealPlan.
     */
    async getPlansByUserId(userId, filter = {}) {
        // Lấy tất cả Plan của người dùng, sắp xếp theo startDate mới nhất
        return MealPlan.find({ userId, ...filter })
            .sort({ startDate: -1 })
            .populate("meals") // Populate các Meal liên quan nếu cần hiển thị chi tiết
            .lean();
    }

    /**
     * Lấy chi tiết một MealPlan theo ID.
     * @param {string} planId - ID của Plan.
     * @returns {Promise<object>} MealPlan chi tiết.
     */
    async getPlanById(planId) {
        if (!mongoose.Types.ObjectId.isValid(planId)) {
            throw new Error("ID Plan không hợp lệ.");
        }
        return MealPlan.findById(planId).populate("meals").lean();
    }

    /**
     * Cập nhật trạng thái của MealPlan và xử lý các ràng buộc.
     * Đặc biệt quan trọng khi chuyển từ "suggested" sang "selected" (active).
     * @param {string} userId - ID người dùng.
     * @param {string} planId - ID của Plan cần cập nhật.
     * @param {string} newStatus - Trạng thái mới.
     * @returns {Promise<object>} MealPlan đã cập nhật.
     */
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
        if (newStatus === "selected") {
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

    /**
     * Xóa MealPlan.
     * @param {string} userId - ID người dùng.
     * @param {string} planId - ID của Plan.
     * @returns {Promise<void>} 
     */
    async deletePlan(userId, planId) {
        const result = await MealPlan.deleteOne({ _id: planId, userId, status: "suggested" });
        if (result.deletedCount === 0) {
            throw new Error("Không thể xóa Plan đã được chọn (selected) hoặc không tìm thấy.");
        }
    }
}

module.exports = new MealPlanService();