import React, { useState, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Modal,
  Fade,
  Backdrop,
  Divider,
  Chip,
  Tab,
  Tabs,
  Card,
  CardContent,
  CardActions,
  Avatar,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  AutoAwesome as AutoAwesomeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Restaurant as RestaurantIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarTodayIcon,
  DateRange as DateRangeIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import FoodCard from "./components/FoodCard";
import MDButton from "components/MDButton";
import DayMenu from "./components/DayMenu";
import WeekMenu from "./components/WeekMenu";


// Mock data phong phú
const mockRecipes = [
  { id: 1, name: "Cơm gà", calories: 420, image: "🍗", type: "main" },
  { id: 2, name: "Bún bò Huế", calories: 350, image: "🍜", type: "main" },
  { id: 3, name: "Salad rau củ", calories: 180, image: "🥗", type: "side" },
  { id: 4, name: "Phở bò", calories: 400, image: "🍲", type: "main" },
  { id: 5, name: "Canh chua cá", calories: 300, image: "🐟", type: "soup" },
  { id: 6, name: "Trứng chiên", calories: 150, image: "🍳", type: "side" },
  { id: 7, name: "Cơm sườn", calories: 480, image: "🍖", type: "main" },
  { id: 8, name: "Bánh mì thịt", calories: 320, image: "🥖", type: "main" },
  { id: 9, name: "Gỏi cuốn", calories: 200, image: "🌯", type: "appetizer" },
  { id: 10, name: "Cháo gà", calories: 250, image: "🥣", type: "main" },
  { id: 11, name: "Xôi xéo", calories: 380, image: "🍚", type: "main" },
  { id: 12, name: "Bánh cuốn", calories: 280, image: "🥟", type: "main" },
];


function MealPlannerTabs() {
  const [tabValue, setTabValue] = useState("day");
  const handleSetTabValue = (e, value) => setTabValue(value);

  // Menu state với nhiều data
  const today = "2025-11-16";
  const tomorrow = "2025-11-17";
  const weekThisStart = "2025-11-16";
  const weekNextStart = "2025-11-23";

  const [menus, setMenus] = useState({
    [today]: [mockRecipes[0], mockRecipes[2], mockRecipes[4]],
    [tomorrow]: [mockRecipes[1], mockRecipes[5]],
  });

  const [weekMenus, setWeekMenus] = useState({
    [weekThisStart]: {
      "2025-11-16": [mockRecipes[0], mockRecipes[2]],
      "2025-11-17": [mockRecipes[1], mockRecipes[3]],
      "2025-11-18": [mockRecipes[6], mockRecipes[8]],
      "2025-11-19": [mockRecipes[7], mockRecipes[9]],
      "2025-11-20": [mockRecipes[10], mockRecipes[11]],
      "2025-11-21": [mockRecipes[4], mockRecipes[5]],
      "2025-11-22": [mockRecipes[0], mockRecipes[6]],
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

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [currentMenu, setCurrentMenu] = useState([]);
  const [currentMode, setCurrentMode] = useState(null);
  const [editingDate, setEditingDate] = useState(null);

  const totalCalories = useMemo(
    () => currentMenu.reduce((sum, m) => sum + m.calories, 0),
    [currentMenu]
  );

  const handleOpenModal = ({ mode, date }) => {
    setCurrentMode(mode);
    setEditingDate(date);

    if (mode === "day") {
      setCurrentMenu(menus[date] || []);
    } else if (mode === "week") {
      const week = weekMenus[date] || {};
      const merged = Object.values(week).flat();
      setCurrentMenu(merged);
    }

    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const toggleSelectRecipe = (recipe) => {
    if (currentMenu.find((m) => m.id === recipe.id)) {
      setCurrentMenu(currentMenu.filter((m) => m.id !== recipe.id));
    } else {
      setCurrentMenu([...currentMenu, recipe]);
    }
  };

  const handleSave = () => {
    if (currentMode === "day") {
      setMenus({ ...menus, [editingDate]: currentMenu });
    } else if (currentMode === "week") {
      const weekCopy = { ...weekMenus[editingDate] };
      Object.keys(weekCopy).forEach((date) => {
        weekCopy[date] = currentMenu;
      });
      setWeekMenus({ ...weekMenus, [editingDate]: weekCopy });
    }
    handleCloseModal();
  };

  const getDayName = (dateString) => {
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  // Render Day Tab
  const renderDayTab = () => {
    const days = [
      { date: today, label: "Hôm nay" },
      { date: tomorrow, label: "Ngày mai" },
    ];

    return (
      <Box>
        {days.map(({ date, label }) => {
          const menu = menus[date] || [];
          const hasMenu = menu.length > 0;
          const totalCal = menu.reduce((sum, item) => sum + item.calories, 0);

          return (
            <Paper
              key={date}
              elevation={3}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                color: "white",
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {getDayName(date)} - {date}
                  </Typography>
                  {hasMenu && (
                    <Chip
                      icon={<RestaurantIcon />}
                      label={`${menu.length} món - ${totalCal} kcal`}
                      sx={{
                        mt: 1,
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                <Box display="flex" gap={1}>
                  {hasMenu ? (
                    <MDButton
                      variant="outlined"
                      startIcon={<EditIcon />}
                      size="small"
                      onClick={() => handleOpenModal({ mode: "day", date })}
                      color='info'
                    >
                      Chỉnh sửa
                    </MDButton>
                  ) : (
                    <>
                      <MDButton
                        variant="contained"
                        startIcon={<EditIcon />}
                        size="small"
                        onClick={() => handleOpenModal({ mode: "day", date })}
                        color='info'
                      >
                        Tạo menu
                      </MDButton>
                      <Button
                        variant="outlined"
                        startIcon={<AutoAwesomeIcon />}
                        onClick={() => handleOpenModal({ mode: "day", date })}
                        sx={{
                          borderColor: "white",
                          color: "white",
                          "&:hover": {
                            borderColor: "white",
                            bgcolor: "rgba(255,255,255,0.1)",
                          },
                        }}
                      >
                        Gợi ý AI
                      </Button>
                    </>
                  )}
                </Box>
              </Box>

              {hasMenu && (
                <Grid container spacing={2}>
                  {menu.map((item) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                      <FoodCard title={item.name} calories={item.calories} image={item.image}>
                        <MDButton
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenModal({ mode: "day", date })}
                          color='info'
                        >
                          Chi tiết
                        </MDButton>
                        <MDButton
                          variant="outlined"
                          startIcon={<DeleteIcon />}
                          size="small"
                          // onClick={() => handleOpenModal({ mode: "day", date })}
                          color='info'
                        >
                          Xoá
                        </MDButton>
                      </FoodCard>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          );
        })}
      </Box>
    );
  };

  // Render Week Tab
  const renderWeekTab = () => {
    const weeks = [
      { start: weekThisStart, label: "Tuần này" },
      { start: weekNextStart, label: "Tuần sau" },
    ];

    return (
      <Box>
        {weeks.map(({ start, label }) => {
          const week = weekMenus[start] || {};
          const weekDates = Object.keys(week);
          const weekEnd = weekDates[weekDates.length - 1];
          const hasMenu = Object.values(week).some((dayMenu) => dayMenu.length > 0);
          const totalWeekCal = Object.values(week)
            .flat()
            .reduce((sum, item) => sum + item.calories, 0);
          const totalDishes = Object.values(week).flat().length;

          return (
            <Paper
              key={start}
              elevation={3}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                color: "white",
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {start} → {weekEnd}
                  </Typography>
                  {hasMenu && (
                    <Chip
                      icon={<RestaurantIcon />}
                      label={`${totalDishes} món - ${totalWeekCal} kcal`}
                      sx={{
                        mt: 1,
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                <Box display="flex" gap={1}>
                  {hasMenu ? (
                    <MDButton
                      variant="outlined"
                      startIcon={<EditIcon />}
                      size="small"
                      onClick={() => handleOpenModal({ mode: "week", date: start })}
                      color='info'
                    >
                      Chỉnh sửa
                    </MDButton>
                  ) : (
                    <>
                      <MDButton
                        variant="contained"
                        startIcon={<EditIcon />}
                        size="small"
                        onClick={() => handleOpenModal({ mode: "week", date: start })}
                        color='info'
                      >
                        Tạo menu
                      </MDButton>
                      <MDButton
                        variant="contained"
                        startIcon={<AutoAwesomeIcon />}

                        size="small"
                        onClick={() => handleOpenModal({ mode: "week", date: start })}
                        color='info'
                      >
                        Gợi ý từ AI
                      </MDButton>
                    </>
                  )}
                </Box>
              </Box>

              {hasMenu && (
                <Box>
                  {Object.entries(week).map(([date, dayMenu]) => {
                    if (dayMenu.length === 0) return null;
                    const dayCal = dayMenu.reduce((sum, item) => sum + item.calories, 0);

                    return (
                      <Box key={date} mb={2}>
                        <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.95)" }}>
                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                              {getDayName(date)} - {date}
                            </Typography>
                            <Chip label={`${dayCal} kcal`} size="small" color="warning" />
                          </Box>
                          <Grid container spacing={2}>
                            {dayMenu.map((item) => (
                              <Grid item xs={12} sm={6} md={3} key={`${date}-${item.id}`}>
                                <FoodCard
                                  title={item.name}
                                  calories={item.calories}
                                  image={item.image}
                                >
                                  <MDButton
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleOpenModal({ mode: "day", date })}
                                    color='info'
                                  >
                                    Chi tiết
                                  </MDButton>
                                  <MDButton
                                    variant="outlined"
                                    startIcon={<DeleteIcon />}
                                    size="small"
                                    // onClick={() => handleOpenModal({ mode: "day", date })}
                                    color='info'
                                  >
                                    Xoá
                                  </MDButton>
                                </FoodCard>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>
    );
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
            sx={{
              "& .MuiTab-root": {
                minHeight: 64,
                fontSize: "1rem",
                fontWeight: 600,
              },
            }}
          >
            <Tab
              label="Theo ngày"
              icon={<CalendarTodayIcon fontSize="small" />}
              iconPosition="start"
              value="day"
            />
            <Tab
              label="Theo tuần"
              icon={<DateRangeIcon fontSize="small" />}
              iconPosition="start"
              value="week"
            />
          </Tabs>
        </Paper>

        {tabValue === "day" && renderDayTab()}
        {tabValue === "week" && renderWeekTab()}
      </Box>

      {/* Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              borderRadius: 3,
              width: "90%",
              maxWidth: 900,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <Box
              sx={{
                position: "sticky",
                top: 0,
                bgcolor: "background.paper",
                borderBottom: 1,
                borderColor: "divider",
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                zIndex: 1,
              }}
            >
              <Typography variant="h5" fontWeight={700}>
                {currentMode === "day"
                  ? `Thực đơn ${editingDate}`
                  : `Thực đơn tuần bắt đầu ${editingDate}`}
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  icon={<LocalFireDepartmentIcon />}
                  label={`Tổng: ${totalCalories} kcal`}
                  color="warning"
                  sx={{ fontWeight: 600 }}
                />
                <Button onClick={handleCloseModal} sx={{ minWidth: "auto", p: 1 }}>
                  <CloseIcon />
                </Button>
              </Box>
            </Box>

            <Box p={3}>
              {/* Món đã chọn */}
              <Typography variant="h6" mb={2} fontWeight={600}>
                Món đã chọn ({currentMenu.length})
              </Typography>
              {currentMenu.length > 0 ? (
                <Grid container spacing={2} mb={3}>
                  {currentMenu.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <FoodCard title={item.name} calories={item.calories} image={item.image}>
                        <Button
                          fullWidth
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<DeleteIcon />}
                          onClick={() => toggleSelectRecipe(item)}
                        >
                          Xóa
                        </Button>
                      </FoodCard>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper sx={{ p: 3, mb: 3, textAlign: "center", bgcolor: "grey.50" }}>
                  <Typography color="text.secondary">
                    Chưa chọn món nào. Hãy chọn món từ danh sách bên dưới.
                  </Typography>
                </Paper>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Danh sách món ăn */}
              <Typography variant="h6" mb={2} fontWeight={600}>
                Danh sách món ăn
              </Typography>
              <Grid container spacing={2} mb={3}>
                {mockRecipes.map((recipe) => {
                  const isSelected = currentMenu.find((m) => m.id === recipe.id);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                      <FoodCard title={recipe.name} calories={recipe.calories} image={recipe.image}>
                        <Button
                          fullWidth
                          size="small"
                          variant={isSelected ? "contained" : "outlined"}
                          color={isSelected ? "success" : "primary"}
                          startIcon={isSelected ? <CheckCircleIcon /> : <AddIcon />}
                          onClick={() => toggleSelectRecipe(recipe)}
                        >
                          {isSelected ? "Đã chọn" : "Thêm"}
                        </Button>
                      </FoodCard>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                bgcolor: "background.paper",
                borderTop: 1,
                borderColor: "divider",
                p: 3,
                display: "flex",
                gap: 2,
              }}
            >
              <MDButton color="secondary" variant="outlined" fullWidth onClick={handleCloseModal} sx={{ py: 1.5 }}>
                Hủy
              </MDButton>
              <MDButton color="info" variant="contained" fullWidth onClick={handleSave} sx={{ py: 1.5 }}>
                Lưu thay đổi
              </MDButton>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </DashboardLayout>
  );
}

export default MealPlannerTabs;