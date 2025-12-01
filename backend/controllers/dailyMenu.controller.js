// src/controllers/meal.controller.js

const dailyMenuService = require("../services/dailyMenu.service");
const Recipe = require("../models/Recipe");
const DailyMenu = require("../models/DailyMenu");

const userId = "68f4394c4d4cc568e6bc5daa";

/**
 * POST /api/daily-menus/suggest
 * body: { userId, date }  // date: "YYYY-MM-DD"
 */
exports.suggestDailyMenu = async (req, res) => {
  try {
    const { userId, date } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ message: "userId và date là bắt buộc" });
    }

    const dailyMenu = await dailyMenuService.suggestDailyMenu({
      userId,
      dateStr: date,
    });
    await dailyMenu.populate({
      path: "recipes.recipeId",
      model: "Recipe",
    });
    return res.status(201).json(dailyMenu);
  } catch (err) {
    console.error("Error suggestDailyMenu:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createDailyMenu = async (req, res) => {
  try {
    const meal = await dailyMenuService.createMeal(req.body);
    res.status(200).json(meal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getDailyMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await dailyMenuService.getMealDetail(userId, id);
    res.status(200).json(detail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving meal detail" });
  }
};
exports.getAllDailyMenu = async (req, res) => {
  try {
    const detail = await dailyMenuService.getAllMeal(userId);
    res.status(200).json(detail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving meal detail" });
  }
};

exports.getRecipesByDateAndStatus = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const data = await dailyMenuService.getRecipesByDateAndStatus({
      userId,
      startDate,
      endDate,
      status,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// API: GET /api/meals/history
exports.getHistory = async (req, res) => {
  try {
    //const userId = req.user.id; // Lấy userId từ middleware xác thực
    const userId = req.body.id;
    const history = await dailyMenuService.getMealHistory(userId);
    res.status(200).json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving meal history" });
  }
};

// API: POST /api/meals/add-recipe
exports.addRecipe = async (req, res) => {
  try {
    // const userId = req.user.id;
    const userId = req.body.id;
    const { date, mealType, recipeId, portion } = req.body;

    if (!date || !mealType || !recipeId) {
      return res
        .status(400)
        .json({ message: "Missing required fields: date, mealType, recipeId" });
    }

    // Gọi service để xử lý logic thêm/tạo và tính toán dinh dưỡng
    const updatedMeal = await dailyMenuService.addRecipeToMeal(
      userId,
      req.body
    );

    res.status(200).json(updatedMeal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding recipe to meal" });
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

    const updatedMeal = await dailyMenuService.updateMealStatus(
      mealId,
      newStatus
    );
    res.status(200).json(updatedMeal);
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ message: error.message || "Error updating meal status" });
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
    const updatedMeal = await dailyMenuService.updateMeal(
      mealId,
      updateData,
      userId
    );

    res.status(200).json(updatedMeal);
  } catch (error) {
    console.error(error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("Permission denied")) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: "Error updating meal: " + error.message });
  }
};

exports.addRecipeToDailyMenu = async (req, res) => {
  try {
    const { userId, date, recipeId, portion, note, servingTime } = req.body;

    if (!userId || !date || !recipeId) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Tìm dailyMenu của ngày đó
    let dailyMenu = await DailyMenu.findOne({ userId, date: date });

    if (!dailyMenu) {
      // Nếu chưa có, tạo mới
      dailyMenu = new DailyMenu({
        userId,
        date: date,
        recipes: [],
      });
    }

    // Thêm recipe mới vào array
    dailyMenu.recipes.push({
      recipeId,
      portion: portion || 1,
      note: note || "",
      servingTime: servingTime || "other",
    });

    await dailyMenu.save();

    res.status(200).json({ message: "Thêm món ăn thành công", dailyMenu });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi thêm món ăn" });
  }
};
