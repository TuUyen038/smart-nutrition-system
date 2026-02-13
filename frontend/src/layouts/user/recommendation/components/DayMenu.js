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
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Edit,
  Restaurant as RestaurantIcon,
  CheckCircle,
  CheckCircleOutline,
} from "@mui/icons-material";
import MDButton from "components/MDButton";
import FoodCard from "./FoodCard";
import MDTypography from "components/MDTypography";
import { createRecommendDailyMenu, updateMealStatus } from "services/dailyMenuApi";
import { useToast } from "context/ToastContext";

const DayMenu = ({
  totalCalories,
  menus,
  setMenus,
  days,
  handleOpenModal,
  getDayName,
  fetchDailyData,
}) => {
  const { showSuccess, showError } = useToast();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [updatingMealIds, setUpdatingMealIds] = useState(new Set()); // Track meals being updated

  const canTickForDate = (dateString) => {
    if (!dateString) return false;
    const menuDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    menuDate.setHours(0, 0, 0, 0);

    // Không cho phép tick cho ngày tương lai
    if (menuDate > today) return false;

    // Không cho phép tick cho ngày quá 7 ngày trong quá khứ
    const diffTime = today - menuDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 7) return false;

    return true;
  };

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

      // Reload data từ API để có đầy đủ mealId và status
      if (fetchDailyData) {
        await fetchDailyData();
      } else {
        // Fallback: update local state nếu không có fetchDailyData
        setMenus((prevMenus) => ({
          ...prevMenus,
          [selectedDate]: (plan.recipes || []).map((r) => ({
            id: r.recipeId?._id || r.recipeId,
            _id: r._id, // Lưu mealId từ response
            name: r.recipeId?.name || "Unknown",
            calories: r.recipeId?.totalNutrition?.calories || 0,
            portion: r.portion || 1,
            status: r.status || "planned",
            imageUrl:
              r.recipeId?.imageUrl ||
              "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
          })),
        }));
      }
    } catch (error) {
      console.error("Error in handleConfirmCreateDailyMenu:", error);
      alert(error.message || "Tạo thực đơn thất bại");
    } finally {
      setLoadingCreate(false);
      handleCloseConfirmDialog();
    }
  };

  const handleToggleEaten = async (_id, currentStatus, date, itemIndex) => {
    if (updatingMealIds.has(_id)) return; // Prevent double-clicking

    const newStatus = currentStatus === "eaten" ? "planned" : "eaten";

    try {
      setUpdatingMealIds((prev) => new Set(prev).add(_id));

      // Optimistic update
      setMenus((prev) => {
        const updated = { ...prev };
        if (updated[date]) {
          updated[date] = [...updated[date]];
          updated[date][itemIndex] = {
            ...updated[date][itemIndex],
            status: newStatus,
          };
        }
        return updated;
      });

      await updateMealStatus(_id, newStatus);

      showSuccess(newStatus === "eaten" ? "Đã đánh dấu đã ăn" : "Đã bỏ đánh dấu");
    } catch (error) {
      console.error("Error updating meal status:", error);
      showError(error.message || "Không thể cập nhật trạng thái");

      // Rollback optimistic update
      setMenus((prev) => {
        const updated = { ...prev };
        if (updated[date]) {
          updated[date] = [...updated[date]];
          updated[date][itemIndex] = {
            ...updated[date][itemIndex],
            status: currentStatus,
          };
        }
        return updated;
      });
    } finally {
      setUpdatingMealIds((prev) => {
        const next = new Set(prev);
        next.delete(_id);
        return next;
      });
    }
  };

  const handleTickAll = async (date, menuItems) => {
    const plannedItems = menuItems.filter((item) => item.status !== "eaten" && item._id);
    if (plannedItems.length === 0) {
      showSuccess("Không có món nào cần đánh dấu");
      return;
    }

    try {
      setMenus((prev) => {
        const updated = { ...prev };
        if (updated[date]) {
          updated[date] = updated[date].map((item) =>
            item._id && item.status !== "eaten" ? { ...item, status: "eaten" } : item
          );
        }
        return updated;
      });

      // Call API for all items
      await Promise.all(plannedItems.map((item) => updateMealStatus(item._id, "eaten")));

      showSuccess(`Đã cập nhật thêm ${plannedItems.length} món đã ăn`);
    } catch (error) {
      console.error("Error updating all meal statuses:", error);
      showError("Không thể cập nhật trạng thái cho tất cả món");
    }
  };

  return (
    <Box>
      {days.map(({ date, label }) => {
        const menu = menus[date] || [];
        const hasMenu = menu.length > 0;
        const totalDishes = menu.length;

        return (
          <Paper key={date} elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <MDTypography variant="h5">{label}</MDTypography>
                <Box display="flex" alignItems="center" gap={3} mt={1}>
                  <MDTypography variant="body2" color="text" fontSize="0.9rem">
                    {getDayName(date)} ({date})
                  </MDTypography>
                  {hasMenu && (
                    <Chip
                      icon={<RestaurantIcon />}
                      label={`${totalDishes} món - ${totalCalories[date]} kcal`}
                      size="small"
                    />
                  )}
                </Box>
              </Box>

              <Box display="flex" gap={1}>
                {hasMenu ? (
                  <>
                    {canTickForDate(date) && (
                      <MDButton
                        variant="outlined"
                        color="success"
                        size="small"
                        onClick={() => handleTickAll(date, menu)}
                        disabled={updatingMealIds.size > 0}
                      >
                        Đánh dấu tất cả
                      </MDButton>
                    )}
                    <MDButton
                      variant="outlined"
                      color="info"
                      startIcon={<Edit />}
                      size="small"
                      onClick={() => handleOpenModal({ date, menu })}
                    >
                      Chỉnh sửa
                    </MDButton>
                  </>
                ) : (
                  <>
                    <MDButton
                      variant="contained"
                      color="info"
                      startIcon={<RestaurantIcon />}
                      size="small"
                      onClick={() => handleOpenModal({ date, menu: [] })}
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
                {menu.map((item, index) => {
                  const isEaten = item.status === "eaten";
                  const _id = item._id;
                  const isUpdating = _id && updatingMealIds.has(_id);
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                      <Box sx={{ position: "relative" }}>
                        <FoodCard
                          title={item.name}
                          calories={item?.calories || 0}
                          imageUrl={
                            item.imageUrl ||
                            "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg"
                          }
                        />

                        {_id && canTickForDate(date) && (
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 8,
                              right: 8,
                              zIndex: 10,
                            }}
                          >
                            <Tooltip title={isEaten ? "Bỏ đánh dấu đã ăn" : "Đánh dấu đã ăn"}>
                              <IconButton
                                onClick={() =>
                                  handleToggleEaten(_id, item.status || "planned", date, index)
                                }
                                disabled={isUpdating}
                                sx={{
                                  bgcolor: "rgba(255, 255, 255, 0.9)",
                                  "&:hover": {
                                    bgcolor: "rgba(255, 255, 255, 1)",
                                  },
                                  "&:disabled": {
                                    opacity: 0.6,
                                  },
                                }}
                                size="small"
                              >
                                {isEaten ? (
                                  <CheckCircle sx={{ color: "success.main", fontSize: 28 }} />
                                ) : (
                                  <CheckCircleOutline
                                    sx={{ color: "text.secondary", fontSize: 28 }}
                                  />
                                )}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
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
          </MDTypography>
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
  totalCalories: PropTypes.objectOf(PropTypes.number).isRequired,
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
  fetchDailyData: PropTypes.func,
};

export default DayMenu;
