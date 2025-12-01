import { normalizeDateVN } from "../helpers/date";
const API_BASE_URL = "http://localhost:3000/api/daily-menu";

export const createRecommendDailyMenu = async ({ date }) => {
  try {
    const payload = {
      userId,
      date,
    };

    const res = await fetch(`${API_BASE_URL}/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Tạo thực đơn cho ngày thất bại");
    return data;
  } catch (err) {
    console.error("createRecommendMealPlan error:", err);
    throw err;
  }
};
export const getRecipesByDateAndStatus = async (userId, startDate, endDate, status) => {
  try {
    if (!endDate) endDate = startDate;
    const startUTC = encodeURIComponent(normalizeDateVN(startDate));
    const endUTC = encodeURIComponent(normalizeDateVN(endDate));
    const params = new URLSearchParams({
      userId,
      startDate: startUTC,
      endDate: endUTC,
    });
    if (status) params.append("status", status);

    const response = await fetch(`${API_BASE_URL}/recipes?${params.toString()}`);
    const history = await response.json();
    // console.log("daily menu:", history);
    return history;
  } catch (error) {
    console.error(error);
    throw new Error("Error retrieving meal history");
  }
};

export const addRecipeToDailyMenu = async ({
  userId,
  date,
  recipeId,
  portion,
  note,
  servingTime,
}) => {
  try {
    const ndate = normalizeDateVN(date);
    const res = await fetch(`${API_BASE_URL}/add-recipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
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

export const createDailyMenu = async ({ userId, date, recipes }) => {
  try {
    const res = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        date: normalizeDateVN(date),
        recipes,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Tạo thực đơn thất bại");

    return data; // data.data chứa DailyMenu mới tạo
  } catch (err) {
    console.error("createDailyMenu error:", err);
    throw err;
  }
};
