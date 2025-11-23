import React from "react";
import PropTypes from "prop-types";
import { Box, Paper, Chip, Grid } from "@mui/material";
import { Edit, Restaurant as RestaurantIcon } from "@mui/icons-material";
import MDButton from "components/MDButton";
import FoodCard from "./FoodCard";
import MDTypography from "components/MDTypography";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { createMealPlan } from "services/mealPlanApi";

const formatDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(
    2,
    "0"
  )}`;

const WeekMenu = ({
  weekMenus = {},
  setWeekMenus,
  mealPlanIds,
  createEmptyMealPlan,
  weekStarts = [],
  handleOpenModal,
  getDayName,
  userId,
}) => {
  if (!weekStarts.length) return null;

  return (
    <Box>
      {weekStarts.map(({ start, label }) => {
        const week = weekMenus[start] || {};
        const [year, month, day] = start.split("-").map(Number);
        const startDate = new Date(year, month - 1, day);
        const weekDates = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(startDate);
          d.setDate(d.getDate() + i);
          return formatDate(d);
        });
        const weekEnd = weekDates[6];

        const hasMealPlan = Object.keys(week).length > 0;

        const allMeals = (week.dailyMenuIds || [])
          .flatMap((dayMenu) => dayMenu.recipes || [])
          .filter((item) => item && item.recipeId.name);

        const totalWeekCal = (week.dailyMenuIds || []).reduce(
          (sum, dayMenu) => sum + (dayMenu.totalNutrition?.calories || 0),
          0
        );

        const totalDishes = allMeals.length;

        const [isEditingWeek, setIsEditingWeek] = React.useState(false);

        const handleCreateMealPlan = async () => {
          try {
            await createEmptyMealPlan(start);
            alert("Đã tạo thực đơn trống cho tuần!");
          } catch (err) {
            console.error(err);
            alert("Không thể tạo thực đơn");
          }
        };

        return (
          <Paper
            key={start}
            elevation={3}
            sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: "background.paper" }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Box>
                <MDTypography variant="h5">{label}</MDTypography>
                <MDTypography fontWeight="light" color="text" fontSize="0.9rem">
                  {start} → {weekEnd}
                </MDTypography>
                {totalDishes > 0 && (
                  <Chip
                    icon={<RestaurantIcon />}
                    label={`${totalDishes} món - ${Math.round(totalWeekCal)} kcal`}
                    sx={{
                      mt: 1,
                      bgcolor: "rgba(0,0,0,0.05)",
                      color: "text.primary",
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>

              <Box display="flex" gap={1}>
                {!hasMealPlan ? (
                  <>
                    <MDButton
                      variant="contained"
                      startIcon={<RestaurantIcon />}
                      size="small"
                      color="info"
                      onClick={handleCreateMealPlan}
                    >
                      Tạo thực đơn
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      startIcon={<RestaurantIcon />}
                      size="small"
                      color="info"
                      onClick={() =>
                        handleOpenModal({ mode: "week", weekStart: start, useAI: true })
                      }
                    >
                      Gợi ý AI
                    </MDButton>
                  </>
                ) : (
                  <MDButton
                    variant={isEditingWeek ? "contained" : "outlined"}
                    startIcon={<Edit />}
                    size="small"
                    color="info"
                    onClick={() => setIsEditingWeek(!isEditingWeek)}
                  >
                    {isEditingWeek ? "Đang chỉnh sửa" : "Chỉnh sửa"}
                  </MDButton>
                )}
              </Box>
            </Box>

            {/* Hiển thị các ngày trong tuần */}
            {hasMealPlan &&
              (week.dailyMenuIds || []).map((dayMenu, index) => {
                const date = weekDates[index];
                const validItems = (dayMenu.recipes || []).filter(Boolean);

                const dayCal = dayMenu.totalNutrition?.calories || 0;

                return (
                  <Box key={date} mb={2}>
                    <Paper
                      sx={{
                        p: 0,
                        bgcolor: "white",
                        borderRadius: 2,
                        border: "1px solid rgba(0,0,0,0.05)",
                        boxShadow: "0px 1px 4px rgba(0,0,0,0.04)",
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={0}
                        sx={{ backgroundColor: "#f5f5f5", p: 1, width: "100%" }}
                      >
                        <Box display="flex" alignItems="center" gap={1} mb={0}>
                          <MDTypography variant="h6" fontSize="0.9rem">
                            {getDayName(date)}
                          </MDTypography>
                          <MDTypography
                            variant="body2"
                            fontWeight="light"
                            color="text"
                            fontSize="0.8rem"
                          >
                            ({date})
                          </MDTypography>
                          {validItems.length > 0 && (
                            <Chip
                              icon={<LocalFireDepartmentIcon />}
                              label={`${validItems.length} món - ${Math.round(dayCal)} kcal`}
                              size="small"
                            />
                          )}
                        </Box>

                        {isEditingWeek && (
                          <Box alignItems="center">
                            <MDButton
                              variant="outlined"
                              startIcon={<Edit />}
                              size="small"
                              color="info"
                              onClick={() =>
                                handleOpenModal({
                                  weekStart: start,
                                  date,
                                  mode: "day",
                                  dailyMenuId: dayMenu._id,
                                })
                              }
                            >
                              Chỉnh sửa ngày
                            </MDButton>
                          </Box>
                        )}
                      </Box>

                      {validItems.length > 0 ? (
                        <Grid container spacing={2} p={2}>
                          {validItems.map((item, idx) => (
                            <Grid item xs={12} sm={6} md={3} key={item._id || idx}>
                              <FoodCard
                                title={item.recipeId?.name}
                                calories={item.recipeId.totalNutrition?.calories || 0}
                                image={item.recipeId?.image || "https://via.placeholder.com/150"}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Box p={2} textAlign="center">
                          <MDTypography variant="body2" color="text" fontWeight="light">
                            Chưa có món ăn cho ngày này
                          </MDTypography>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                );
              })}
          </Paper>
        );
      })}
    </Box>
  );
};

WeekMenu.propTypes = {
  weekMenus: PropTypes.object.isRequired,
  setWeekMenus: PropTypes.func.isRequired,
  mealPlanIds: PropTypes.object.isRequired,
  createEmptyMealPlan: PropTypes.func.isRequired,
  weekStarts: PropTypes.array.isRequired,
  handleOpenModal: PropTypes.func.isRequired,
  getDayName: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default WeekMenu;
