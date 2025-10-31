// src/services/foodApi.js

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
      const errorData = await response.json().catch(() => ({
        message: "Không thể đọc lỗi từ server.",
      }));
      throw new Error(
        errorData.message || `Lỗi HTTP ${response.status} khi tìm nguyên liệu cho ${foodName}`
      );
    }

    const data = await response.json();
    console.log("📦 Dữ liệu từ backend:", data);

    // 🔍 Kiểm tra dữ liệu rỗng
    if (!data || Object.keys(data).length === 0) {
      console.warn(`⚠️ Không tìm thấy công thức trong DB cho "${foodName}".`);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`🚨 Lỗi khi lấy công thức "${foodName}":`, error.message);
    return null; // ✅ Trả null để FE chuyển sang AI
  }
};

export const getIngredientsAndInstructionsInAi = async (foodName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rcm/${encodeURIComponent(foodName)}`);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Không thể đọc lỗi từ server." }));
      throw new Error(
        errorData.message || `Lỗi HTTP: ${response.status} khi tìm nguyên liệu cho ${foodName}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Lỗi khi lấy nguyên liệu cho món ăn by AI "${foodName}":`, error.message);
    throw error;
  }
};
