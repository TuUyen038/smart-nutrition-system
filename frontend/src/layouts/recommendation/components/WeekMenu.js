import React from "react";
import PropTypes from "prop-types";
import { Box, Paper, Typography, Chip, Grid } from "@mui/material";
import { Restaurant as RestaurantIcon } from "@mui/icons-material";
import MDButton from "components/MDButton";
import FoodCard from "./FoodCard";

const WeekMenu = ({ weekMenus = {}, weekStarts = [], handleOpenModal, getDayName }) => {
  if (!weekStarts.length) return null; // fallback nếu không có tuần nào

  return (
    <Box>
      {weekStarts.map(({ start, label }) => {
        const week = weekMenus[start] || {}; // fallback {}
        const weekDates = Object.keys(week);
        const weekEnd = weekDates.length ? weekDates[weekDates.length - 1] : start;

        const hasMenu = Object.values(week).some((dayMenu) => (dayMenu || []).length > 0);
        const totalWeekCal = Object.values(week)
          .flatMap((dayMenu) => dayMenu || [])
          .reduce((sum, item) => sum + item.calories, 0);
        const totalDishes = Object.values(week).flatMap((dayMenu) => dayMenu || []).length;

        return (
          <Paper
            key={start}
            elevation={3}
            sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: "background.paper" }}
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
                      bgcolor: "rgba(0,0,0,0.05)",
                      color: "text.primary",
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>

              <Box display="flex" gap={1}>
                {hasMenu ? (
                  <MDButton
                    variant="outlined"
                    startIcon={<RestaurantIcon />}
                    size="small"
                    onClick={() => handleOpenModal({ mode: "week", date: start })}
                  >
                    Chỉnh sửa
                  </MDButton>
                ) : (
                  <>
                    <MDButton
                      variant="contained"
                      startIcon={<RestaurantIcon />}
                      size="small"
                      onClick={() => handleOpenModal({ mode: "week", date: start })}
                    >
                      Tạo menu
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      startIcon={<RestaurantIcon />}
                      size="small"
                      onClick={() => handleOpenModal({ mode: "week", date: start })}
                    >
                      Gợi ý AI
                    </MDButton>
                  </>
                )}
              </Box>

            </Box>

            {hasMenu && weekDates.length > 0 && (
              <Box>
                {weekDates.map((date) => {
                  const dayMenu = week[date] || [];
                  if (!dayMenu.length) return null;
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
                              <FoodCard title={item.name} calories={item.calories} image={item.image}>
                                <MDButton
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  onClick={() => handleOpenModal({ mode: "day", date })}
                                >
                                  Chi tiết
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

WeekMenu.propTypes = {
  weekMenus: PropTypes.object, // fallback {}
  weekStarts: PropTypes.array, // fallback []
  handleOpenModal: PropTypes.func.isRequired,
  getDayName: PropTypes.func.isRequired,
};

export default WeekMenu;
