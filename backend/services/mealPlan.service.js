const Meal = require("../models/DailyMenu"); // Cần để tham chiếu (dù chưa dùng trong các hàm này)
const MealPlan = require("../models/MealPlan");
const { calculateEndDate } = require("../utils/mealPlan.util");
const mongoose = require("mongoose");
const DailyMenuService = require("../services/dailyMenu.service");
const DailyMenu = require("../models/DailyMenu");
const { normalizeDate } = require("../utils/date");
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
          $set: { isModified: true },
        },
        // new: true trả về bản ghi đã cập nhật, runValidators: đảm bảo dữ liệu mới hợp lệ
        { new: true, runValidators: true }
      );

      if (!updatedPlan) {
        console.warn(
          `MealPlan ID ${mealPlanId} not found during meal clone update.`
        );
      }

      return updatedPlan;
    } catch (error) {
      console.error("Lỗi khi cập nhật MealPlan on meal clone:", error);
      throw new Error("Lỗi khi cập nhật MealPlan sau khi chỉnh sửa Meal.");
    }
  }

  generateDateList(startDate, period) {
    startDate = normalizeDate(startDate);

    let total = period === "week" ? 7 : 1; // ví dụ custom thì bạn mở rộng

    const list = [];
    let d = new Date(startDate + "T00:00:00+07:00");

    for (let i = 0; i < total; i++) {
      const current = new Date(d);
      current.setDate(d.getDate() + i);
      list.push(normalizeDate(current));
      console.log("current: ", current);
    }

    return list;
  }

  /** Tạo Plan + DailyMenus */
  async createPlan(userId, planData) {
    const { startDate, period = "week", aiMeals } = planData;
    console.log("startDate: ", startDate);
    const startDateNorm = normalizeDate(startDate);
    const endDate = calculateEndDate(startDateNorm, period);
    const dates = this.generateDateList(startDateNorm, period);

    //existingMenus, dailyMenuIds,
    const existingMenus = await DailyMenu.find({
      userId,
      date: { $in: dates },
    });

    const existingMap = {};
    existingMenus.forEach((dm) => {
      existingMap[normalizeDate(dm.date)] = dm;
    });
    // console.log("existingMap: ", existingMap);

    const dailyMenuIds = [];

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i]; // string chuẩn

      let dailyMenu = existingMap[date];

      if (!dailyMenu) {
        const result = await DailyMenuService.createMeal({
          userId,
          date,
          recipes: aiMeals?.[i] || [],
          status: "planned",
        });

        if (!result?.data) {
          throw new Error(`Cannot create DailyMenu for ${date}`);
        }

        dailyMenu = result.data;
      }
      dailyMenuIds.push(dailyMenu);
    }

    console.log("dailyMenuIds: ", dailyMenuIds);
    // Tạo MealPlan tuần với tất cả DailyMenu (cũ + mới)
    const newPlan = new MealPlan({
      ...planData,
      userId,
      startDate: startDateNorm,
      endDate,
      dailyMenuIds,
      status: aiMeals ? "suggested" : "planned",
      source: aiMeals ? "ai" : "user",
    });

    await newPlan.save();
    return newPlan;
  }

  async getPlanByStartDate(userId, startDateStr) {
  const startDate = normalizeDate(startDateStr);

  return MealPlan.findOne({
    userId,
    startDate,
  })
    .populate({
      path: "dailyMenuIds",
      populate: {
        path: "recipes.recipeId",
        model: "Recipe",
      },
    });
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
      throw new Error(
        `Không thể cập nhật Plan đã ở trạng thái ${plan.status}.`
      );
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
    const result = await MealPlan.deleteOne({
      _id: planId,
      userId,
      status: "suggested",
    });
    if (result.deletedCount === 0) {
      throw new Error(
        "Không thể xóa Plan đã được chọn (selected) hoặc không tìm thấy."
      );
    }
  }
}

module.exports = new MealPlanService();
