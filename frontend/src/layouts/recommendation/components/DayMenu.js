import React from "react";
import PropTypes from "prop-types";
import { Box, Paper, Typography, Chip, Grid } from "@mui/material";
import { Restaurant as RestaurantIcon } from "@mui/icons-material";
import MDButton from "components/MDButton";
import FoodCard from "./FoodCard";

const DayMenu = ({ menus, today, tomorrow, handleOpenModal, getDayName }) => {
  const days = [
    { date: today, label: "Hôm nay" },
    { date: tomorrow, label: "Ngày mai" },
  ];

  return (
    <Box>
      {days.map(({ date, label }) => {
        const menu = menus[date] || []; // fallback []
        const hasMenu = menu.length > 0;
        const totalCal = menu.reduce((sum, item) => sum + item.calories, 0);

        return (
          <Paper
            key={date}
            elevation={3}
            sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: "background.paper" }}
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
                    onClick={() => handleOpenModal({ mode: "day", date })}
                  >
                    Chỉnh sửa
                  </MDButton>
                ) : (
                  <>
                    <MDButton
                      variant="contained"
                      startIcon={<RestaurantIcon />}
                      size="small"
                      onClick={() => handleOpenModal({ mode: "day", date })}
                    >
                      Tạo menu
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      startIcon={<RestaurantIcon />}
                      size="small"
                      onClick={() => handleOpenModal({ mode: "day", date })}
                    >
                      Gợi ý AI
                    </MDButton>
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
                        fullWidth
                        onClick={() => handleOpenModal({ mode: "day", date })}
                      >
                        Chi tiết
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

DayMenu.propTypes = {
  menus: PropTypes.object.isRequired,
  today: PropTypes.string.isRequired,
  tomorrow: PropTypes.string.isRequired,
  handleOpenModal: PropTypes.func.isRequired,
  getDayName: PropTypes.func.isRequired,
};

export default DayMenu;
