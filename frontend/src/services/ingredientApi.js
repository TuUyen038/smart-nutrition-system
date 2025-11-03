const API_BASE_URL = "http://localhost:3000/api/ingredients";

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
