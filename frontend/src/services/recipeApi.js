// src/services/foodApi.js (Giả định nằm trong thư mục services)

const API_BASE_URL = "http://localhost:3000/api/recipes";

/**
 * Gửi file ảnh lên Backend để phân tích dinh dưỡng bằng AI.
 * @param {File} imageFile - Đối tượng File được chọn từ Input.
 * @returns {Promise<Object>} - Đối tượng JSON chứa kết quả phân tích.
 */
export const analyzeFoodImage = async (imageFile) => {
  const formData = new FormData();
  // "foodImage" phải khớp với tên trường (field) mà Multer (Backend) đang lắng nghe
  formData.append("foodImage", imageFile);

  // 2. Tùy chọn: Gửi kèm prompt (nếu muốn FE thay đổi prompt)
  // formData.append("prompt", "Prompt mới tùy chỉnh...");

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      body: formData,
      // headers: { 'Authorization': 'Bearer YOUR_TOKEN' } // Nếu có xác thực
    });

    // Xử lý lỗi HTTP (ví dụ: 400, 500)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Lỗi HTTP: ${response.status}`);
    }

    const data = await response.json();
    // data.analysis sẽ là chuỗi JSON mà Gemini trả về

    // 3. Phân tích chuỗi JSON nhận được
    const analysisResult = JSON.parse(data.analysis);

    // 4. Trả về đối tượng JSON đã phân tích
    return analysisResult;
  } catch (error) {
    console.error("Lỗi gọi API phân tích món ăn:", error.message);
    throw error;
  }
};
