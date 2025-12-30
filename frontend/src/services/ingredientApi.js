const API_BASE_URL = "http://localhost:3000/api/ingredients";
import { getToken } from "./authApi";

/**
 * Lấy danh sách nguyên liệu với pagination và sorting
 */
export const getIngredients = async ({
  search,
  category,
  page = 1,
  limit = 20,
  sortBy = "name",
  sortOrder = "asc",
} = {}) => {
  try {
    const params = new URLSearchParams();

    if (search && search.trim()) params.append("search", search.trim());
    if (category && category !== "all") params.append("category", category);
    if (page != null) params.append("page", page);
    if (limit != null) params.append("limit", limit);
    if (sortBy) params.append("sortBy", sortBy);
    if (sortOrder) params.append("sortOrder", sortOrder);

    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(
        errorData.message || `Lỗi HTTP ${response.status} khi lấy danh sách nguyên liệu`
      );
    }

    const data = await response.json();

    // Nếu API trả về object với data và pagination info
    if (data.data && data.pagination) {
      return data;
    }

    // Nếu API trả về mảng (backward compatibility)
    return {
      data: Array.isArray(data) ? data : [],
      pagination: {
        page: 1,
        limit: data.length || 0,
        total: Array.isArray(data) ? data.length : 0,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nguyên liệu:", error.message);
    throw error;
  }
};

/**
 * Lấy thống kê nguyên liệu
 */
export const getIngredientStats = async () => {
  try {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/stats`, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(errorData.message || `Lỗi HTTP ${response.status} khi lấy thống kê`);
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi khi lấy thống kê:", error.message);
    throw error;
  }
};

export const findIngredientById = async (ingredientId) => {
  try {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/${ingredientId}`, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(errorData.message || `Lỗi HTTP ${response.status} khi tìm nguyên liệu`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Lỗi khi tìm nguyên liệu: `, error.message);
    throw error;
  }
};

/**
 * Kiểm tra trùng tên nguyên liệu
 */
export const checkDuplicateName = async (name, excludeId = null) => {
  try {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const params = new URLSearchParams({ name });
    if (excludeId) params.append("excludeId", excludeId);

    const response = await fetch(`${API_BASE_URL}/check-duplicate?${params}`, { headers });

    if (!response.ok) {
      return false; // Nếu lỗi, giả sử không trùng
    }

    const data = await response.json();
    return data.isDuplicate || false;
  } catch (error) {
    console.error("Lỗi khi kiểm tra trùng tên:", error.message);
    return false;
  }
};

export const createIngredient = async (ingredientData) => {
  try {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(ingredientData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(errorData.message || `Lỗi HTTP ${response.status} khi tạo nguyên liệu`);
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi khi tạo nguyên liệu:", error.message);
    throw error;
  }
};

export const updateIngredient = async (ingredientId, ingredientData) => {
  try {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/${ingredientId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(ingredientData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(errorData.message || `Lỗi HTTP ${response.status} khi cập nhật nguyên liệu`);
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi khi cập nhật nguyên liệu:", error.message);
    throw error;
  }
};

export const deleteIngredient = async (ingredientId) => {
  try {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/${ingredientId}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(errorData.message || `Lỗi HTTP ${response.status} khi xóa nguyên liệu`);
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi khi xóa nguyên liệu:", error.message);
    throw error;
  }
};
