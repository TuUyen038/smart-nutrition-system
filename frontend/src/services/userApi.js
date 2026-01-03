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
      throw new Error(
        errorData.message || `Lỗi HTTP ${response.status} khi tìm người dùng`
      );
    }

    const data = await response.json();
    // Xử lý response có thể là { user: {...} } hoặc trực tiếp là user object
    return data.user || data;
  } catch (error) {
    console.error(`Lỗi khi tìm người dùng: `, error.message);
    return null;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: "PUT",
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
      throw new Error(
        errorData.message || `Lỗi HTTP ${response.status} khi cập nhật người dùng`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error.message);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: "DELETE",
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
        errorData.message || `Lỗi HTTP ${response.status} khi xóa người dùng`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error.message);
    throw error;
  }
};

