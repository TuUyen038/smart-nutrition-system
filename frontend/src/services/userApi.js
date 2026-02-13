const API_BASE_URL = "http://localhost:3000/api/users";
import { getToken } from "./authApi";

export const getUsers = async () => {
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
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(
        errorData.message || `Lỗi HTTP ${response.status} khi lấy danh sách người dùng`
      );
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error.message);
    throw error;
  }
};

/**
 * Lấy thống kê dashboard cho user
 * @returns {Promise<Object>} { donutChart, lineChart }
 */
export const getDashboardStats = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
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
    console.error("Get user dashboard stats error:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };

    // Thêm token nếu có
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(errorData.message || `Lỗi HTTP ${response.status} khi tìm người dùng`);
    }

    const data = await response.json();
    // Xử lý response có thể là { user: {...} } hoặc trực tiếp là user object
    return data.user || data;
  } catch (error) {
    console.error(`Lỗi khi tìm người dùng: `, error.message);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(errorData.message || `Lỗi HTTP ${response.status} khi cập nhật người dùng`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error.message);
    throw error;
  }
};

export const softDeleteUser = async (userId, reason) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_BASE_URL}/soft-delete/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Xóa thất bại");
    }
    return await response.json();
  } catch (error) {
    console.error(`Lỗi khi xoá người dùng: `, error.message);
    throw error;
  }
};
