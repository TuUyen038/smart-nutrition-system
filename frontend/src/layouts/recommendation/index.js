import React, { useState, useMemo, useEffect } from "react";
import { Box, Paper, Tabs, Tab } from "@mui/material";
import { CalendarToday, DateRange } from "@mui/icons-material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import DayMenu from "./components/DayMenu";
import WeekMenu from "./components/WeekMenu";
import MenuModal from "./components/MenuModal";

import { getRecipes } from "services/recipeApi";
import { formatDateVN } from "helpers/date";

import { createDailyMenu } from "services/dailyMenuApi";
import { createMealPlan } from "services/mealPlanApi";

function MealPlannerTabs() {
  const userId = '68f4394c4d4cc568e6bc5daa';

  const [recipes, setRecipes] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

  const [tabValue, setTabValue] = useState("day");
  const handleSetTabValue = (_, v) => setTabValue(v);

  // =====================
  // DYNAMIC DATES
  // =====================
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
      const str = formatDateVN(d);
      weekObj[str] = [];
    }
    return weekObj;
  };

  // =====================
  // STATE MENUS
  // =====================
  const [menus, setMenus] = useState({
    [today]: [],
    [tomorrow]: [],
  });

  const [weekMenus, setWeekMenus] = useState({
    [weekThisStart]: createWeekDates(weekThisStart),
    [weekNextStart]: createWeekDates(weekNextStart),
  });

  // =====================
  // MODAL
  // =====================
  const [openModal, setOpenModal] = useState(false);
  const [currentMenu, setCurrentMenu] = useState([]);
  const [currentMode, setCurrentMode] = useState(null);
  const [editingDate, setEditingDate] = useState(null);

  const totalCalories = useMemo(() => {
    if (currentMode === "day") {
      return (currentMenu || []).reduce((sum, m) => sum + (m.calories || 0), 0);
    }
    if (currentMode === "week") {
      return Object.values(currentMenu || {})
        .flat()
        .reduce((sum, m) => sum + (m.calories || 0), 0);
    }
    return 0;
  }, [currentMenu, currentMode]);

  // =====================
  // FETCH RECIPES
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
            image: r.imageUrl || "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
          }));

          setRecipes(formatted);

          setMenus(prev => ({
            ...prev,
            [today]: [formatted[0], formatted[1]].filter(Boolean),
            [tomorrow]: [formatted[2]].filter(Boolean),
          }));

          setWeekMenus(prev => ({
            ...prev,
            [weekThisStart]: createWeekDates(weekThisStart),
            [weekNextStart]: createWeekDates(weekNextStart),
          }));
        }
      } catch (err) {
        console.error("Lỗi khi lấy recipe:", err);
      } finally {
        setIsLoadingRecipes(false);
      }
    };
    fetchRecipes();
  }, []);

  const handleOpenModal = ({ mode, date, weekStart }) => {
    setCurrentMode(mode);

    if (mode === "day") {
      setEditingDate(date);
      setCurrentMenu(menus[date] || []);
      setEditingWeekStart(weekStart || null); // Lưu weekStart nếu edit từ week view
    } else if (mode === "week") {
      setEditingDate(weekStart);
      setEditingWeekStart(weekStart);
      const week = weekMenus[weekStart] || createWeekDates(weekStart);
      setCurrentMenu({ ...week });
    }

    setOpenModal(true);
  };

  const handleOpenModalForWeekDay = ({ date, weekStart }) => {
    setEditingDate(date);
    setEditingWeekStart(weekStart); // Lưu weekStart
    setCurrentMenu(weekMenus[weekStart]?.[date] || []); // Lấy menu của ngày đó
    setOpenModal(true);
  };

  // Toggle recipe
  const toggleSelectRecipe = (recipe, targetDate = null) => {
    if (currentMode === "day") {
      setCurrentMenu(prev =>
        prev.some(m => m.id === recipe.id)
          ? prev.filter(m => m.id !== recipe.id)
          : [...prev, recipe]
      );
    } else if (currentMode === "week" && targetDate) {
      setCurrentMenu(prev => {
        const dayArr = prev[targetDate] || [];
        const updated = dayArr.some(m => m.id === recipe.id)
          ? dayArr.filter(m => m.id !== recipe.id)
          : [...dayArr, recipe];
        return { ...prev, [targetDate]: updated };
      });
    }
  };

  const handleSave = async (updatedItems, date) => {
    if (!updatedItems) return;

    if (currentMode === "day") {
      setMenus(prev => ({ ...prev, [date]: updatedItems }));

      if (editingWeekStart) {
        setWeekMenus(prev => ({
          ...prev,
          [editingWeekStart]: {
            ...prev[editingWeekStart],
            [date]: updatedItems,
          },
        }));
      }

      await saveDayMenus(date, updatedItems);  // 👈 TRUYỀN updatedItems XUỐNG
    }

    if (currentMode === "week") {
      setWeekMenus(prev => ({
        ...prev,
        [editingWeekStart]: updatedItems,
      }));
      await saveWeekMenus(editingWeekStart);
    }

    setOpenModal(false);
  };


  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingWeekStart(null);
  };

  const handleDelete = (date, recipeId) => {
    setMenus(prev => {
      const updated = (prev[date] || []).filter(item => item.id !== recipeId);
      return { ...prev, [date]: updated };
    });
  };

  const getDayName = dateString => {
    if (!dateString) return "";
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return days[new Date(dateString).getDay()];
  };

  // =====================
  // HELPER: map menus → payload DailyMenu
  // =====================
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
          status: "planned"
        }))
      }));
  };

  const saveDayMenus = async (date, updatedItems) => {
    try {
      const menu = updatedItems || [];

      if (menu.length === 0) {
        alert("Không có món nào để lưu!");
        return;
      }

      const payload = {
        userId,
        date,
        recipes: menu.map(r => ({
          recipeId: r.id,
          portion: r.portion || 1,
          note: r.note || "",
          servingTime: r.servingTime || "other",
          status: "planned"
        }))
      };

      await createDailyMenu(payload);
      alert("Đã lưu menu ngày thành công!");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu menu ngày.");
    }
  };


  const saveWeekMenus = async (weekStart) => {
    try {
      const weekObj = weekMenus[weekStart];
      if (!weekObj) {
        alert("Không tìm thấy dữ liệu tuần!");
        return;
      }

      const dailyPayloads = mapMenusToDailyMenuPayload(weekObj);

      if (dailyPayloads.length === 0) {
        alert("Không có món nào trong tuần để lưu!");
        return;
      }

      const mealPlanPayload = {
        userId,
        period: "week",
        startDate: weekStart,
        endDate: formatDateVN(new Date(new Date(weekStart).setDate(new Date(weekStart).getDate() + 6))),
        meals: [],
        source: "user",
        generatedBy: "user",
      };

      console.log("📅 Đang lưu tuần:", weekStart);
      console.log("📋 Daily payloads:", dailyPayloads);

      for (const dayMenu of dailyPayloads) {
        const response = await createDailyMenu(dayMenu);

        const dailyMenuId = response?._id || response?.data?._id;

        if (dailyMenuId) {
          mealPlanPayload.meals.push(dailyMenuId);
        } else {
          console.error("❌ Không lấy được ID từ response:", response);
        }
      }

      console.log("🎯 MealPlan payload final:", mealPlanPayload);

      if (mealPlanPayload.meals.length === 0) {
        alert("Không thể tạo MealPlan vì không có DailyMenu ID!");
        return;
      }

      // Tạo MealPlan
      await createMealPlan(mealPlanPayload);
      alert("Đã lưu menu tuần và MealPlan thành công!");
    } catch (err) {
      console.error("❌ Lỗi saveWeekMenus:", err);
      alert("Lỗi khi lưu menu tuần hoặc MealPlan.");
    }
  };

  // =====================
  // RENDER
  // =====================
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box py={3} px={2}>
        <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs value={tabValue} onChange={handleSetTabValue} indicatorColor="primary" textColor="primary">
            <Tab label="Theo ngày" icon={<CalendarToday fontSize="small" />} iconPosition="start" value="day" />
            <Tab label="Theo tuần" icon={<DateRange fontSize="small" />} iconPosition="start" value="week" />
          </Tabs>
        </Paper>

        {isLoadingRecipes ? (
          <div>Đang tải menu...</div>
        ) : (
          <>
            {tabValue === "day" && (
              <DayMenu
                menus={menus}
                days={[
                  { date: today, label: "Hôm nay" },
                  { date: tomorrow, label: "Ngày mai" },
                ]}
                handleOpenModal={handleOpenModal}
                handleDelete={handleDelete}
                getDayName={getDayName}
              />
            )}

            {tabValue === "week" && (
              <WeekMenu
                weekMenus={weekMenus}
                weekStarts={[
                  { start: weekThisStart, label: "Tuần này" },
                  { start: weekNextStart, label: "Tuần sau" },
                ]}
                handleOpenModal={handleOpenModalForWeekDay}
                getDayName={getDayName}
              />
            )}
          </>
        )}
      </Box>

      <MenuModal
        open={openModal}
        onClose={handleCloseModal}
        mode={currentMode}
        date={editingDate}
        currentMenu={currentMenu}
        onSave={handleSave}
        recipes={recipes}
        totalCalories={totalCalories}
        getDayName={getDayName}
      />

    </DashboardLayout>
  );
}

export default MealPlannerTabs;