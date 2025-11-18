// pages/MealPlannerTabs.js
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

  // Sử dụng hook
  const {
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
    createWeekDates,
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

  const handleOpenModal = async ({ mode, date, menu, isEdit }) => {
    setCurrentMode(mode);
    setEditingDate(date);
    if (menu?.length > 0) {
      const newMenu = menu[0].recipes.map((r) => ({
        id: r.recipeId,
        name: r.name,
        calories: r.totalNutrition?.calories,
        portion: r.portion || 1,
        status: "planned",
      }));
      setCurrentMenu(newMenu);
    } else {
      setCurrentMenu([]);
    }

    // else if (mode === "week") {
    //   setEditingDate(weekStart);
    //   setEditingWeekStart(weekStart);

    //   const week = weekMenus[weekStart] || createWeekDates(weekStart);
    //   setCurrentMenu({ ...week });

    // if (createEmptyPlan) {
    //   // Tạo MealPlan trống trên BE
    //   await createMealPlan({
    //     userId,
    //     period: "week",
    //     startDate: weekStart,
    //     endDate: formatDateVN(
    //       new Date(new Date(weekStart).setDate(new Date(weekStart).getDate() + 6))
    //     ),
    //     dailyMenuIds: [],
    //     source: "user",
    //     generatedBy: "user",
    //   });
    // }
    // }

    setOpenModal(true);
  };

  const handleOpenModalForWeekDay = ({ date, weekStart }) => {
    setEditingDate(date);
    setEditingWeekStart(weekStart);
    setCurrentMenu(weekMenus[weekStart]?.[date] || []);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingWeekStart(null);
  };

  // SAVE
  const handleSave = async (updatedItems, date) => {
    if (!updatedItems) return;
    if (currentMode === "day") {
      if (editingWeekStart) {
        setWeekMenus((prev) => ({
          ...prev,
          [editingWeekStart]: {
            ...prev[editingWeekStart],
            [date]: updatedItems,
          },
        }));
      }

      const saved = await saveDayMenus(date, updatedItems); // giả sử trả về DailyMenu mới
      setMenus((prev) => {
      // ✅ Filter out null/undefined trước khi xử lý
      const prevArray = Array.isArray(prev) 
        ? prev.filter(m => m && m.date) // Loại bỏ null/undefined
        : [];
      
      const existIdx = prevArray.findIndex(
        (m) => new Date(m.date).toDateString() === new Date(date).toDateString()
      );

      if (existIdx >= 0) {
        return prevArray.map((menu, idx) => 
          idx === existIdx ? saved : menu
        );
      }

      return [...prevArray, saved];
    });

    }

    if (currentMode === "week") {
      setWeekMenus((prev) => ({
        ...prev,
        [editingWeekStart]: updatedItems,
      }));

      await saveWeekMenus(editingWeekStart);
    }

    setOpenModal(false);
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
                setWeekMenus={setWeekMenus}
                weekStarts={[
                  { start: weekThisStart, label: "Tuần này" },
                  { start: weekNextStart, label: "Tuần sau" },
                ]}
                handleOpenModal={handleOpenModalForWeekDay}
                getDayName={getDayName}
                userId={userId}
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
