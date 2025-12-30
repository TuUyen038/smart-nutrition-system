const Ingredient = require("../models/Ingredient");
const ingredientService = require("../services/ingredient.service");
const { logAction } = require("../middlewares/auditLog");

/**
 * Lấy toàn bộ nguyên liệu với pagination và sorting
 */
exports.getAllIngredients = async (req, res) => {
  try {
    const {
      search,
      category,
      page = 1,
      limit = 20,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    // Build query
    const query = {};
    
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { name_en: { $regex: search.trim(), $options: "i" } },
      ];
    }
    
    if (category && category !== "all") {
      query.category = category;
    }

    // Build sort
    const sort = {};
    const validSortFields = ["name", "name_en", "category", "calories", "protein", "carbs", "fat", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "name";
    sort[sortField] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const [ingredients, total] = await Promise.all([
      Ingredient.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Ingredient.countDocuments(query),
    ]);

    res.status(200).json({
      data: ingredients,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Lấy thống kê nguyên liệu
 */
exports.getIngredientStats = async (req, res) => {
  try {
    const [total, byCategory] = await Promise.all([
      Ingredient.countDocuments(),
      Ingredient.aggregate([
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
    ]);

    const categoryMap = {
      protein: "Protein",
      carb: "Carb",
      fat: "Chất béo",
      vegetable: "Rau củ",
      fruit: "Trái cây",
      dairy: "Sữa & chế phẩm",
      seasoning: "Gia vị",
      beverage: "Thức uống",
      other: "Khác",
    };

    const stats = {
      total,
      byCategory: byCategory.map((item) => ({
        category: item._id,
        categoryLabel: categoryMap[item._id] || item._id,
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
exports.checkDuplicateName = async (req, res) => {
  try {
    const { name, excludeId } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Tên nguyên liệu là bắt buộc" });
    }

    const query = { name: { $regex: new RegExp(`^${name.trim()}$`, "i") } };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Ingredient.findOne(query);
    res.status(200).json({ isDuplicate: !!existing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Lấy nguyên liệu theo ID
 */
exports.getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.status(200).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Search nguyên liệu theo tên hoặc danh mục
 */
exports.searchIngredients = async (req, res) => {
  try {
    const result = await ingredientService.searchIngredients(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Validation helper
 */
const validateIngredient = (data, isUpdate = false) => {
  const errors = [];

  // Name validation
  if (!isUpdate && !data.name?.trim()) {
    errors.push("Tên nguyên liệu (tiếng Việt) là bắt buộc");
  }

  // Nutrition validation
  if (data.nutrition) {
    const nutrition = data.nutrition;
    
    // Calories validation
    if (nutrition.calories !== undefined && (nutrition.calories < 0 || nutrition.calories > 10000)) {
      errors.push("Calories phải từ 0 đến 10000");
    }

    // Protein, carbs, fat validation
    ["protein", "carbs", "fat"].forEach((field) => {
      if (nutrition[field] !== undefined && (nutrition[field] < 0 || nutrition[field] > 1000)) {
        errors.push(`${field} phải từ 0 đến 1000g`);
      }
    });

    // Sugar, sodium validation
    if (nutrition.sugar !== undefined && (nutrition.sugar < 0 || nutrition.sugar > 1000)) {
      errors.push("Sugar phải từ 0 đến 1000g");
    }
    if (nutrition.sodium !== undefined && (nutrition.sodium < 0 || nutrition.sodium > 100000)) {
      errors.push("Sodium phải từ 0 đến 100000mg");
    }

    // Logic check: protein + carbs + fat không nên quá 100g (có thể có nước, chất xơ)
    const totalMacros = (nutrition.protein || 0) + (nutrition.carbs || 0) + (nutrition.fat || 0);
    if (totalMacros > 100) {
      errors.push("Tổng Protein + Carbs + Fat không nên vượt quá 100g (có thể có nước và chất xơ)");
    }
  }

  return errors;
};

/**
 * Thêm nguyên liệu (Admin)
 */
exports.createIngredient = async (req, res) => {
  try {
    // Validation
    const validationErrors = validateIngredient(req.body, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: validationErrors.join(", "),
        errors: validationErrors 
      });
    }

    // Check duplicate name
    const existing = await Ingredient.findOne({
      name: { $regex: new RegExp(`^${req.body.name.trim()}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({ 
        message: `Nguyên liệu "${req.body.name}" đã tồn tại` 
      });
    }

    // Create ingredient
    const ingredient = new Ingredient({
      name: req.body.name.trim(),
      name_en: req.body.name_en?.trim() || undefined,
      nutrition: req.body.nutrition || {},
      unit: req.body.unit || "g",
      category: req.body.category || "other",
      source: req.body.source?.trim() || undefined,
      aliases: req.body.aliases || [],
      external_refs: req.body.external_refs || [],
    });

    await ingredient.save();

    // Ghi audit log
    await logAction(
      req,
      "CREATE",
      "Ingredient",
      ingredient._id,
      null,
      { name: ingredient.name, category: ingredient.category },
      "Admin created ingredient"
    );

    res.status(201).json(ingredient);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * Cập nhật nguyên liệu (Admin)
 */
exports.updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    // Lưu dữ liệu cũ để audit log
    const oldData = ingredient.toObject();

    // Validation
    const validationErrors = validateIngredient(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: validationErrors.join(", "),
        errors: validationErrors 
      });
    }

    // Check duplicate name (nếu đổi tên)
    if (req.body.name && req.body.name.trim() !== ingredient.name) {
      const existing = await Ingredient.findOne({
        name: { $regex: new RegExp(`^${req.body.name.trim()}$`, "i") },
        _id: { $ne: req.params.id },
      });

      if (existing) {
        return res.status(400).json({ 
          message: `Nguyên liệu "${req.body.name}" đã tồn tại` 
        });
      }
    }

    // Update
    Object.assign(ingredient, {
      name: req.body.name?.trim() || ingredient.name,
      name_en: req.body.name_en?.trim() || ingredient.name_en,
      nutrition: req.body.nutrition || ingredient.nutrition,
      unit: req.body.unit || ingredient.unit,
      category: req.body.category || ingredient.category,
      source: req.body.source?.trim() || ingredient.source,
      aliases: req.body.aliases || ingredient.aliases,
      external_refs: req.body.external_refs || ingredient.external_refs,
    });

    await ingredient.save();

    // Ghi audit log
    await logAction(
      req,
      "UPDATE",
      "Ingredient",
      ingredient._id,
      oldData,
      ingredient.toObject(),
      req.body.reason || "Admin updated ingredient"
    );

    res.status(200).json(ingredient);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * Xóa nguyên liệu (Admin)
 */
exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    // Lưu dữ liệu cũ để audit log
    const oldData = ingredient.toObject();

    // Xóa
    await Ingredient.findByIdAndDelete(req.params.id);

    // Ghi audit log
    await logAction(
      req,
      "DELETE",
      "Ingredient",
      req.params.id,
      oldData,
      null,
      req.body.reason || "Admin deleted ingredient"
    );

    res.status(200).json({ message: "Ingredient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
