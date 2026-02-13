import { normalizeDateVN } from "../helpers/date";
import { getToken } from "./authApi";

const API_BASE_URL = "http://localhost:3000/api/daily-menu";

export const createRecommendDailyMenu = async ({ date }) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
    }

    const payload = {
      date,
    };

    const res = await fetch(`${API_BASE_URL}/suggest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Tạo thực đơn cho ngày thất bại");
    console.log("da vao createRecommendDailyMenu trong service FRONTEND, data: ", data);
    return data;
  } catch (err) {
    console.error("createRecommendMealPlan error:", err);
    throw err;
  }
};
export const getRecipesByDateAndStatus = async (startDate, endDate, status) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
    }

    if (!endDate) endDate = startDate;
    const startUTC = encodeURIComponent(normalizeDateVN(startDate));
    const endUTC = encodeURIComponent(normalizeDateVN(endDate));
    const params = new URLSearchParams({
      startDate: startUTC,
      endDate: endUTC,
    });
    if (status) params.append("status", status);

    const response = await fetch(`${API_BASE_URL}/recipes?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const history = await response.json();
    console.log(">>>>daily menu:", history);
    return history;
  } catch (error) {
    console.error(error);
    throw new Error("Error retrieving meal history");
  }
};

export const addRecipeToDailyMenu = async ({
  date,
  recipeId,
  portion,
  note,
  servingTime,
}) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
    }

    const ndate = normalizeDateVN(date);
    const res = await fetch(`${API_BASE_URL}/add-recipe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: normalizeDateVN(date),
        recipeId,
        portion,
        note,
        servingTime,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Thêm món ăn thất bại");
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const createDailyMenu = async ({ date, recipes }) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
    }

    const res = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        date: normalizeDateVN(date),
        recipes,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Tạo thực đơn thất bại");

    return data;
  } catch (err) {
    console.error("createDailyMenu error:", err);
    throw err;
  }
};

/**
 * Cập nhật status của một meal trong daily menu
 * @param {string} mealId - ID của meal cần update
 * @param {string} newStatus - Status mới ("eaten" hoặc "pending")
 * @returns {Promise<Object>} Updated meal object
 */
export const updateMealStatus = async (mealId, newStatus) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
    }

    const res = await fetch(`${API_BASE_URL}/${mealId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newStatus }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Cập nhật trạng thái thất bại");

    return data;
  } catch (err) {
    console.error("updateMealStatus error:", err);
    throw err;
  }
};
