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
  const [mealPlanIds, setMealPlanIds] = useState({}); // ✅ Track MealPlan IDs

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
  const getWeekRange = (inputDate = new Date()) => {
  const d = new Date(inputDate);

  // Xác định thứ trong tuần (0: CN, 1: T2, ..., 6: T7)
  const day = d.getDay();

  // Tính ngày đầu tuần (Thứ Hai)
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  // Ngày cuối tuần = Monday + 6 ngày
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // Format YYYY-MM-DD theo local
  const toLocalDateStr = (dt) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  return [toLocalDateStr(monday), toLocalDateStr(sunday)];
};


  const weekThisStart = getWeekStart(todayDate);
  const nextWeekDate = new Date(
    new Date(weekThisStart).setDate(new Date(weekThisStart).getDate() + 7)
  );
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
      .filter((date) => menusObj[date].length > 0)
      .map((date) => ({
        userId,
        date,
        recipes: menusObj[date].map((r) => ({
          recipeId: r.id,
          portion: r.portion || 1,
          note: r.note || "",
          servingTime: r.servingTime || "other",
          status: "planned",
        })),
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
      recipes: updatedItems.map((r) => ({
        recipeId: r.id,
        portion: r.portion || 1,
        note: r.note || "",
        servingTime: r.servingTime || "other",
        status: "planned",
      })),
    };

    const saved = await createDailyMenu(payload);

    const transformedData = {
      ...saved.data,
      recipes: saved.data.recipes.map((recipe) => {
        // Tìm recipe gốc từ updatedItems để lấy name, calories, image
        const originalRecipe = updatedItems.find((item) => item.id === recipe.recipeId);

        return {
          ...recipe,
          name: originalRecipe?.name || recipe.name || "Unknown",
          totalNutrition: {
            calories: originalRecipe?.calories || recipe.totalNutrition?.calories || 0,
          },
          imageUrl:
            originalRecipe?.image ||
            recipe.imageUrl ||
            "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
        };
      }),
    };

    return transformedData;
  };

  const createEmptyMealPlan = async (weekStart) => {
    try {
      // ✅ CHECK: Đã có MealPlan chưa?
      if (mealPlanIds[weekStart]) {
        console.log("⚠️ MealPlan đã tồn tại:", mealPlanIds[weekStart]);
        return mealPlanIds[weekStart];
      }

      // ✅ Tạo MealPlan trống (backend sẽ tự tạo DailyMenu nếu cần)
      const newMealPlan = await createMealPlan({
        userId,
        period: "week",
        startDate: weekStart,
        dailyMenuIds: [], // ✅ Backend sẽ xử lý logic tạo DailyMenu
        source: "user",
        generatedBy: "user",
      });

      const newMealPlanId = newMealPlan?._id || newMealPlan?.data?._id;
      if (newMealPlanId) {
        setMealPlanIds((prev) => ({
          ...prev,
          [weekStart]: newMealPlanId,
        }));
        console.log("✅ Created empty MealPlan:", newMealPlanId);
      }

      // ✅ Khởi tạo weekMenus (7 ngày trống)
      // const emptyWeek = createWeekDates(weekStart);
      // setWeekMenus(prev => ({
      //   ...prev,
      //   [weekStart]: emptyWeek
      // }));

      return newMealPlanId;
    } catch (err) {
      console.error("❌ Error creating empty MealPlan:", err);
      throw err;
    }
  };

  const saveWeekMenus = async (editingWeekStart) => {
  try {
    const weekObj = weekMenus[editingWeekStart];
    
    if (!weekObj || !weekObj.dailyMenuIds) {
      console.log("⚠️ Không có dữ liệu tuần để lưu");
      return;
    }

    console.log("💾 Saving week menus for:", editingWeekStart);

    // ✅ Loop qua từng DailyMenu và upsert
    const updatePromises = weekObj.dailyMenuIds.map(async (dayMenu, index) => {
      // Tính date từ startDate + index
      const date = new Date(editingWeekStart);
      date.setDate(date.getDate() + index);
      const dateStr = date.toISOString().split("T")[0]; // "YYYY-MM-DD"

      // Lấy recipes từ dayMenu
      const recipes = (dayMenu.recipes || []).filter(r => r && (r._id || r.recipeId || r.id));
      
      if (recipes.length === 0) {
        console.log(`ℹ️ No recipes for ${dateStr}, skipping...`);
        return null;
      }

      // ✅ Chuẩn bị payload cho API upsert
      const payload = {
        userId,
        date: dateStr,
        recipes: recipes.map((r) => ({
          recipeId: r._id || r.recipeId || r.id,
          portion: r.portion || 1,
          note: r.note || "",
          servingTime: r.servingTime || "other",
          status: r.status || "planned",
        })),
        status: "planned",
      };

      console.log(`📝 Upserting DailyMenu for ${dateStr}`);

      // ✅ GỌI API UPSERT (createMeal)
      const response = await createDailyMenu(payload);
      
      console.log(`✅ ${response.type} DailyMenu for ${dateStr}`);
      
      return response.data;
    });

    // Chờ tất cả upserts hoàn thành
    const results = await Promise.all(updatePromises);
    const validResults = results.filter(r => r !== null);

    console.log(`✅ Saved ${validResults.length} DailyMenus`);

    // ✅ KHÔNG CẦN update MealPlan
    // MealPlan.dailyMenuIds vẫn giữ nguyên
    // Khi populate sẽ tự động lấy data mới từ DailyMenu

    // ✅ Refresh lại data từ server để UI update
    // await fetchMealPlans();

    return validResults;
  } catch (error) {
    console.error("❌ Error saving week menus:", error);
    throw error;
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
          const formatted = res.data.map((r) => ({
            id: r._id,
            name: r.name,
            calories: r.totalNutrition?.calories || 0,
            image:
              r.imageUrl ||
              "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
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
      const [startDate1, endDate1] = getWeekRange(new Date());

      const nextWeekDate = new Date(startDate1);
      nextWeekDate.setDate(nextWeekDate.getDate() + 7);
      const [startDate2, endDate2] = getWeekRange(nextWeekDate);
      console.log("startDate1: ", startDate1);
      console.log("startDate2: ", startDate2);
      console.log("📅 Fetching weekly data...");
      const weekObj = [];

      try {
        const plan1 = await getPlanByStartDate(userId, startDate1);
        const plan2 = await getPlanByStartDate(userId, startDate2);

        // Khi set dữ liệu từ 2 plan
        setWeekMenus({
          [startDate1]: plan1,
          [startDate2]: plan2,
        });

        console.log("weekMenus neeeeeeee:", weekMenus);
      } catch (error) {
        console.error("❌ Error fetching weekly data:", error);
        setWeekMenus((prev) => ({
          ...prev,
          [weekThisStart]: { ...weekObj },
        }));
      }
    };

    const fetchDailyData = async () => {
      console.log("vao fetchDailyData");
      try {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const data = await getRecipesByDateAndStatus(userId, today, tomorrow, undefined);
        setMenus(data);
        console.log("menus data: ", data);
      } catch (err) {
        console.error(err);
      } finally {
        // setIsLoading(false);
      }
    };
    fetchRecipes();
    if (currentMode === "day") fetchDailyData();
    if (currentMode === "week") fetchWeeklyData();
  }, [currentMode]);

  return {
    recipes,
    isLoadingRecipes,
    menus,
    setMenus,
    weekMenus,
    setWeekMenus,
    mealPlanIds,
    saveDayMenus,
    saveWeekMenus,
    createEmptyMealPlan,
    today,
    tomorrow,
    weekThisStart,
    weekNextStart,
    createWeekDates,
  };
}
