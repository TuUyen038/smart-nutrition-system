const mealPlanService = require('../services/mealPlan.service');

class MealPlanController {

    /** POST /mealplans - Tạo Plan mới */
    async createMealPlan(req, res) {
        try {
            // Lấy userId từ middleware xác thực (Auth)
            //const userId = req.userId; 
            const userId = req.body.id;
            const planData = req.body;

            // Kiểm tra các trường bắt buộc cơ bản (có thể dùng middleware validator riêng)
            if (!planData.period || !planData.startDate) {
                return res.status(400).json({ error: "period và startDate là bắt buộc." });
            }

            const newPlan = await mealPlanService.createPlan(userId, planData);
            res.status(201).json({ message: "MealPlan đã được tạo thành công.", data: newPlan });

        } catch (error) {
            console.error("Lỗi khi tạo MealPlan:", error.message);
            res.status(500).json({ error: error.message || "Lỗi server nội bộ." });
        }
    }

    /** GET /mealplans - Lấy danh sách Plan */
    async getMealPlans(req, res) {
        try {
            const userId = req.userId; 
            const plans = await mealPlanService.getPlansByUserId(userId, req.query); // Cho phép lọc qua query params

            res.status(200).json({ data: plans });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách MealPlan:", error.message);
            res.status(500).json({ error: "Lỗi server nội bộ." });
        }
    }

    /** GET /mealplans/:planId - Lấy chi tiết Plan */
    async getMealPlanDetail(req, res) {
        try {
            const { planId } = req.params;
            const plan = await mealPlanService.getPlanById(planId);

            if (!plan || plan.userId.toString() !== req.userId) {
                return res.status(404).json({ error: "Không tìm thấy MealPlan." });
            }

            res.status(200).json({ data: plan });
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết MealPlan:", error.message);
            res.status(500).json({ error: error.message || "Lỗi server nội bộ." });
        }
    }

    /** PATCH /mealplans/:planId/status - Cập nhật trạng thái Plan */
    async updatePlanStatus(req, res) {
        try {
            const { planId } = req.params;
            const { newStatus } = req.body;
            const userId = req.userId;

            if (!newStatus) {
                return res.status(400).json({ error: "newStatus là bắt buộc." });
            }

            const updatedPlan = await mealPlanService.updatePlanStatus(userId, planId, newStatus);
            res.status(200).json({ message: `Đã cập nhật trạng thái Plan thành ${newStatus}.`, data: updatedPlan });

        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái Plan:", error.message);
            // Bắt lỗi nghiệp vụ từ Service để trả về status 400
            if (error.message.includes("không hợp lệ") || error.message.includes("Không thể cập nhật")) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Lỗi server nội bộ." });
        }
    }

    /** DELETE /mealplans/:planId - Xóa Plan */
    async deleteMealPlan(req, res) {
        try {
            const { planId } = req.params;
            const userId = req.userId;

            await mealPlanService.deletePlan(userId, planId);
            res.status(200).json({ message: "MealPlan đã được xóa thành công." });
            
        } catch (error) {
            console.error("Lỗi khi xóa MealPlan:", error.message);
            // Trả về 400 nếu không được phép xóa (ví dụ: đã selected)
            if (error.message.includes("Không thể xóa Plan đã được chọn")) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Lỗi server nội bộ." });
        }
    }
}

module.exports = new MealPlanController();
