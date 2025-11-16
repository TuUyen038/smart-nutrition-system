import React, { useState, useMemo, useEffect } from "react";
import { Box, Paper, Tabs, Tab } from "@mui/material";
import { CalendarToday, DateRange } from "@mui/icons-material";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import DayMenu from "./components/DayMenu";
import WeekMenu from "./components/WeekMenu";
import MenuModal from "./components/MenuModal";

import { getRecipes } from "services/recipeApi";

function MealPlannerTabs() {
  const [recipes, setRecipes] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

  // Tabs
  const [tabValue, setTabValue] = useState("day");
  const handleSetTabValue = (_, v) => setTabValue(v);

  // Dates
  const today = "2025-11-16";
  const tomorrow = "2025-11-17";
  const weekThisStart = "2025-11-16";
  const weekNextStart = "2025-11-23";

  // Menus (init EMPTY, sẽ fill khi recipes load xong)
  const [menus, setMenus] = useState({});
  const [weekMenus, setWeekMenus] = useState({});

  // Modal
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

  // Fetch Recipes Once
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await getRecipes();
        if (res.success && Array.isArray(res.data)) {
          const formatted = res.data.map((r) => ({
            id: r._id,
            name: r.name,
            calories: r.totalNutrition?.calories || 0,
            image: r.imageUrl || "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
          }));

          setRecipes(formatted);

          // --- Default Menus ---
          setMenus({
            [today]: [formatted[0], formatted[1]].filter(Boolean),
            [tomorrow]: [formatted[2]].filter(Boolean),
          });

          setWeekMenus({
            [weekThisStart]: {
              "2025-11-16": [formatted[0], formatted[2]].filter(Boolean),
              "2025-11-17": [formatted[1], formatted[3]].filter(Boolean),
              "2025-11-18": [],
              "2025-11-19": [formatted[4]].filter(Boolean),
              "2025-11-20": [],
              "2025-11-21": [],
              "2025-11-22": [],
            },
            [weekNextStart]: {
              "2025-11-23": [],
              "2025-11-24": [],
              "2025-11-25": [],
              "2025-11-26": [],
              "2025-11-27": [],
              "2025-11-28": [],
              "2025-11-29": [],
            },
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy recipe:", error);
      } finally {
        setIsLoadingRecipes(false);
      }
    };
    fetchRecipes();
  }, []);

  // ---- Modal ----
  const handleOpenModal = ({ mode, date }) => {
    setCurrentMode(mode);
    setEditingDate(date);

    if (mode === "day") {
      setCurrentMenu(menus[date] || []);
    } else {
      setCurrentMenu({ ...(weekMenus[date] || {}) }); // clone tuần
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const toggleSelectRecipe = (recipe, targetDate = null) => {
    if (currentMode === "day") {
      setCurrentMenu((prev) =>
        prev.some((m) => m.id === recipe.id)
          ? prev.filter((m) => m.id !== recipe.id)
          : [...prev, recipe]
      );
    } else {
      if (!targetDate) return;
      setCurrentMenu((prev) => {
        const dayArr = prev[targetDate] || [];
        const updated = dayArr.some((m) => m.id === recipe.id)
          ? dayArr.filter((m) => m.id !== recipe.id)
          : [...dayArr, recipe];
        return { ...prev, [targetDate]: updated };
      });
    }
  };

  const handleDelete = (date, recipeId) => {
    setMenus((prev) => {
      const updated = (prev[date] || []).filter((item) => item.id !== recipeId);
      return { ...prev, [date]: updated };
    });
  };

  const handleSave = () => {
    if (currentMode === "day") {
      setMenus({ ...menus, [editingDate]: currentMenu });
      // Sync to week if exists
      const updatedWeekMenus = { ...weekMenus };
      Object.keys(updatedWeekMenus).forEach((week) => {
        if (updatedWeekMenus[week][editingDate]) {
          updatedWeekMenus[week][editingDate] = currentMenu;
        }
      });
      setWeekMenus(updatedWeekMenus);
    } else {
      setWeekMenus((prev) => ({
        ...prev,
        [editingDate]: currentMenu, // object { day: [recipes] }
      }));
    }
    handleCloseModal();
  };

  const getDayName = (dateString) => {
    const days = ["Chủ nhật","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"];
    return days[new Date(dateString).getDay()];
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
    handleOpenModal={({ date }) => {
      // Mỗi ngày là riêng lẻ → mở modal giống day
      setCurrentMode("day");
      setEditingDate(date);
      setCurrentMenu(weekMenus[weekThisStart][date] || []); // hoặc tuần tương ứng
      setOpenModal(true);
    }}
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
        toggleSelectRecipe={toggleSelectRecipe}
        handleSave={handleSave}
        recipes={recipes}
        totalCalories={totalCalories}
        getDayName={getDayName}
      />
    </DashboardLayout>
  );
}

export default MealPlannerTabs;
