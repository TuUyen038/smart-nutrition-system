const API_BASE_URL = "http://localhost:3000/api/users";

export const getUsers = async () => {
  try {
    const response = await fetch(API_BASE_URL);

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
    return [];
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(
        errorData.message || `Lỗi HTTP ${response.status} khi tìm người dùng`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Lỗi khi tìm người dùng: `, error.message);
    return null;
  }
};

export const updateUser = async (userId, userData, token) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    
    // Add token if provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: "PUT",
      headers,
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
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
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

