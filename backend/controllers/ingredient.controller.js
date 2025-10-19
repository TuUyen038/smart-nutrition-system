const Ingredient = require("../models/Ingredient");
const ingredientService = require("../services/ingredient.service");
// Lấy toàn bộ nguyên liệu
exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.status(200).json(ingredients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy nguyên liệu theo ID
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

// Search nguyên liệu theo tên hoặc danh mục
exports.searchIngredients = async (req, res) => {
  try {
    const result = await ingredientService.searchIngredients(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Thêm nguyên liệu (Admin)
exports.createIngredient = async (req, res) => {
  try {
    const ingredient = new Ingredient(req.body);
    await ingredient.save();
    res.status(200).json(ingredient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật nguyên liệu (Admin)
exports.updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.status(200).json(ingredient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa nguyên liệu (Admin)
exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.status(200).json({ message: "Ingredient deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
