const API_BASE_URL = "http://localhost:3000/api/nutrition-goals";
import { getToken } from "./authApi";

export const getActiveNutritionGoal = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_BASE_URL}/active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Không thể lấy mục tiêu dinh dưỡng");
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi khi lấy active nutrition goal:", error.message);
    throw error;
  }
};
export const getAllNutritionGoals = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(API_BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Không thể lấy danh sách các mục tiêu dinh dưỡng");
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi khi lấy nutrition goal:", error.message);
    throw error;
  }
};