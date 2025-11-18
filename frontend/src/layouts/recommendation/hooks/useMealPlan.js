// hooks/useMealPlanner.js
import { useState, useEffect, use } from "react";
import { getRecipes } from "services/recipeApi";
import { createDailyMenu } from "services/dailyMenuApi";
import { createMealPlan, getPlanByStartDate } from "services/mealPlanApi";
import { getRecipesByDateAndStatus } from "services/dailyMenuApi";
import { formatDateVN } from "helpers/date";

export function useMealPlanner(userId, currentMode) {
  // STATE
  const [recipes, setRecipes] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [menus, setMenus] = useState([]);
  const [weekMenus, setWeekMenus] = useState({});

  // DYNAMIC DATES
  const todayDate = new Date();
  const today = formatDateVN(todayDate);

  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const tomorrow = formatDateVN(tomorrowDate);

  const getWeekStart = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return formatDateVN(d);
  };

  const weekThisStart = getWeekStart(todayDate);
  const nextWeekDate = new Date(new Date(weekThisStart).setDate(new Date(weekThisStart).getDate() + 7));
  const weekNextStart = formatDateVN(nextWeekDate);

  const createWeekDates = (weekStartStr) => {
    if (!weekStartStr) weekStartStr = formatDateVN(new Date());
    const parts = weekStartStr.split("-");
    const startDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const weekObj = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      weekObj[formatDateVN(d)] = [];
    }
    return weekObj;
  };

  // HELPER: map menus → DailyMenu payload
  const mapMenusToDailyMenuPayload = (menusObj) => {
    return Object.keys(menusObj)
      .filter(date => menusObj[date].length > 0)
      .map(date => ({
        userId,
        date,
        recipes: menusObj[date].map(r => ({
          recipeId: r.id,
          portion: r.portion || 1,
          note: r.note || "",
          servingTime: r.servingTime || "other",
          status: "planned",
        }))
      }));
  };

  // =====================
  // SAVE FUNCTIONS
  // =====================
  const saveDayMenus = async (date, updatedItems) => {
  if (!updatedItems || updatedItems.length === 0) return null;

  const payload = {
    userId,
    date,
    recipes: updatedItems.map(r => ({
      recipeId: r.id,
      portion: r.portion || 1,
      note: r.note || "",
      servingTime: r.servingTime || "other",
      status: "planned"
    }))
  };
  
  const saved = await createDailyMenu(payload);
  console.log("Raw API response:", saved.data);
  
  // ✅ Transform data: merge thông tin từ updatedItems vào recipes
  const transformedData = {
    ...saved.data,
    recipes: saved.data.recipes.map(recipe => {
      // Tìm recipe gốc từ updatedItems để lấy name, calories, image
      const originalRecipe = updatedItems.find(item => item.id === recipe.recipeId);
      
      return {
        ...recipe,
        // Thêm các field cần thiết cho render
        name: originalRecipe?.name || recipe.name || "Unknown",
        totalNutrition: {
          calories: originalRecipe?.calories || recipe.totalNutrition?.calories || 0
        },
        imageUrl: originalRecipe?.image || recipe.imageUrl || "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg"
      };
    })
  };
  
  console.log("Transformed data:", transformedData);
  return transformedData;
};

  const saveWeekMenus = async (editingWeekStart) => {
    const weekObj = weekMenus[editingWeekStart];
    if (!weekObj) return;

    const dailyPayloads = mapMenusToDailyMenuPayload(weekObj);
    const mealPlanPayload = {
      userId,
      period: "week",
      startDate: editingWeekStart,
      endDate: formatDateVN(new Date(new Date(editingWeekStart).setDate(new Date(weekStart).getDate() + 6))),
      meals: [],
      source: "user",
      generatedBy: "user"
    };

    for (const dayMenu of dailyPayloads) {
      const response = await createDailyMenu(dayMenu);
      const dailyMenuId = response?._id || response?.data?._id;
      if (dailyMenuId) mealPlanPayload.meals.push(dailyMenuId);
    }

    if (mealPlanPayload.meals.length > 0) {
      await createMealPlan(mealPlanPayload);
    }
  };

  // =====================
  // FETCH DATA ON LOAD
  // =====================
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await getRecipes();
        if (res.success && Array.isArray(res.data)) {
          const formatted = res.data.map(r => ({
            id: r._id,
            name: r.name,
            calories: r.totalNutrition?.calories || 0,
            image: r.imageUrl || "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg"
          }));
          setRecipes(formatted);
        }
      } catch (err) {
        console.error("Lỗi fetchRecipes:", err);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    const fetchWeeklyData = async () => {
      console.log("vao fetchWeeklyData");
      // Init tuần trống
      const weekObj = createWeekDates(weekThisStart);
      setWeekMenus(prev => ({ ...prev, [weekThisStart]: weekObj }));

      // Load DailyMenu từng ngày
      const dayKeys = Object.keys(weekObj);
      await Promise.all(dayKeys.map(async date => {
        const daily = await getRecipesByDateAndStatus(userId, date); // fetch riêng từng ngày
        if (daily) weekObj[date] = daily.map(r => ({
          id: r.recipeId,
          portion: r.portion,
          note: r.note
        }));
      }));

      // Cập nhật weekMenus sau khi fetch DailyMenu
      setWeekMenus(prev => ({ ...prev, [weekThisStart]: { ...weekObj } }));

      // Nếu có MealPlan, merge dữ liệu (optional)
      const plan = await getPlanByStartDate(weekThisStart);
      if (plan) {
        plan.dailyMenuIds.forEach(d => {
          const date = formatDateVN(new Date(d.date));
          weekObj[date] = (d.recipes || []).map(r => ({
            id: r.recipeId,
            portion: r.portion,
            note: r.note
          }));
        });
        setWeekMenus(prev => ({ ...prev, [weekThisStart]: { ...weekObj } }));
      }
    };
    const fetchDailyData = async () => {
      console.log("vao fetchDailyData");
      try {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const data = await getRecipesByDateAndStatus(
          userId,
          today,
          tomorrow,
          undefined,
        );
        setMenus(data);
        console.log('menus data: ', data);
      } catch (err) {
        console.error(err);
      } finally {
        // setIsLoading(false);
      }
    }
    fetchRecipes();
    if(currentMode === "day") fetchDailyData();
    if(currentMode === "week") fetchWeeklyData();
  }, [userId]);

  return {
    recipes,
    isLoadingRecipes,
    menus,
    setMenus,
    weekMenus,
    setWeekMenus,
    saveDayMenus,
    saveWeekMenus,
    today,
    tomorrow,
    weekThisStart,
    weekNextStart,
    createWeekDates
  };
}
