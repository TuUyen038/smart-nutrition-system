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
    console.log("Phân tích món ăn:", data.foodName);
    return data.foodName;
  } catch (error) {
    console.error("Lỗi gọi API phân tích món ăn:", error.message);
    throw error;
  }
};
