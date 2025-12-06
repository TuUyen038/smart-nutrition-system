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

  const {
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
      setCurrentMenu(menu);
    } else {
      setCurrentMenu([]);
    }
    setOpenModal(true);
  };

  const handleOpenModalForWeekDay = ({ date, weekStart }) => {
    setEditingDate(date);
    setEditingWeekStart(weekStart);

    const dayMenu = weekMenus[weekStart]?.[date];
    console.log("dayMenu", dayMenu);
    setCurrentMenu(dayMenu?.length > 0 ? dayMenu : []);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingWeekStart(null);
  };

  // SAVE
  const handleSave = async (updatedItems, date) => {
    if (!updatedItems) return;

    const formattedItems = updatedItems.map((r) => ({
      id: r.id || r._id || r.recipeId,
      name: r.name,
      calories: r.calories || 0,
      image: r.image || "default_url",
    }));

    if (currentMode === "day") {
      await saveDayMenus(date, formattedItems);

      if (editingWeekStart) {
        setWeekMenus((prev) => ({
          ...prev,
          [editingWeekStart]: {
            ...prev[editingWeekStart],
            [date]: formattedItems,
          },
        }));
      }
      setMenus((prev) => ({
        ...prev,
        [date]: formattedItems,
      }));
    }

    if (currentMode === "week") {
      await saveWeekMenus(date, formattedItems);
      setWeekMenus((prev) => ({
        ...prev,
        [editingWeekStart]: {
          ...prev[editingWeekStart],
          [date]: formattedItems,
        },
      }));
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
                menus={menus}
                setMenus={setMenus}
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
                mealPlanIds={mealPlanIds}
                createEmptyMealPlan={createEmptyMealPlan}
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
