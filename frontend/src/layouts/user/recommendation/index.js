import React, { useState, useMemo, useEffect } from "react";
import { Box, Paper, Tabs, Tab } from "@mui/material";
import { CalendarToday, DateRange } from "@mui/icons-material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import DayMenu from "./components/DayMenu";
import WeekMenu from "./components/WeekMenu";
import MenuModal from "./components/MenuModal";

import { useMealPlanner } from "./hooks/useMealPlan";

function MealPlannerTabs() {
  const userId = "68f4394c4d4cc568e6bc5daa";

  // TAB + MODAL
  const [tabValue, setTabValue] = useState("day");
  const [openModal, setOpenModal] = useState(false);
  const [currentMenu, setCurrentMenu] = useState([]);
  const [currentMode, setCurrentMode] = useState("day");
  const [editingDate, setEditingDate] = useState(null);
  const [editingWeekStart, setEditingWeekStart] = useState(null);

  const {
    totalCalories: totalCaloriesState,
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
  } = useMealPlanner(userId, currentMode);

  useEffect(() => {
    setCurrentMode(tabValue === "day" ? "day" : "week");
  }, [tabValue]);

  const handleSetTabValue = (_, v) => setTabValue(v);

  const totalCalories = useMemo(() => {
    if (currentMode === "day")
      return (currentMenu || []).reduce((sum, m) => sum + (m.calories || 0), 0);
    if (currentMode === "week")
      return Object.values(currentMenu || {})
        .flat()
        .reduce((sum, m) => sum + (m.calories || 0), 0);
    return 0;
  }, [currentMenu, currentMode]);

  const getDayName = (dateString) => {
    if (!dateString) return "";
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return days[new Date(dateString).getDay()];
  };

  const handleOpenModalForDay = async ({ date, menu }) => {
    setCurrentMode("day");
    setEditingDate(date);
    if (menu?.length > 0) {
      setCurrentMenu(menu);
    } else {
      setCurrentMenu([]);
    }
    setOpenModal(true);
  };

  const handleOpenModalForWeekDay = ({ date, weekStart }) => {
    setCurrentMode("week");
    setEditingDate(date);
    setEditingWeekStart(weekStart);

    const dayMenu = weekMenus[weekStart]?.[date];
    console.log("🔍 [index] weekMenus[weekStart]:", weekMenus[weekStart]);
    console.log("🔍 [index] dayMenu from weekMenus:", dayMenu);
    setCurrentMenu(dayMenu?.length > 0 ? dayMenu : []);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingWeekStart(null);
  };

  // SAVE
  const handleSave = async (updatedItems, date) => {
    if (!updatedItems || updatedItems.length === 0) {
      // Nếu không có items, vẫn gọi API để xóa thực đơn (nếu cần)
      // Hoặc return sớm nếu không muốn làm gì
      return;
    }

    const formattedItems = updatedItems.map((r) => {
      const itemId = r.id || r._id || r.recipeId?._id || r.recipeId;
      return {
        id: itemId,
        name: r.name,
        calories: r.calories || r.totalNutrition?.calories || 0,
        imageUrl: r.imageUrl,
        portion: r.portion || 1, // Lưu portion
        status: r.status || "planned", // Giữ nguyên status nếu có
        note: r.note || "",
        servingTime: r.servingTime || "other",
      };
    });

    try {
      if (currentMode === "day") {
        await saveDayMenus(date, formattedItems);
        if (fetchDailyData) {
          await fetchDailyData();
        }
      }

      if (currentMode === "week") {
        await saveWeekMenus(date, formattedItems);
        if (fetchWeeklyData) {
          await fetchWeeklyData();
        }
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      throw error;
    }
  };

  const handleDelete = (date, recipeId) => {
    setMenus((prev) => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return prevArray.map((menu) =>
        menu.date === date
          ? { ...menu, recipes: menu.recipes.filter((r) => r.id !== recipeId) }
          : menu
      );
    });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box py={3} px={2}>
        <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleSetTabValue}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              label="Theo ngày"
              icon={<CalendarToday fontSize="small" />}
              iconPosition="start"
              value="day"
            />
            <Tab
              label="Theo tuần"
              icon={<DateRange fontSize="small" />}
              iconPosition="start"
              value="week"
            />
          </Tabs>
        </Paper>

        {isLoadingRecipes ? (
          <div>Đang tải menu...</div>
        ) : (
          <>
            {tabValue === "day" && (
              <DayMenu
                totalCalories={totalCaloriesState}
                menus={menus}
                setMenus={setMenus}
                days={[
                  { date: today, label: "Hôm nay" },
                  { date: tomorrow, label: "Ngày mai" },
                ]}
                handleOpenModal={handleOpenModalForDay}
                handleDelete={handleDelete}
                getDayName={getDayName}
                fetchDailyData={fetchDailyData}
              />
            )}

            {tabValue === "week" && (
              <WeekMenu
                weekMenus={weekMenus}
                setWeekMenus={setWeekMenus}
                mealPlanIds={mealPlanIds}
                createEmptyMealPlan={createEmptyMealPlan}
                weekStarts={[
                  { start: weekThisStart, label: "Tuần này" },
                  { start: weekNextStart, label: "Tuần sau" },
                ]}
                handleOpenModal={handleOpenModalForWeekDay}
                getDayName={getDayName}
                userId={userId}
                fetchWeeklyData={fetchWeeklyData}
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
