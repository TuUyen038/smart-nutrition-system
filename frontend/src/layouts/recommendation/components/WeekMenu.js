import React from "react";
import PropTypes from "prop-types";
import { Box, Paper, Typography, Chip, Grid } from "@mui/material";
import { Edit, Restaurant as RestaurantIcon } from "@mui/icons-material";
import MDButton from "components/MDButton";
import FoodCard from "./FoodCard";
import MDTypography from "components/MDTypography";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

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
                <MDTypography variant="h5">
                  {label}
                </MDTypography>
                <MDTypography
                  fontWeight="light"
                  color="text"
                  fontSize="0.9rem"
                >
                  {start} → {weekEnd}
                </MDTypography>
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
                  <></>
                ) : (
                  <>
                    <MDButton
                      variant="contained"
                      startIcon={<RestaurantIcon />}
                      size="small"
                      color="info"
                      onClick={() => handleOpenModal({ mode: "week", date: start })}
                    >
                      Tạo menu
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      startIcon={<RestaurantIcon />}
                      size="small"
                      color="info"

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
                      <Paper
                        component="div"
                        sx={{
                          p: 0,
                          bgcolor: "white",
                          borderRadius: 2,
                          border: "1px solid rgba(0,0,0,0.05)",
                          boxShadow: "0px 1px 4px rgba(0,0,0,0.04)",
                          position: "relative",   // ★ fix quan trọng
                        }}
                      >

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={0}
                          sx={{
                            backgroundColor: "#f5f5f5",
                            p: 1,
                            width: "100%",
                            zIndex: 10    // ★ thêm dòng này
                          }}
                        >

                          <Box display="flex" alignItems="center" gap={1} mb={0}>
                            <MDTypography
                              variant="h6"
                              fontSize="0.9rem"
                            >
                              {getDayName(date)}
                            </MDTypography>
                            <MDTypography
                              variant="body2"
                              fontWeight="light"
                              color="text"
                              fontSize="0.8rem"
                            >
                              ( {date} )
                            </MDTypography>
                            <Chip icon={<LocalFireDepartmentIcon />} label={`${dayCal} kcal`} size="small" color="warning" />
                          </Box>
                          <Box alignItems="center">
                            <MDButton
                              variant="outlined"
                              startIcon={<Edit />}
                              size="small"
                              color="info"
                              onClick={() => handleOpenModal({ mode: "week", date: date })}
                            >
                              Chỉnh sửa
                            </MDButton>
                          </Box>
                        </Box>
                        <Grid container spacing={2} p={2}>
                          {dayMenu.map((item) => (
                            <Grid item xs={12} sm={6} md={3} key={`${date}-${item.id}`}>
                              <FoodCard title={item.name} calories={item.calories} image={item.image}>
                                {/* <MDButton
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenModal({ mode: "day", date })}
                                >
                                  Xoá
                                </MDButton> */}
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
