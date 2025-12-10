const API_BASE_URL = "http://localhost:3000/api/ingredients";


export const getIngredients = async ({ search, category, page, limit } = {}) => {
  try {
    const params = new URLSearchParams();

    if (search && search.trim()) params.append("search", search.trim());
    if (category && category !== "all") params.append("category", category);
    if (page != null) params.append("page", page);
    if (limit != null) params.append("limit", limit);

    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(
        errorData.message || `Lỗi HTTP ${response.status} khi lấy danh sách nguyên liệu`
      );
    }

    const data = await response.json();
    // Giả sử API trả về mảng ingredients
    return data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nguyên liệu:", error.message);
    return [];
  }
};


export const findIngredientById = async (ingredientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${ingredientId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(errorData.message || `Lỗi HTTP ${response.status} khi tìm nguyên liệu`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(`Lỗi khi tim nguyen lieu: `, error.message);
    return null;
  }
};

export const createIngredient = async (ingredientData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(ingredientData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(
        errorData.message || `Lỗi HTTP ${response.status} khi tạo nguyên liệu`
      );
    }

    const data = await response.json();
    return data; // trả về object ingredient
  } catch (error) {
    console.error("Lỗi khi tạo nguyên liệu:", error.message);
    return null;
  }
};

export const updateIngredient = async (ingredientId, ingredientData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${ingredientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify(ingredientData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(
        errorData.message ||
          `Lỗi HTTP ${response.status} khi cập nhật nguyên liệu`
      );
    }

    const data = await response.json();
    return data; // object ingredient sau khi update
  } catch (error) {
    console.error("Lỗi khi cập nhật nguyên liệu:", error.message);
    return null;
  }
};

// Xóa nguyên liệu (Admin)
export const deleteIngredient = async (ingredientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${ingredientId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(
        errorData.message ||
          `Lỗi HTTP ${response.status} khi xóa nguyên liệu`
      );
    }

    const data = await response.json();
    // BE đang trả { message: "Ingredient deleted" }
    return data;
  } catch (error) {
    console.error("Lỗi khi xóa nguyên liệu:", error.message);
    return null;
  }
};