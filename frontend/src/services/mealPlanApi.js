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

//get by startDate
export const getPlanByStartDate = async (startDate) => {
  try {
    const res = await fetch(`${API_BASE_URL}/by-startdate?startDate=${startDate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi lấy MealPlan theo startDate');
    console.log('MealPlan by startDate:', data.data);
    return data.data;
  } catch (err) {
    console.error('GetPlanByStartDate error:', err);
  }
};


//lay danh sach cua user
export const getMealPlans = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // nếu dùng JWT
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi lấy danh sách MealPlan');
    console.log('MealPlans:', data.data);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

//cap nhat trang thai paln
export const updatePlanStatus = async (planId, newStatus) => {
  try {
    const res = await fetch(`${API_BASE_URL}/${planId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ newStatus })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật status');
    console.log('Updated Plan:', data.data);
    return data.data;
  } catch (err) {
    console.error(err);
  }
};





