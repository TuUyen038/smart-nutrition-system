const API_BASE_URL = "http://localhost:3000/api/recipes";
import { getToken } from "./authApi";

export const getRecipesByIngredients = async (keyword, page = 1, limit = 10) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    if (!keyword || !keyword.trim()) {
      console.warn("Keyword rỗng, không gọi API search-by-ingredient.");
      return null;
    }

    const params = new URLSearchParams({
      keyword: keyword.trim(), // ?keyword=tôm
      page: String(page),
      limit: String(limit),
    });

    const response = await fetch(`${API_BASE_URL}/search-by-ingredient?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.warn(`Khong lay duoc danh sach mon an (status: ${response.status})`);
      return null;
    }

    const data = await response.json();
    return data; // { success, data: { recipes, total, page, limit }, ... }
  } catch (error) {
    console.error("Loi goi getRecipesByIngredients:", error);
    return null;
  }
};

/**
 * Lấy danh sách recipes với pagination và sorting
 */
export const getRecipes = async ({
  search,
  category,
  page = 1,
  limit = 20,
  sortBy = "createdAt",
  sortOrder = "desc",
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
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
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
      throw new Error(errorData.message || `Lỗi HTTP ${response.status} khi lấy danh sách món ăn`);
    }

    const data = await response.json();

    // Nếu API trả về object với data và pagination info
    if (data.data && data.pagination) {
      return {
        data: data.data,
        pagination: data.pagination,
      };
    }

    // Backward compatibility: nếu trả về mảng
    return {
      data: Array.isArray(data) ? data : [],
      pagination: {
        page: 1,
        limit: Array.isArray(data) ? data.length : 0,
        total: Array.isArray(data) ? data.length : 0,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách món ăn:", error.message);
    throw error;
  }
};
export const detectFood = async (imageFile) => {
  const token = getToken();
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
  }

  const formData = new FormData();
  // "foodImage" phải khớp với tên trường (field) mà Multer (Backend) đang lắng nghe
  formData.append("foodImage", imageFile);

  try {
    const response = await fetch(`${API_BASE_URL}/detect`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    // 1. Xử lý lỗi HTTP (ví dụ: 400, 500)
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `Lỗi HTTP: ${response.status}` };
      }
      const error = new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
      error.status = response.status; // Thêm status code vào error object
      throw error;
    }

    const data = await response.json();
    return data.foodName;
  } catch (error) {
    console.error("Lỗi gọi API phân tích món ăn:", error.message);
    throw error;
  }
};

/**
 * Hybrid Image→Text→Search
 * Tìm kiếm recipes trong database dựa trên ảnh món ăn
 * 1. Detect tên món từ ảnh (Gemini)
 * 2. Text search trong database
 * 3. Return danh sách recipes
 * @param {File} imageFile - File ảnh món ăn
 * @param {number} page - Số trang (default: 1)
 * @param {number} limit - Số lượng kết quả (default: 20)
 * @returns {Promise<Object>} { success, detectedFoodName, data: recipes[], pagination }
 */
export const searchRecipesByImage = async (imageFile, page = 1, limit = 20) => {
  const token = getToken();
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
  }

  const formData = new FormData();
  formData.append("foodImage", imageFile);

  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    const response = await fetch(`${API_BASE_URL}/search-by-image?${params.toString()}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data; // { success, detectedFoodName, data: recipes[], pagination }
  } catch (error) {
    console.error("Lỗi tìm kiếm món ăn bằng ảnh:", error.message);
    throw error;
  }
};

export const findRecipeByFoodName = async (foodName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(foodName)}`);

    if (!response.ok) {
      console.warn(`Không tìm thấy công thức trong DB cho "${foodName}".`);
      return null;
    }

    const data = await response.json();

    if (!data || Object.keys(data).length === 0) {
      console.warn(`Không tìm thấy công thức trong DB cho "${foodName}".`);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Lỗi khi lấy công thức "${foodName}":`, error.message);
    return null;
  }
};

export const findRecipeById = async (recipeId) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }
    const response = await fetch(`${API_BASE_URL}/id/${recipeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.warn(`Không tìm thấy công thức trong DB cho "${recipeId}".`);
      return null;
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiet công thức "${recipeId}":`, error.message);
    return null;
  }
};
export const getBackUpNutrition = async (ingrs) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }
    // chỉ lấy mảng tên string
    const names = ingrs.map((ingr) => ingr.name);
    const response = await fetch(`${API_BASE_URL}/back-up-nutrition`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ingrs: names }),
    });

    if (!response.ok) {
      console.warn(`Không tìm thấy nutrition trong DB`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Lỗi khi lấy nutrition:`, error.message);
    return null;
  }
};

export const getIngredientsAndInstructionsInAi = async (foodName) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
    }

    const response = await fetch(`${API_BASE_URL}/rcm/${encodeURIComponent(foodName)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.warn(`Không tìm thấy nguyên liệu cho món ăn by AI`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Lỗi khi lấy nguyên liệu cho món ăn by AI "${foodName}":`, error.message);
    throw error;
  }
};
/**
 * Gợi ý nguyên liệu thay thế từ AI
 * @param {Array} ingredientsToSubstitute - Danh sách nguyên liệu cần thay thế [{ingredient: {...}, reason: string, priority: string, reasonType: string}, ...]
 * @param {Array} allIngredients - Danh sách tất cả nguyên liệu [{name: "Thịt heo", quantity: {...}}, ...]
 * @param {String} userGoal - Mục tiêu của user (lose_weight, gain_weight, maintain_weight)
 * @param {String} instructions - Công thức nấu ăn (optional)
 * @param {String} dishName - Tên món ăn (optional)
 * @returns {Promise<Object>} {substitutions: [{original: "Thịt heo", reason: "...", suggestions: ["Đậu phụ", "Nấm"]}]}
 */
export const getIngredientSubstitutions = async (
  ingredientsToSubstitute,
  allIngredients,
  userGoal,
  instructions = "",
  dishName = ""
) => {
  try {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/substitutions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ingredientsToSubstitute,
        allIngredients,
        userGoal,
        instructions,
        dishName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(
        errorData.message || `Lỗi HTTP ${response.status} khi lấy gợi ý nguyên liệu thay thế`
      );
    }

    const data = await response.json();
    return data.data || { substitutions: [] };
  } catch (error) {
    console.error("Lỗi khi lấy gợi ý nguyên liệu thay thế:", error.message);
    throw error;
  }
};

export const getIngredientsInAi = async (recipe, servings = null) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
    }

    const body = { recipe };
    if (servings && servings > 0) {
      body.servings = servings;
    }

    const response = await fetch(`${API_BASE_URL}/ingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.warn(`Không tìm thấy nguyên liệu cho món ăn by AI`);
      return null;
    }
    const data = await response.json();
    console.log("ingredients by ai: ", data);
    return data;
  } catch (error) {
    console.error(`Lỗi khi lấy nguyên liệu cho món ăn by AI`, error.message);
    throw error;
  }
};

export async function createRecipe(recipeData, token) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }
    const res = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(recipeData),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Không thể lưu công thức.");
    }

    return await res.json();
  } catch (error) {
    console.error("Lỗi khi lưu công thức:", error.message);
    throw error;
  }
}

/**
 * 🟡 Lấy danh sách công thức của người dùng
 */
export async function getUserRecipes(userId, token) {
  const res = await fetch(`${API_BASE_URL}?ownerId=${userId}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể tải danh sách công thức.");
  }

  return await res.json();
}

/**
 * Lấy chi tiết một công thức
 */
export async function getRecipeById(id) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }
  const res = await fetch(`${API_BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Không thể lấy chi tiết công thức.");
  return await res.json();
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết công thức:", error.message);
    throw error;
  }
}

/**
 * Cập nhật công thức
 */
export async function updateRecipe(id, data) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Không thể cập nhật công thức.");
    }

    return await res.json();
  } catch (error) {
    console.error("Lỗi khi cập nhật công thức:", error.message);
    throw error;
  }
}

/**
 * Xóa công thức
 */
export async function deleteRecipe(id, token) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Không thể xóa công thức.");
  }

  return await res.json();
} catch (error) {
    console.error("Lỗi khi xóa công thức:", error.message);
    throw error;
}
}

/**
 * Lấy thống kê recipes
 */
export async function getRecipeStats() {
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Không thể lấy thống kê.",
      }));
      throw new Error(errorData.message || `Lỗi HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi khi lấy thống kê:", error.message);
    throw error;
  }
}

/**
 * Kiểm tra trùng tên recipe
 */
export async function checkDuplicateName(name, excludeId = null) {
  try {
    
    const params = new URLSearchParams({ name });
    if (excludeId) params.append("excludeId", excludeId);

    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }
    const response = await fetch(`${API_BASE_URL}/check-duplicate?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isDuplicate || false;
  } catch (error) {
    console.error("Lỗi khi kiểm tra trùng tên:", error.message);
    return false;
  }
}
