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
