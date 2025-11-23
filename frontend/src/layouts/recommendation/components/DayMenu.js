import React from "react";
import PropTypes from "prop-types";
import { Box, Paper, Typography, Chip, Grid } from "@mui/material";
import { Delete, Edit, Restaurant as RestaurantIcon } from "@mui/icons-material";
import MDButton from "components/MDButton";
import FoodCard from "./FoodCard";
import MDTypography from "components/MDTypography";

const DayMenu = ({ menus, days, handleOpenModal, handleDelete, getDayName }) => {
  return (
    <Box>
      {days.map(({ date, label }) => {
        let menu = menus[date] || [];
        const hasMenu = menu.length > 0;
        const totalCal = hasMenu
          ? menu.reduce((sum, item) => sum + (item?.calories || 0), 0)
          : 0;
        const totalDishes = menu.length;

        return (
          <Paper key={date} elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Box>
                <MDTypography variant="h5">{label}</MDTypography>
                <Box display="flex" alignItems="center" gap={3} mt={1}>
                  <MDTypography variant="body2" color="text" fontSize="0.9rem">
                    {getDayName(date)} ({date})
                  </MDTypography>
                  {hasMenu && (
                    <Chip
                      icon={<RestaurantIcon />}
                      label={`${totalDishes} món - ${totalCal} kcal`}
                      size="small"
                    />
                  )}
                </Box>
              </Box>

              <Box gap={1}>
                {hasMenu ? (
                  <MDButton
                    variant="outlined"
                    color="info"
                    startIcon={<Edit />}
                    size="small"
                    onClick={() => handleOpenModal({ mode: "day", date, menu, isEdit: true })}
                  >
                    Chỉnh sửa
                  </MDButton>
                ) : (
                  <Box display="flex" gap={1}>
                    <MDButton
                      variant="contained"
                      color="info"
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
                      color="info"
                      onClick={() => handleOpenModal({ mode: "day", date })}
                    >
                      Gợi ý AI
                    </MDButton>
                  </Box>
                )}
              </Box>
            </Box>

            {hasMenu && (
              <Grid container spacing={2}>
                {menu.map((item, idx) =>
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      key={item.id || item.recipeId || item._id}
                    >
                      <FoodCard
                        title={item.name}
                        calories={item?.calories}
                        image={
                          item.image ||
                          "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg"
                        }
                      >
                      </FoodCard>
                    </Grid>
                )}
              </Grid>
            )}
          </Paper>
        );
      })}
    </Box>
  );
};

DayMenu.propTypes = {
  menus: PropTypes.array.isRequired,
  days: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleOpenModal: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  getDayName: PropTypes.func.isRequired,
};

export default DayMenu;
