const DailyMenu = require("../models/DailyMenu");
const MealPlan = require("../models/MealPlan");
const { calculateTotalNutrition } = require("../utils/calTotalNutri");
const mongoose = require("mongoose");
const { normalizeDate } = require("../utils/date");

exports.createMeal = async (data) => {
  try {
    let { userId, date, recipes, status, feedback } = data;

    if (!userId || !date) {
      throw new Error("Thiếu userId hoặc date.");
    }

    let existing = await DailyMenu.findOne({ userId, date });
    date = normalizeDate(date);

    const normalizedRecipes = (recipes || []).map((r) => ({
      recipeId: r.recipeId,
      portion: r.portion || 1,
      note: r.note || "",
      status: r.status || "planned",
    }));

    const totalNutrition = await calculateTotalNutrition(normalizedRecipes);

    if (!existing) {
      // Tạo mới
      const created = await DailyMenu.create({
        userId,
        date,
        recipes: normalizedRecipes,
        totalNutrition,
        status: status || "planned",
        feedback: feedback || null,
      });

      console.log(`Tạo menu mới cho ngày ${date}`);
      return { type: "created", data: created };
    }

    // Cập nhật
    existing.recipes = normalizedRecipes;
    existing.totalNutrition = totalNutrition;
    if (status) existing.status = status;
    if (feedback !== undefined) existing.feedback = feedback;

    await existing.save();
    return { type: "updated", data: existing };
  } catch (error) {
    console.error("Lỗi upsert DailyMenu:", error);
    throw new Error("Không thể lưu thực đơn: " + error.message);
  }
};

exports.getMealHistory = async (userId) => {
  return DailyMenu.find({ userId, status: "completed" })
    .sort({ date: -1 })
    .populate({
      path: "recipes._id",
      model: "Recipe",
      select: "date name imageUrl totalNutrition",
    });
};

exports.getRecipesByDateAndStatus = async (data) => {
  try {
    let { userId, startDate, endDate, status } = data;
    if (!endDate) endDate = startDate;
    if (!userId || !startDate) {
      throw new Error("Thiếu thời gian hoặc userId.");
    }

    startDate = normalizeDate(startDate);
    endDate = normalizeDate(endDate);

    const dailyMenus = await DailyMenu.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .populate({
        path: "recipes.recipeId",
        model: "Recipe",
      })
      .lean();
    if (!dailyMenus?.length) return [];

    const isFilteringByStatus = status && status.trim() !== "";

    const history = dailyMenus.map((menu) => {
      const recipes = menu.recipes
        .filter((r) => (isFilteringByStatus ? r.status === status : true))
        .map(({ recipeId, portion, note, status }) => ({
          recipeId: recipeId,
          name: recipeId?.name,
          imageUrl: recipeId?.imageUrl,
          totalNutrition: recipeId?.totalNutrition,
          description: recipeId?.description,
          portion,
          status,
        }));

      return {
        ...menu,
        recipes,
      };
    });

    return history;
  } catch (err) {
    console.error(err);
    throw new Error("Lỗi khi lấy dữ liệu daily menu");
  }
};

exports.getMealDetail = async (userId, mealId) => {
  const meal = await DailyMenu.findOne({
    userId: userId,
    _id: mealId,
  })
    .populate({
      path: "recipes.recipeId",
      model: "Recipe",
      select: "name description imageUrl totalNutrition",
    })
    .exec();

  if (!meal) {
    throw new Error("Meal not found or access denied.");
  }

  // Nếu Meal là bản đã chỉnh sửa, có thể thêm logic lấy bản gốc AI để so sánh
  if (meal.originalMealId) {
    // Có thể populate thêm originalMealId tại đây hoặc để Controller xử lý việc này
  }

  return meal;
};
exports.getAllMeal = async (userId) => {
  const meal = await Meal.findAll({
    userId: userId,
  })
    .populate({
      path: "recipes.recipeId",
      model: "Recipe",
      select: "name description imageUrl totalNutrition",
    })
    .exec();

  if (!meal) {
    throw new Error("Meal not found or access denied.");
  }
  return meal;
};
exports.addRecipeToMeal = async (userId, mealData) => {
  const { date, mealType, recipeId, portion = 1.0 } = mealData;
  let meal = await DailyMenu.findOne({
    userId,
    date: new Date(date),
    mealType,
    status: { $in: ["suggested", "selected", "edited"] },
  });

  let isNewMeal = false;
  let originalMeal = null; // Biến để giữ bản ghi gốc (nếu là gợi ý AI)

  if (!meal) {
    meal = new Meal({
      userId,
      date: new Date(date),
      mealType,
      source: "user",
      status: "selected",
      recipes: [],
    });
    isNewMeal = true;
  } else if (meal.status === "suggested" && meal.source === "ai") {
    originalMeal = meal; // Lưu bản gốc A

    originalMeal.status = "archived_suggestion";
    await originalMeal.save();

    const clonedMealData = originalMeal.toObject();
    delete clonedMealData._id;
    delete clonedMealData.createdAt;
    delete clonedMealData.updatedAt;

    meal = new DailyMenu({
      ...clonedMealData,
      _id: new mongoose.Types.ObjectId(), // Gán ID mới
      source: "user", // Nguồn là người dùng đã chỉnh sửa
      status: "edited",
      originalMealId: originalMeal._id, // Trỏ về bản gốc A
    });

    if (originalMeal.mealPlanId) {
      exports.updateMealPlanOnMealClone(
        originalMeal.mealPlanId,
        oldMealId,
        meal._id // ID của Meal B
      );
    }
  } else if (meal.status === "edited" || meal.status === "selected") {
    meal.status = "edited"; // Bất kỳ sự thay đổi nào cũng coi là chỉnh sửa
  }

  const newRecipe = { recipeId, portion, mealType };

  const existingRecipe = meal.recipes.find(
    (r) => r.recipeId.toString() === recipeId
  );
  if (existingRecipe) {
    existingRecipe.portion += portion;
  } else {
    meal.recipes.push(newRecipe);
  }

  meal.totalNutrition = await calculateTotalNutrition(meal.recipes);

  await meal.save();

  return meal;
};

async function checkAndUpdateMealPlanStatus(mealPlanId) {
  if (!mealPlanId) return;

  const mealsInPlan = await Meal.find({ mealPlanId: mealPlanId });

  const totalMeals = mealsInPlan.length;
  const completedMeals = mealsInPlan.filter((m) => m.status === "done").length;
  const cancelledMeals = mealsInPlan.filter(
    (m) => m.status === "cancelled"
  ).length;

  const pendingMeals = totalMeals - completedMeals - cancelledMeals;
  let newPlanStatus = null;

  if (totalMeals === 0) {
    newPlanStatus = "cancelled";
  } else if (pendingMeals === 0) {
    newPlanStatus = "past";
  }
  if (newPlanStatus) {
    await MealPlan.findByIdAndUpdate(mealPlanId, { status: newPlanStatus });
  }
}
exports.updateMealStatus = async (mealId, newStatus) => {
  const meal = await Meal.findById(mealId);

  if (!meal) {
    throw new Error("Meal not found");
  }

  const validStatuses = [
    "suggested",
    "selected",
    "edited",
    "done",
    "cancelled",
    "archived_suggestion",
  ];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const oldStatus = meal.status;
  meal.status = newStatus;

  await meal.save();

  if (
    meal.mealPlanId &&
    (newStatus === "done" || newStatus === "cancelled") &&
    oldStatus !== newStatus
  ) {
    await checkAndUpdateMealPlanStatus(meal.mealPlanId);
  }

  return meal;
};

exports.updateMeal = async (mealId, updateData, userId) => {
  let meal = await Meal.findById(mealId);

  if (!meal) {
    throw new Error("Meal not found.");
  }
  const oldStatus = meal.status;
  const oldMealId = meal._id;
  let newMeal = meal; // Mặc định là bản gốc, sẽ thay đổi nếu có clone
  if (meal.source === "ai" && oldStatus === "suggested" && updateData.recipes) {
    meal.status = "archived_suggestion";
    await meal.save();

    const clonedMealData = meal.toObject();
    delete clonedMealData._id;
    delete clonedMealData.createdAt;
    delete clonedMealData.updatedAt;

    newMeal = new Meal({
      ...clonedMealData,
      _id: new mongoose.Types.ObjectId(),
      source: "user", // Nguồn từ người dùng (đã chỉnh sửa/chốt)
      status: "edited", // Trạng thái là bản đã được chỉnh sửa
      originalMealId: oldMealId, // Trỏ về bản gốc A (để truy vết)
    });

    if (meal.mealPlanId) {
      await MealPlanService.updateMealPlanOnMealClone(
        meal.mealPlanId,
        oldMealId,
        newMeal._id
      );
    }
  }
  if (updateData.recipes) {
    newMeal.recipes = updateData.recipes;
  }

  Object.keys(updateData).forEach((key) => {
    // Tránh ghi đè các trường cố định
    if (
      key !== "recipes" &&
      key !== "userId" &&
      key !== "mealPlanId" &&
      newMeal[key] !== undefined
    ) {
      newMeal[key] = updateData[key];
    }
  });
  if (updateData.status && updateData.status !== newMeal.status) {
    newMeal.status = updateData.status;
  }
  newMeal.totalNutrition = await calculateTotalNutrition(newMeal.recipes);
  await newMeal.save();
  return newMeal;
};
