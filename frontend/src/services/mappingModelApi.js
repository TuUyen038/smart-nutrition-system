const API_BASE_URL = "http://localhost:8000";

/**
 * Gọi API batch search để lấy tên Việt + nutrition
 * @param {string[]} ingredientsArr - mảng tên nguyên liệu (ví dụ: ["thịt gà", "cà rốt"])
 * @param {number} topK - số kết quả trả về cho mỗi nguyên liệu
 * @returns {Promise<Array>} - trả về mảng kết quả
 */
export async function fetchIngredientsNutrition(ingredientsArr, topK = 5) {
  try {
    // Chuyển đổi mảng string sang định dạng API yêu cầu
    const payload = {
      ingredients: ingredientsArr.map(inObj => ({ name: inObj.name })),
      top_k: topK
    };

    const response = await fetch(`${API_BASE_URL}/search_batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.results; // mảng [{ input, results: [...] }, ...]
  } catch (error) {
    console.error("Error fetching ingredients nutrition:", error);
    return [];
  }
}
