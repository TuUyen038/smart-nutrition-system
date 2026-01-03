const User = require("../models/User");
const Recipe = require("../models/Recipe");
const mongoose = require("mongoose");

/**
 * Thêm món ăn vào danh sách yêu thích
 * @param {string} userId - ID của user
 * @param {string} recipeId - ID của recipe
 * @returns {Promise<Object>} User đã được cập nhật
 */
exports.addFavorite = async (userId, recipeId) => {
  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("User ID không hợp lệ");
  }
  if (!mongoose.Types.ObjectId.isValid(recipeId)) {
    throw new Error("Recipe ID không hợp lệ");
  }

  // Kiểm tra recipe có tồn tại không
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new Error("Món ăn không tồn tại");
  }

  // Tìm user và kiểm tra đã favorite chưa
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User không tồn tại");
  }

  // Kiểm tra đã favorite chưa
  if (user.favoriteRecipes.includes(recipeId)) {
    throw new Error("Món ăn đã có trong danh sách yêu thích");
  }

  // Thêm vào danh sách yêu thích
  user.favoriteRecipes.push(recipeId);
  await user.save();

  return user;
};

/**
 * Xóa món ăn khỏi danh sách yêu thích
 * @param {string} userId - ID của user
 * @param {string} recipeId - ID của recipe
 * @returns {Promise<Object>} User đã được cập nhật
 */
exports.removeFavorite = async (userId, recipeId) => {
  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("User ID không hợp lệ");
  }
  if (!mongoose.Types.ObjectId.isValid(recipeId)) {
    throw new Error("Recipe ID không hợp lệ");
  }

  // Tìm user
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User không tồn tại");
  }

  // Kiểm tra có trong danh sách yêu thích không
  if (!user.favoriteRecipes.includes(recipeId)) {
    throw new Error("Món ăn không có trong danh sách yêu thích");
  }

  // Xóa khỏi danh sách yêu thích
  user.favoriteRecipes = user.favoriteRecipes.filter(
    (id) => id.toString() !== recipeId
  );
  await user.save();

  return user;
};

/**
 * Lấy danh sách món ăn yêu thích của user
 * @param {string} userId - ID của user
 * @param {Object} options - Options cho pagination
 * @returns {Promise<Object>} Danh sách recipes yêu thích
 */
exports.getFavoriteRecipes = async (userId, options = {}) => {
  const page = Number(options.page) > 0 ? Number(options.page) : 1;
  const limit = Number(options.limit) > 0 ? Number(options.limit) : 20;
  const skip = (page - 1) * limit;

  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("User ID không hợp lệ");
  }

  // Tìm user
  const user = await User.findById(userId).select("favoriteRecipes");
  if (!user) {
    throw new Error("User không tồn tại");
  }

  // Lấy danh sách recipe IDs
  const recipeIds = user.favoriteRecipes || [];

  // Lấy tổng số
  const total = recipeIds.length;

  // Lấy recipes với pagination
  const recipeIdsPaginated = recipeIds.slice(skip, skip + limit);

  // Populate recipes
  const recipes = await Recipe.find({
    _id: { $in: recipeIdsPaginated },
  })
    .sort({ createdAt: -1 })
    .lean();

  // Giữ nguyên thứ tự theo favoriteRecipes array
  const orderedRecipes = recipeIdsPaginated
    .map((id) => recipes.find((r) => r._id.toString() === id.toString()))
    .filter(Boolean);

  return {
    recipes: orderedRecipes,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Kiểm tra xem recipe có trong danh sách yêu thích không
 * @param {string} userId - ID của user
 * @param {string} recipeId - ID của recipe
 * @returns {Promise<boolean>} true nếu đã favorite, false nếu chưa
 */
exports.isFavorite = async (userId, recipeId) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(recipeId)
  ) {
    return false;
  }

  const user = await User.findById(userId).select("favoriteRecipes");
  if (!user) {
    return false;
  }

  return user.favoriteRecipes.some((id) => id.toString() === recipeId);
};

/**
 * Lấy danh sách favorite status cho nhiều recipes
 * @param {string} userId - ID của user
 * @param {string[]} recipeIds - Mảng các recipe IDs
 * @returns {Promise<Object>} Object với key là recipeId, value là boolean
 */
exports.getFavoriteStatuses = async (userId, recipeIds) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return {};
  }

  const user = await User.findById(userId).select("favoriteRecipes");
  if (!user) {
    return {};
  }

  const favoriteIds = new Set(user.favoriteRecipes.map((id) => id.toString()));

  const statuses = {};
  recipeIds.forEach((recipeId) => {
    statuses[recipeId] = favoriteIds.has(recipeId.toString());
  });

  return statuses;
};
