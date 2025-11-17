import { normalizeDateVN } from "../helpers/date";
const API_BASE_URL = "http://localhost:3000/api/meal-plans";

  const userId = '68f4394c4d4cc568e6bc5daa';

export const createMealPlan = async (payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Tạo kế hoạch thất bại");
    return data;
  } catch (err) {
    console.error("createMealPlan error:", err);
    throw err;
  }
};

