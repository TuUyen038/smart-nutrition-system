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
        const menu = Array.isArray(menus[date]) ? menus[date] : []; // fallback []
        const hasMenu = menu.length > 0;
        const totalCal = menu.reduce((sum, item) => sum + (item?.calories || 0), 0);

        return (
          <Paper
            key={date}
            elevation={3}
            sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: "background.paper" }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <MDTypography variant="h5">
                  {label}
                </MDTypography>
                <MDTypography
                  variant="body2"
                  fontWeight="light"
                  color="text"
                  fontSize="0.9rem"
                >
                  {getDayName(date)} - {date}
                </MDTypography>
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
                    color="info"
                    startIcon={<Edit />}
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
                      color="info"
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
                {menu.map((item, idx) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item.id || item.recipeId || idx}>
                    <FoodCard title={item.name} calories={item.calories} image={item.image}>
                      <MDButton
                        variant="outlined"
                        startIcon={<Delete />}
                        size="small"
                        color="error"
                        onClick={() => handleDelete(date, item.id || item.recipeId)}
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

DayMenu.propTypes = {
  menus: PropTypes.object.isRequired,
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
