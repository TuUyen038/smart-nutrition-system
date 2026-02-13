const API_BASE_URL = "http://localhost:3000/api/admin/dashboard";
import { getToken } from "./authApi";

/**
 * Lấy thống kê tổng quan cho admin dashboard
 * @returns {Promise<Object>} { stats, userGrowth, recipeDistribution, topRecipes }
 */
export const getDashboardStats = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể lấy thống kê dashboard");
    }

    return data;
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    throw error;
  }
};

