const fs = require("fs");
const Recipe = require("../models/Recipe");
const mongoose = require("mongoose");
const {
  createRecipe,
  saveRecipeToDB,
  getVerifiedRecipes,
  searchRecipesByIngredientName,
  searchRecipesByImage,
} = require("../services/recipe.service");

const {
  identifyFoodName,
  getRecipe,
  getSubstitutionsAndWarnings,
  getRecipeStream,
  getIngredients,
  getIngredientSubstitutions: getIngredientSubstitutionsAI,
} = require("../utils/ai_providers/aiInterface");
const Analysis = require("../models/Analysis");
const recipeService = require("../services/recipe.service");

const searchByIngredientName = async (req, res) => {
  try {
    const { keyword, page, limit } = req.query;
    const result = await searchRecipesByIngredientName(keyword, {
      page,
      limit,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("searchRecipes error:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm món ăn",
    });
  }
};
//lay danh sach mon an
const getAllRecipe = async (req, res) => {
  try {
    const {
      search,
      category,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      query.category = category;
    }

    // Build sort
    const sort = {};
    const validSortFields = [
      "name",
      "category",
      "servings",
      "createdAt",
      "updatedAt",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Filter deleted: false (chỉ lấy món chưa bị xóa)
    query.deleted = { $ne: true };

    // Execute query
    const [recipes, total] = await Promise.all([
      Recipe.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Recipe.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: recipes,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const detectImage = async (req, res, next) => {
  const imageFile = req.file;
  const modelToUse = req.body.model || "gemini-2.5-flash"; // Đặt model mặc định rõ ràng hơn

  let foodName;

  // Hàm Parse an toàn và loại bỏ ký tự không mong muốn (```json)
  const safeParse = (text, defaultVal = {}) => {
    if (typeof text !== "string") return defaultVal;
    try {
      return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (e) {
      console.warn(`⚠️ Lỗi Parse JSON: ${e.message}. Trả về giá trị mặc định.`);
      // Trả về một đối tượng chứa chuỗi thô để debug, nếu parse lỗi
      return { error: `Lỗi Parse JSON: ${e.message}`, rawText: text };
    }
  };

  if (!imageFile) {
    return res.status(400).json({ message: "Vui lòng cung cấp file ảnh." });
  }

  try {
    console.log("1. Bắt đầu nhận diện món ăn...");

    const detectionJsonString = await identifyFoodName(imageFile);
    const parsedDetection = safeParse(detectionJsonString);

    // Trích xuất Tên món ăn
    foodName = parsedDetection.foodName || "Không xác định";

    if (foodName === "Không xác định" || parsedDetection.error) {
      return res.status(400).json({
        message: "Không thể nhận diện món ăn trong hình ảnh.",
        rawDetection: parsedDetection,
      });
    }

    res.status(200).json({
      foodName: foodName,
    });
  } catch (error) {
    console.error("Global Error:", error);
    next(error);
  } finally {
    // Dọn file tạm
    if (imageFile && fs.existsSync(imageFile.path)) {
      fs.unlink(imageFile.path, (err) => {
        if (err) console.error("Lỗi khi xóa file tạm:", err);
      });
    }
  }
};

/**
 * Hybrid Image→Text→Search
 * Tìm kiếm recipes trong database dựa trên ảnh món ăn
 * 1. Detect tên món từ ảnh (dùng Gemini)
 * 2. Text search trong database với tên món vừa detect
 * 3. Return kết quả
 */
const searchByImage = async (req, res, next) => {
  const imageFile = req.file;
  const { page = 1, limit = 20 } = req.query;

  // Hàm Parse an toàn
  const safeParse = (text, defaultVal = {}) => {
    if (typeof text !== "string") return defaultVal;
    try {
      return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch (e) {
      console.warn(`⚠️ Lỗi Parse JSON: ${e.message}`);
      return { error: `Lỗi Parse JSON: ${e.message}`, rawText: text };
    }
  };

  if (!imageFile) {
    return res.status(400).json({ message: "Vui lòng cung cấp file ảnh." });
  }

  try {
    console.log("Bắt đầu tìm kiếm món ăn bằng ảnh...");

    // Bước 1: Detect tên món từ ảnh
    const detectionJsonString = await identifyFoodName(imageFile);
    const parsedDetection = safeParse(detectionJsonString);
    const foodName = parsedDetection.foodName || null;

    if (!foodName || foodName === "Không xác định" || parsedDetection.error) {
      return res.status(400).json({
        success: false,
        message: "Không thể nhận diện món ăn trong hình ảnh.",
        rawDetection: parsedDetection,
      });
    }

    console.log(`Tên món được nhận diện: "${foodName}"`);

    // Bước 2: Text search trong database
    const searchResult = await searchRecipesByImage(foodName, {
      page: Number(page),
      limit: Number(limit),
    });

    console.log(`Tìm thấy ${searchResult.recipes.length} kết quả`);

    // Bước 3: Return kết quả
    res.status(200).json({
      success: true,
      detectedFoodName: foodName,
      data: searchResult.recipes,
      pagination: {
        page: searchResult.page,
        limit: searchResult.limit,
        total: searchResult.total,
        totalPages: Math.ceil(searchResult.total / searchResult.limit),
      },
    });
  } catch (error) {
    console.error("[Hybrid Search] Error:", error);
    next(error);
  } finally {
    // Dọn file tạm
    if (imageFile && fs.existsSync(imageFile.path)) {
      fs.unlink(imageFile.path, (err) => {
        if (err) console.error("Lỗi khi xóa file tạm:", err);
      });
    }
  }
};
const getRecipeById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid recipe ID" });
  }

  try {
    const recipe = await Recipe.findOne({
      _id: id,
      deleted: { $ne: true },
    })
      .populate({
        path: "ingredients.ingredientId",
        select: "name name_en",
        match: { deleted: { $ne: true } },
      })
      .lean();
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Map ingredients để thêm ingredientLabel từ populated data
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      recipe.ingredients = recipe.ingredients.map((ing) => {
        const populatedIngredient = ing.ingredientId;
        // Nếu ingredientId được populate thành object (có _id, name, name_en)
        // thì đây là ingredient hợp lệ, lấy name từ đó
        if (
          populatedIngredient &&
          typeof populatedIngredient === "object" &&
          populatedIngredient._id
        ) {
          return {
            ...ing,
            ingredientLabel:
              populatedIngredient.name ||
              populatedIngredient.name_en ||
              ing.name ||
              "",
          };
        }
        // Nếu ingredientId là ObjectId nhưng không populate được (ingredient bị xóa)
        // hoặc không có ingredientId, giữ nguyên name từ DB
        return {
          ...ing,
          ingredientLabel: ing.ingredientLabel || ing.name || "",
        };
      });
    }

    return res.status(200).json(recipe);
  } catch (error) {
    console.error("Lỗi khi tìm món ăn:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server.", error: error.message });
  }
};

const findRecipeByName = async (req, res) => {
  const { foodName } = req.params;

  try {
    const recipe = await Recipe.findOne({
      name: { $regex: new RegExp(foodName, "i") },
      verified: true,
      deleted: { $ne: true }, // Filter deleted
    })
      .select("name ingredients instructions totalNutrition")
      .populate("ingredients", "name quantity unit")
      .lean();
    if (!recipe) {
      console.log(` Không tìm thấy trong DB: ${foodName}`);

      return res.status(200).json(null);
    }

    console.log(`Đã tìm thấy công thức trong DB: ${recipe.name}`);
    return res.status(200).json(recipe);
  } catch (error) {
    console.error("Lỗi khi tìm mon an:", error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi tìm công thức.", error: error.message });
  }
};

const safeParse = (text, defaultVal = {}) => {
  if (!text || typeof text !== "string") return defaultVal;
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (e) {
    console.warn(`Lỗi Parse JSON: ${e.message}. Trả về raw text.`);
    return { error: e.message, rawText: text };
  }
};
const createNewRecipe = async (req, res) => {
  const recipeData = req.body;

  try {
    const savedRecipe = await saveRecipeToDB(recipeData);
    return res.status(201).json(savedRecipe);
  } catch (error) {
    console.error(error);
    // Trả về lỗi nếu service báo lỗi
    return res
      .status(500)
      .json({ message: "Lỗi server khi tạo công thức.", error: error.message });
  }
};

const findIngrAndInstrByAi = async (req, res, next) => {
  const foodName = req.params.foodName || req.body?.foodName;

  if (!foodName) {
    return res
      .status(400)
      .json({ message: "Thiếu foodName (params hoặc body)." });
  }

  try {
    console.log("Bắt đầu tìm trong AI cho:", foodName);

    const aiRaw = await getRecipe(foodName);
    const aiData = typeof aiRaw === "string" ? safeParse(aiRaw) : aiRaw || {};
    const result = {
      name: foodName,
      ingredients: aiData.ingredients || [],
      instructions: aiData.instructions || [],
      servings: aiData.servings || 1,
    };
    if (
      (result.ingredients && result.ingredients.length > 0) ||
      (result.instructions && result.instructions.length > 0)
    ) {
      // Tạo object dữ liệu công thức hoàn chỉnh
      const recipeDataToSave = {
        name: result.name,
        description: `Công thức gợi ý bởi AI cho món ${result.name}.`,
        category: "main",
        instructions: result.instructions,
        ingredients: result.ingredients,
        totalNutrition: null,
        createdBy: "ai",
        verified: false,
      };
      // saveRecipeToDB(recipeDataToSave)
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Global Error:", error);
    return next(error);
  }
};
const findIngredientsByAi = async (req, res, next) => {
  const { recipe, servings } = req.body;

  if (!recipe) {
    return res.status(400).json({ message: "Thiếu recipe" });
  }

  try {
    console.log(
      "Bắt đầu tìm nguyên liệu bởi AI",
      servings ? `(servings: ${servings})` : ""
    );

    const aiRaw = await getIngredients(recipe, servings);
    const aiData = typeof aiRaw === "string" ? safeParse(aiRaw) : aiRaw || {};
    const result = {
      ingredients: aiData.ingredients || [],
    };
    // Trả về servings nếu có từ AI response
    if (aiData.servings) {
      result.servings = aiData.servings;
    }
    const dataToSave = {
      ingredients: result.ingredients,
    };
    if (result.servings) {
      dataToSave.servings = result.servings;
    }
    return res.status(200).json(dataToSave);
  } catch (error) {
    console.error("Global Error:", error);
    return next(error);
  }
};
const getBackUpNutrition = async (req, res) => {
  const { ingrs } = req.body;
  const result = await getNutritionByAi(ingrs);
  return res.status(200).json(result);
};

/**
 * Lấy thống kê recipes
 */
const getRecipeStats = async (req, res) => {
  try {
    const [total, byCategory, byCreatedBy] = await Promise.all([
      Recipe.countDocuments(),
      Recipe.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]),
      Recipe.aggregate([
        {
          $group: {
            _id: "$createdBy",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]),
    ]);

    const categoryMap = {
      main: "Món chính",
      side: "Món phụ",
      dessert: "Tráng miệng",
      drink: "Đồ uống",
    };

    const stats = {
      total,
      byCategory: byCategory.map((item) => ({
        category: item._id,
        categoryLabel: categoryMap[item._id] || item._id,
        count: item.count,
      })),
      byCreatedBy: byCreatedBy.map((item) => ({
        createdBy: item._id || "admin",
        count: item.count,
      })),
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Kiểm tra trùng tên
 */
const checkDuplicateName = async (req, res) => {
  try {
    const { name, excludeId } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Tên món ăn là bắt buộc" });
    }

    const query = {
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      deleted: { $ne: true }, // Filter deleted
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Recipe.findOne(query);
    res.status(200).json({ isDuplicate: !!existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Validation helper
 */
const validateRecipe = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate && !data.name?.trim()) {
    errors.push("Tên món ăn là bắt buộc");
  }

  if (
    data.servings !== undefined &&
    (data.servings < 1 || data.servings > 100)
  ) {
    errors.push("Khẩu phần phải từ 1 đến 100");
  }

  if (
    data.category &&
    !["main", "side", "dessert", "drink"].includes(data.category)
  ) {
    errors.push("Danh mục không hợp lệ");
  }

  if (data.ingredients && !Array.isArray(data.ingredients)) {
    errors.push("Nguyên liệu phải là mảng");
  }

  return errors;
};

/**
 * Cập nhật recipe
 */
const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    // Lấy recipe hiện tại để lưu oldData và tính toán
    const existingRecipe = await Recipe.findById(id);
    if (!existingRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Validation
    const validationErrors = validateRecipe(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: validationErrors.join(", "),
        errors: validationErrors,
      });
    }

    // Check duplicate name (nếu đổi tên)
    if (req.body.name && req.body.name.trim() !== existingRecipe.name) {
      const existing = await Recipe.findOne({
        name: { $regex: new RegExp(`^${req.body.name.trim()}$`, "i") },
        _id: { $ne: id },
        deleted: { $ne: true }, // Filter deleted
      });

      if (existing) {
        return res.status(400).json({
          message: `Món ăn "${req.body.name}" đã tồn tại`,
        });
      }
    }

    // Calculate totalNutrition if ingredients are provided
    const {
      calculateRecipeNutrition,
    } = require("../utils/calculateRecipeNutrition");
    let totalNutrition = existingRecipe.totalNutrition;
    const ingredientsToUse = req.body.ingredients || existingRecipe.ingredients;
    if (
      ingredientsToUse &&
      Array.isArray(ingredientsToUse) &&
      ingredientsToUse.length > 0
    ) {
      try {
        totalNutrition = await calculateRecipeNutrition(
          ingredientsToUse,
          req.body.servings || existingRecipe.servings || 1
        );
      } catch (error) {
        console.error("Error calculating nutrition:", error);
        // Keep existing nutrition if calculation fails
      }
    }

    // Set ảnh mặc định nếu không có imageUrl
    const defaultImageUrl =
      "https://res.cloudinary.com/denhj5ubh/image/upload/v1762249278/foodImages/na8m4c70iiitfjvkie9m.jpg";
    const imageUrl =
      req.body.imageUrl || existingRecipe.imageUrl || defaultImageUrl;

    // Build update object
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name.trim();
    if (req.body.description !== undefined)
      updateData.description = req.body.description?.trim();
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.servings !== undefined)
      updateData.servings = req.body.servings;
    if (req.body.instructions !== undefined)
      updateData.instructions = req.body.instructions;
    if (req.body.ingredients !== undefined)
      updateData.ingredients = ingredientsToUse;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.verified !== undefined)
      updateData.verified = req.body.verified;
    if (totalNutrition !== undefined)
      updateData.totalNutrition = totalNutrition;

    // Update using findByIdAndUpdate to avoid version conflicts
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found after update" });
    }

    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error("Update recipe error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * Xóa recipe
 */
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Soft delete: Set deleted = true thay vì xóa
    recipe.deleted = true;
    await recipe.save();

    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Gợi ý nguyên liệu thay thế
 */
const getIngredientSubstitutions = async (req, res) => {
  try {
    const {
      ingredientsToSubstitute,
      allIngredients,
      userGoal,
      instructions,
      dishName,
    } = req.body;

    // LOG: Request từ frontend
    console.log("🔵 [Controller] ===== REQUEST TỪ FRONTEND =====");
    console.log(
      "ingredientsToSubstitute count:",
      ingredientsToSubstitute?.length || 0
    );
    console.log("📋 allIngredients count:", allIngredients?.length || 0);
    console.log("🎯 userGoal:", userGoal);
    console.log("🍽️ dishName:", dishName);
    console.log("📝 instructions length:", instructions?.length || 0);
    if (ingredientsToSubstitute && ingredientsToSubstitute.length > 0) {
      console.log(
        "📄 ingredientsToSubstitute details:",
        JSON.stringify(ingredientsToSubstitute, null, 2)
      );
    }

    if (
      !ingredientsToSubstitute ||
      !Array.isArray(ingredientsToSubstitute) ||
      ingredientsToSubstitute.length === 0
    ) {
      console.log(
        "[Controller] Validation failed: ingredientsToSubstitute is empty"
      );
      return res.status(400).json({
        success: false,
        message: "Danh sách nguyên liệu cần thay thế là bắt buộc",
      });
    }

    if (
      !allIngredients ||
      !Array.isArray(allIngredients) ||
      allIngredients.length === 0
    ) {
      console.log("[Controller] Validation failed: allIngredients is empty");
      return res.status(400).json({
        success: false,
        message: "Danh sách tất cả nguyên liệu là bắt buộc",
      });
    }

    if (!userGoal) {
      console.log(" [Controller] Validation failed: userGoal is missing");
      return res.status(400).json({
        success: false,
        message: "Mục tiêu của người dùng là bắt buộc",
      });
    }

    const result = await getIngredientSubstitutionsAI(
      ingredientsToSubstitute,
      allIngredients,
      userGoal,
      instructions || "",
      dishName || ""
    );

    // Parse JSON result
    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
      console.log("[Controller] ===== KẾT QUẢ TRẢ VỀ FRONTEND =====");
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xử lý kết quả từ AI",
      });
    }

    return res.json({
      success: true,
      data: parsedResult,
    });
  } catch (error) {
    console.error("getIngredientSubstitutions error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi gợi ý nguyên liệu thay thế",
    });
  }
};

module.exports = {
  searchByIngredientName,
  searchByImage,
  getAllRecipe,
  detectImage,
  findRecipeByName,
  findIngrAndInstrByAi,
  getBackUpNutrition,
  createNewRecipe,
  getRecipeById,
  findIngredientsByAi,
  getRecipeStats,
  checkDuplicateName,
  updateRecipe,
  deleteRecipe,
  getIngredientSubstitutions,
};
