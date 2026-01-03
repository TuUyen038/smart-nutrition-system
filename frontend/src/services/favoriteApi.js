const API_BASE_URL = "http://localhost:3000/api/favorites";
import { getToken } from "./authApi";

/**
 * Lấy danh sách món ăn yêu thích
 * @param {number} page - Số trang (default: 1)
 * @param {number} limit - Số lượng kết quả (default: 20)
 * @returns {Promise<Object>} { success, data: recipes[], pagination }
 */
export const getFavoriteRecipes = async (page = 1, limit = 20) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy danh sách yêu thích");
    }

    return data;
  } catch (error) {
    console.error("Get favorites error:", error);
    throw error;
  }
};

/**
 * Thêm món ăn vào danh sách yêu thích
 * @param {string} recipeId - ID của recipe
 * @returns {Promise<Object>} { success, message }
 */
export const addFavorite = async (recipeId) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_BASE_URL}/${recipeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể thêm vào danh sách yêu thích");
    }

    return data;
  } catch (error) {
    console.error("Add favorite error:", error);
    throw error;
  }
};

/**
 * Xóa món ăn khỏi danh sách yêu thích
 * @param {string} recipeId - ID của recipe
 * @returns {Promise<Object>} { success, message }
 */
export const removeFavorite = async (recipeId) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_BASE_URL}/${recipeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể xóa khỏi danh sách yêu thích");
    }

    return data;
  } catch (error) {
    console.error("Remove favorite error:", error);
    throw error;
  }
};

/**
 * Toggle favorite (thêm nếu chưa có, xóa nếu đã có)
 * @param {string} recipeId - ID của recipe
 * @returns {Promise<Object>} { success, message, isFavorite }
 */
export const toggleFavorite = async (recipeId) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_BASE_URL}/toggle/${recipeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể thay đổi trạng thái yêu thích");
    }

    return data;
  } catch (error) {
    console.error("Toggle favorite error:", error);
    throw error;
  }
};

/**
 * Kiểm tra xem recipe có trong danh sách yêu thích không
 * @param {string} recipeId - ID của recipe
 * @returns {Promise<boolean>} true nếu đã favorite, false nếu chưa
 */
export const checkFavorite = async (recipeId) => {
  try {
    const token = getToken();
    if (!token) {
      return false;
    }

    const response = await fetch(`${API_BASE_URL}/check/${recipeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return false;
    }

    return data.isFavorite || false;
  } catch (error) {
    console.error("Check favorite error:", error);
    return false;
  }
};

