import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Chip,
  Grid,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
} from "@mui/material";
import { Edit, Restaurant as RestaurantIcon } from "@mui/icons-material";
import MDButton from "components/MDButton";
import FoodCard from "./FoodCard";
import MDTypography from "components/MDTypography";
import { createRecommendDailyMenu } from "services/dailyMenuApi";

const DayMenu = ({ menus, setMenus, days, handleOpenModal, handleDelete, getDayName }) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const handleOpenConfirmDialog = (date) => {
    setSelectedDate(date);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    if (loadingCreate) return;
    setConfirmDialogOpen(false);
    setSelectedDate(null);
  };

  const handleConfirmCreateDailyMenu = async () => {
    if (!selectedDate) return;

    try {
      setLoadingCreate(true);

      const plan = await createRecommendDailyMenu({
        date: selectedDate,
      });

      setMenus((prevMenus) => ({
        ...prevMenus,
        [selectedDate]: (plan.recipes || []).map((r) => ({
          id: r.recipeId?._id || r.recipeId, // fallback nếu backend trả id dạng string
          name: r.recipeId?.name || "Unknown",
          calories: r.recipeId?.totalNutrition?.calories || 0,
          image:
            r.recipeId?.imageUrl ||
            "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
        })),
      }));
    } catch (error) {
      console.error("❌ Error in handleConfirmCreateDailyMenu:", error);
      alert(error.message || "Tạo thực đơn thất bại");
    } finally {
      setLoadingCreate(false);
      handleCloseConfirmDialog();
    }
  };

  return (
    <Box>
      {days.map(({ date, label }) => {
        const menu = menus[date] || [];
        const hasMenu = menu.length > 0;
        const totalCal = hasMenu ? menu.reduce((sum, item) => sum + (item?.calories || 0), 0) : 0;
        const totalDishes = menu.length;

        return (
          <Paper key={date} elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start"  mb={2}>
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

              <Box display="flex" gap={1}>
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
                  <>
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
                      onClick={() => handleOpenConfirmDialog(date)}
                    >
                      Gợi ý Menu
                    </MDButton>
                  </>
                )}
              </Box>
            </Box>

            {hasMenu && (
              <Grid container spacing={2}>
                {menu.map((item) => (
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
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        );
      })}

      <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Xác nhận tạo thực đơn</DialogTitle>
        <DialogContent dividers>
          <MDTypography mb={1}>
            Bạn có chắc chắn muốn để hệ thống gợi ý thực đơn cho ngày này?
            {/* {" "}
            <strong>{selectedDate}</strong>? */}
          </MDTypography>
          {/* <MDTypography variant="body2" color="text" mb={3}>
            Thực đơn sẽ được tạo tự động cho ngày này.
          </MDTypography> */}
        </DialogContent>
        <DialogActions>
          <MDButton
            color="secondary"
            variant="outlined"
            onClick={handleCloseConfirmDialog}
            disabled={loadingCreate}
          >
            Hủy
          </MDButton>
          <MDButton
            variant="contained"
            color="info"
            onClick={handleConfirmCreateDailyMenu}
            disabled={loadingCreate}
          >
            Đồng ý
          </MDButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

DayMenu.propTypes = {
  // menus là object dạng { [date]: [array món] }
  menus: PropTypes.objectOf(PropTypes.array).isRequired,
  setMenus: PropTypes.func.isRequired,
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
