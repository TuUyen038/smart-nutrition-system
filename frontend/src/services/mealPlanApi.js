import { normalizeDateVN } from "../helpers/date";
import { getToken } from "./authApi";

const API_BASE_URL = "http://localhost:3000/api/meal-plans";

export const getWeekDailyMenuStatus = async ({ startDate, days = 7 }) => {
  const token = getToken();
  if (!token) {
    throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
  }

  const startDateStr = normalizeDateVN(startDate);

  const url = `${API_BASE_URL}/status?startDate=${encodeURIComponent(
    startDateStr
  )}&days=${days}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Kiểm tra tuần thất bại");
  return data; // { hasExisting: boolean, existingDates: string[] }
};

export const createRecommendMealPlan = async ({
  startDate,
  days = 7,
  mode = "reuse", // hoặc "overwrite"
}) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
    }

    const payload = {
      startDate: startDate, // "YYYY-MM-DD"
      days,
      mode, // "reuse" | "overwrite"
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
    if (!res.ok) throw new Error(data.message || "Tạo kế hoạch thất bại");
    return data;
  } catch (err) {
    console.error("createRecommendMealPlan error:", err);
    throw err;
  }
};

export const createDailyPlan = async (payload) => {
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

//get by startDate
export const getPlanByStartDate = async (startDate) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
    }

    const startDateStr = normalizeDateVN(startDate);
    const res = await fetch(`${API_BASE_URL}/by-startdate?startDate=${startDateStr}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lỗi khi lấy MealPlan theo startDate");
    console.log("MealPlan by startDate:", data.data);
    return data.data;
  } catch (err) {
    console.error("GetPlanByStartDate error:", err);
  }
};

//lay danh sach cua user
export const getMealPlans = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
    }

    const res = await fetch(`${API_BASE_URL}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lỗi khi lấy danh sách MealPlan");
    console.log("MealPlans:", data.data);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

//cap nhat trang thai paln
export const updatePlanStatus = async (planId, newStatus) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Không có token xác thực. Vui lòng đăng nhập.");
    }

    const res = await fetch(`${API_BASE_URL}/${planId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newStatus }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lỗi khi cập nhật status");
    console.log("Updated Plan:", data.data);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};
