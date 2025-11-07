const API_BASE_URL = "http://localhost:3000/api/recipes";

export const detectFood = async (imageFile) => {
  const formData = new FormData();
  // "foodImage" phải khớp với tên trường (field) mà Multer (Backend) đang lắng nghe
  formData.append("foodImage", imageFile);

  try {
    const response = await fetch(`${API_BASE_URL}/detect`, {
      method: "POST",
      body: formData,
    });

    // 1. Xử lý lỗi HTTP (ví dụ: 400, 500)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data.foodName;
  } catch (error) {
    console.error("Lỗi gọi API phân tích món ăn:", error.message);
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
    const response = await fetch(`${API_BASE_URL}/id/${recipeId}`);

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
}
export const getBackUpNutrition = async (ingrs) => {
  try {
    // chỉ lấy mảng tên string
    const names = ingrs.map((ingr) => ingr.name);
    const response = await fetch(`${API_BASE_URL}/back-up-nutrition`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    const response = await fetch(`${API_BASE_URL}/rcm/${encodeURIComponent(foodName)}`);

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
export const getIngredientsInAi = async (recipe) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ingredients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipe }),
    });

    if (!response.ok) {
      console.warn(`Không tìm thấy nguyên liệu cho món ăn by AI`);
      return null;
    }
    const data = await response.json();
    console.log('ingredients by ai: ', data);
    return data;
  } catch (error) {
    console.error(`Lỗi khi lấy nguyên liệu cho món ăn by AI`, error.message);
    throw error;
  }
};



export async function createRecipe(recipeData, token) {
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
 * 🔵 Lấy chi tiết một công thức
 */
export async function getRecipeById(id) {
  const res = await fetch(`${API_BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Không thể lấy chi tiết công thức.");
  return await res.json();
}

/**
 * 🟠 Cập nhật công thức
 */
export async function updateRecipe(id, data, token) {
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
}

/**
 * 🔴 Xóa công thức
 */
export async function deleteRecipe(id, token) {
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
}
