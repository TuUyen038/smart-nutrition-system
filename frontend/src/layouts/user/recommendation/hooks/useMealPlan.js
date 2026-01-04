// hooks/useMealPlanner.js
import { useState, useEffect, use } from "react";
import { getRecipes } from "services/recipeApi";
import { createDailyMenu } from "services/dailyMenuApi";
import { createMealPlan, getPlanByStartDate } from "services/mealPlanApi";
import { getRecipesByDateAndStatus } from "services/dailyMenuApi";
import { formatDateVN, normalizeDate } from "helpers/date";

export function useMealPlanner(userId, currentMode) {
  // STATE
  const [recipes, setRecipes] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [menus, setMenus] = useState([]);
  const [weekMenus, setWeekMenus] = useState({});
  const [mealPlanIds, setMealPlanIds] = useState({});
const [reloadWeek, setReloadWeek] = useState(false);

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
    return normalizeDate(d);
  };

  function getWeekRange(inputDate) {
    const d = new Date(inputDate);
    d.setHours(0, 0, 0, 0);

    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return [normalizeDate(monday), normalizeDate(sunday)];
  }

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
        const originalRecipe = updatedItems.find((item) => item.id === recipe.recipeId);

        return {
          ...recipe,
          id: recipe.recipeId?._id || recipe.recipeId,
          name: originalRecipe?.name || recipe.name || "Unknown",
          calories: originalRecipe?.calories || recipe.totalNutrition?.calories || 0,
          portion: recipe.portion || originalRecipe?.portion || 1, // Lưu portion
          totalNutrition: {
            calories: originalRecipe?.calories || recipe.totalNutrition?.calories || 0,
          },
          image:
            originalRecipe?.image ||
            recipe.imageUrl ||
            "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
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

      const newMealPlan = await createMealPlan({
        userId,
        period: "week",
        startDate: weekStart,
        dailyMenuIds: [],
        source: "user",
        generatedBy: "user",
      });

      // setWeekMenus((prev) => ({
      //   ...prev,
      //   [weekStart]: {},
      // }));
      setReloadWeek(true)
      // const newMealPlanId = newMealPlan?._id || newMealPlan?.data?._id;
      // if (newMealPlanId) {
      //   setMealPlanIds((prev) => ({
      //     ...prev,
      //     [weekStart]: newMealPlanId,
      //   }));
      //   console.log("✅ Created empty MealPlan:", newMealPlanId);
      // }
      // return newMealPlanId;
    } catch (err) {
      console.error("❌ Error creating empty MealPlan:", err);
      throw err;
    }
  };

  const saveWeekMenus = async (date, updatedItems) => {
    try {
      const [editingWeekStart, endDate1] = getWeekRange(date);
      const currentData = weekMenus[editingWeekStart]?.[date] || [];
      const newData = [...updatedItems];

      console.log("💾 Saving week menus for:", editingWeekStart);
      const payload = {
        userId,
        date: date,
        recipes: newData.map((r) => ({
          recipeId: r.id || r._id || r.recipeId,
          portion: r.portion || 1,
          note: r.note || "",
          servingTime: r.servingTime || "other",
          status: "planned",
        })),
      };
      await createDailyMenu(payload);
      setWeekMenus((prev) => ({
        ...prev,
        [editingWeekStart]: {
          ...prev[editingWeekStart],
          [date]: updatedItems,
        },
      }));
    } catch (error) {
      console.error("❌ Error saving week menus:", error);
      throw error;
    }
  };

  // =====================
  // FETCH DATA ON LOAD
  // =====================
  function parseDate(str) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // Define fetch functions outside useEffect so they can be called from outside
  const fetchDailyData = async () => {
    try {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      // Fetch tất cả món (cả planned và eaten) để hiển thị đầy đủ
      const data = await getRecipesByDateAndStatus(userId, today, tomorrow, null);

      // Khởi tạo object theo ngày
      const formattedMenus = {};

      data.forEach((d) => {
        const dateKey = d.date; // đảm bảo là "yyyy-mm-dd"
        // Hiển thị tất cả món (planned và eaten), chỉ loại bỏ deleted
        formattedMenus[dateKey] = (d.recipes || [])
          .filter((r) => r.status !== "deleted") // Chỉ loại bỏ "deleted", giữ lại "planned" và "eaten"
          .map((r) => ({
            id: r.recipeId?._id || r._id,
            mealId: r._id, // Lưu mealId để update status
            name: r.recipeId?.name || r.name,
            calories: r.recipeId?.totalNutrition?.calories || r.totalNutrition?.calories || 0,
            portion: r.portion || 1, // Load portion
            status: r.status || "planned", // Lưu status hiện tại
            image:
              r.recipeId?.imageUrl ||
              r.imageUrl ||
              "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
          }));
      });

      setMenus(formattedMenus);

    } catch (err) {
      console.error(err);
    }
  };

  const fetchWeeklyData = async () => {
    const [startDate1, endDate1] = getWeekRange(new Date());

    const nextWeekDate = parseDate(startDate1);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);

    const [startDate2, endDate2] = getWeekRange(nextWeekDate);

    console.log("📅 Fetching weekly data...");
    try {
      // Fetch tất cả món (cả planned và eaten) để hiển thị đầy đủ
      const data1 = await getRecipesByDateAndStatus(userId, new Date(startDate1), new Date(endDate1), null);
      const data2 = await getRecipesByDateAndStatus(userId, new Date(startDate2), new Date(endDate2), null);

      const formattedMenus1 = {};
      const formattedMenus2 = {};

      // Format data cho tuần 1 - hiển thị tất cả món (planned và eaten), loại bỏ deleted
      data1.forEach((d) => {
        const dateKey = d.date; // đảm bảo là "yyyy-mm-dd"
        formattedMenus1[dateKey] = (d.recipes || [])
          .filter((r) => r.status !== "deleted") // Chỉ loại bỏ "deleted", giữ lại "planned" và "eaten"
          .map((r) => ({
            id: r.recipeId?._id || r._id,
            mealId: r._id, // Lưu mealId để update status
            name: r.recipeId?.name || r.name,
            calories: r.recipeId?.totalNutrition?.calories || r.totalNutrition?.calories || 0,
            portion: r.portion || 1, // Load portion
            status: r.status || "planned", // Lưu status hiện tại
            image:
              r.recipeId?.imageUrl ||
              r.imageUrl ||
              "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
          }));
      });

      // Format data cho tuần 2 - hiển thị tất cả món (planned và eaten), loại bỏ deleted
      data2.forEach((d) => {
        const dateKey = d.date; // đảm bảo là "yyyy-mm-dd"
        formattedMenus2[dateKey] = (d.recipes || [])
          .filter((r) => r.status !== "deleted") // Chỉ loại bỏ "deleted", giữ lại "planned" và "eaten"
          .map((r) => ({
            id: r.recipeId?._id || r._id,
            mealId: r._id, // Lưu mealId để update status
            name: r.recipeId?.name || r.name,
            calories: r.recipeId?.totalNutrition?.calories || r.totalNutrition?.calories || 0,
            portion: r.portion || 1, // Load portion
            status: r.status || "planned", // Lưu status hiện tại
            image:
              r.recipeId?.imageUrl ||
              r.imageUrl ||
              "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
          }));
      });

      setWeekMenus({
        [startDate1]: formattedMenus1,
        [startDate2]: formattedMenus2,
      });
    } catch (error) {
      console.error("❌ Error fetching weekly data:", error);
      setWeekMenus((prev) => ({
        ...prev,
        [startDate1]: {},
        [startDate2]: {},
      }));
    }
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await getRecipes({
          limit: 1000, // Lấy nhiều món để hiển thị trong modal
        });
        // API trả về { data, pagination } giống như trang admin/recipe
        const recipesData = res?.data || [];
        if (Array.isArray(recipesData)) {
          const formatted = recipesData.map((r) => ({
            id: r._id,
            name: r.name,
            calories: r.totalNutrition?.calories || 0,
            image:
              r.imageUrl ||
              r.image ||
              "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
          }));
          setRecipes(formatted);
        } else {
          setRecipes([]);
        }
      } catch (err) {
        console.error("Lỗi fetchRecipes:", err);
        setRecipes([]);
      } finally {
        setIsLoadingRecipes(false);
        setReloadWeek(false)
      }
    };

    fetchRecipes();
    if (currentMode === "day") fetchDailyData();
    if (currentMode === "week") fetchWeeklyData();
  }, [currentMode, reloadWeek]);

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
    fetchDailyData,
    fetchWeeklyData,
  };
}
