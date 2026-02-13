import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Chip,
  Grid,
  DialogContent,
  DialogTitle,
  Dialog,
  DialogActions,
  Skeleton,
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
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { createMealPlan } from "services/mealPlanApi";
import { createRecommendMealPlan, getWeekDailyMenuStatus } from "services/mealPlanApi";
import { updateMealStatus } from "services/dailyMenuApi";
import { useToast } from "context/ToastContext";

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
  fetchWeeklyData,
}) => {
  if (!weekStarts.length) return null;
  const { showSuccess, showError } = useToast();
  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const [pendingWeekStart, setPendingWeekStart] = useState(null); // start date tuần đang chọn
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [existingDates, setExistingDates] = useState([]); // các ngày đã có DailyMenu trong tuần
  const [editingWeek, setEditingWeek] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmWeekStart, setConfirmWeekStart] = useState(null);
  // tuần đang show skeleton
  const [creatingWeekStart, setCreatingWeekStart] = useState(null);
  const [updatingMealIds, setUpdatingMealIds] = useState(new Set()); // Track meals being updated

  // Helper function: Check if date is within allowed range for ticking (today and up to 7 days ago)
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

  const handleOpenConfirmDialog = (weekStart) => {
    setConfirmWeekStart(weekStart);
    setConfirmDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    if (loadingCreate) return; // nếu không muốn cho đóng khi đang gọi API
    setConfirmDialogOpen(false);
    setConfirmWeekStart(null);
  };

  const handleCloseModeDialog = (force = false) => {
    if (loadingCreate && !force) return;
    setModeDialogOpen(false);
    setPendingWeekStart(null);
    setExistingDates([]);
  };

  const handleSelectMode = async (mode) => {
    if (!pendingWeekStart) return;

    const targetWeekStart = pendingWeekStart;

    handleCloseModeDialog(true);
    setCreatingWeekStart(targetWeekStart);

    try {
      setLoadingCreate(true);

      // const plan = await createRecommendMealPlan({
      //   userId,
      //   startDate: targetWeekStart,
      //   days: 7,
      //   mode: mode, // "reuse" hoặc "overwrite"
      // });
      await fetchWeeklyData();

      //       if (fetchWeeklyData) {
      //         await fetchWeeklyData();
      //       } else {
      //         // Fallback: update local state nếu không có fetchWeeklyData
      //         const formattedMenus = {};
      //         plan?.dailyMenuIds?.forEach((d) => {
      //           const dateKey = d.date; // "yyyy-mm-dd"
      //           formattedMenus[dateKey] = (d.recipes || []).map((r) => ({
      //             id: r.id,
      //             _id: r._id,
      //             name: r.recipeId.name,
      //             calories: r.recipeId.totalNutrition?.calories || 0,
      //             portion: r.portion || 1,
      //             status: r.status || "planned",
      //             imageUrl:
      //               r.recipeId.imageUrl ||
      //               "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
      //           }));
      //         });
      // console.log("formattedMenus", formattedMenus)
      //         setWeekMenus((prev) => ({
      //           ...prev,
      //           [targetWeekStart]: {
      //             ...(prev[targetWeekStart] || {}),
      //             ...formattedMenus, // ghi đè các ngày mà AI gợi ý
      //           },
      //         }));
      //       }
    } catch (err) {
      console.error("Create daily meal plan error:", err);
      showError(err.message || "Tạo thực đơn thất bại");
    } finally {
      setLoadingCreate(false);
      setCreatingWeekStart(null);
    }
  };

  const handleConfirmCreateWeekPlan = async () => {
    if (!confirmWeekStart) return;

    const targetWeekStart = confirmWeekStart;

    handleCloseConfirmDialog();
    setCreatingWeekStart(targetWeekStart);

    try {
      setLoadingCreate(true);

      const plan = await createRecommendMealPlan({
        startDate: targetWeekStart,
        days: 7,
        mode: "overwrite",
      });
      if (fetchWeeklyData) {
        await fetchWeeklyData();
      } else {
        const formattedMenus = {};
        plan?.dailyMenuIds.forEach((d) => {
          const dateKey = d.date;
          formattedMenus[dateKey] = (d.recipes || []).map((r) => ({
            id: r.recipeId,
            _id: r._id,
            name: r.recipeId.name,
            calories: r.recipeId.totalNutrition?.calories || 0,
            portion: r.portion || 1,
            status: r.status || "planned",
            imageUrl:
              r.recipeId.imageUrl ||
              "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
          }));
        });

        // 3) Gộp vào weekMenus theo đúng pattern bạn dùng trong saveWeekMenus
        setWeekMenus((prev) => ({
          ...prev,
          [targetWeekStart]: {
            // giữ lại nếu tuần đó đã có ngày nào đó (trường hợp backend chỉ trả một vài ngày)
            ...(prev[targetWeekStart] || {}),
            ...formattedMenus, // ghi đè các ngày mà AI vừa gợi ý
          },
        }));
      }
    } catch (error) {
      console.error("Error in handleConfirmCreateWeekPlan:", error);
      showError(error.message || "Tạo thực đơn thất bại");
    } finally {
      setLoadingCreate(false);
      setCreatingWeekStart(null); // tắt skeleton
    }
  };

  const handleClickSuggest = async (weekStart) => {
    try {
      setLoadingCreate(true);

      const status = await getWeekDailyMenuStatus({
        startDate: weekStart,
        days: 7,
      });

      // Xong check thì tắt loading để user tương tác với popup
      setLoadingCreate(false);

      if (!status.hasExisting) {
        // Tuần trống: hỏi user có chắc muốn tạo không
        handleOpenConfirmDialog(weekStart);
        return;
      }

      // Có ngày đã có menu -> popup chọn mode như cũ
      setExistingDates(status.existingDates || []);
      setPendingWeekStart(weekStart);
      setModeDialogOpen(true);
    } catch (err) {
      console.error("handleClickSuggest error:", err);
      showError(err.message || "Gợi ý thực đơn thất bại");
      setLoadingCreate(false);
    }
  };

  const handleToggleEaten = async (_id, currentStatus, weekStart, date, itemIndex) => {
    if (updatingMealIds.has(_id)) return; // Prevent double-clicking

    const newStatus = currentStatus === "eaten" ? "planned" : "eaten";

    try {
      setUpdatingMealIds((prev) => new Set(prev).add(_id));

      // Optimistic update
      setWeekMenus((prev) => {
        const updated = { ...prev };
        if (updated[weekStart] && updated[weekStart][date]) {
          updated[weekStart] = { ...updated[weekStart] };
          updated[weekStart][date] = [...updated[weekStart][date]];
          updated[weekStart][date][itemIndex] = {
            ...updated[weekStart][date][itemIndex],
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
      setWeekMenus((prev) => {
        const updated = { ...prev };
        if (updated[weekStart] && updated[weekStart][date]) {
          updated[weekStart] = { ...updated[weekStart] };
          updated[weekStart][date] = [...updated[weekStart][date]];
          updated[weekStart][date][itemIndex] = {
            ...updated[weekStart][date][itemIndex],
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
  const handleTickAll = async (weekStart, date, menuItems) => {
    const plannedItems = menuItems.filter((item) => item.status !== "eaten" && item._id);
    if (plannedItems.length === 0) {
      showError("Không có món nào cần đánh dấu");
      return;
    }

    try {
      // Update all items optimistically
      setWeekMenus((prev) => {
        const updated = { ...prev };
        if (updated[weekStart] && updated[weekStart][date]) {
          updated[weekStart] = { ...updated[weekStart] };
          updated[weekStart][date] = updated[weekStart][date].map((item) =>
            item._id && item.status !== "eaten" ? { ...item, status: "eaten" } : item
          );
        }
        return updated;
      });

      // Call API for all items
      await Promise.all(plannedItems.map((item) => updateMealStatus(item._id, "eaten")));

      showSuccess(`Đã đánh dấu ${plannedItems.length} món đã ăn`);
    } catch (error) {
      console.error("Error updating all meal statuses:", error);
      showError("Không thể cập nhật trạng thái cho tất cả món");
    }
  };

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

        // Tính tổng calo = sum(calories × portion)
        const totalWeekCal = Object.values(week)
          .flatMap((dayMeals) => dayMeals || [])
          .reduce((sum, meal) => {
            const portion = meal?.portion || 1;
            const calories = meal?.calories || 0;
            return sum + calories * portion;
          }, 0);

        const totalDishes = Object.values(week)
          .flatMap((dayMeals) => dayMeals || [])
          .filter((meal) => meal?.id).length;

        const isEditingWeek = editingWeek === start;
        const isCreatingCurrentWeek = creatingWeekStart === start && loadingCreate;

        const handleCreateMealPlan = async () => {
          try {
            await createEmptyMealPlan(start);
            showSuccess("Đã tạo thực đơn cho tuần! Những ngày đã có thực đơn sẽ được giữ nguyên.");
          } catch (err) {
            console.error(err);
            showError(err.message || "Không thể tạo thực đơn");
          }
        };

        return (
          <Paper
            key={start}
            elevation={3}
            sx={{ p: 3, pt: 2, mb: 3, borderRadius: 2, bgcolor: "background.paper" }}
          >
            {/* HEADER – luôn hiển thị, không skeleton */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Box>
                <MDTypography variant="h5">{label}</MDTypography>
                <Box display="flex" alignItems="center" gap={2}>
                  <MDTypography variant="body2" fontWeight="light" color="text" fontSize="0.9rem">
                    {start} → {weekEnd}
                  </MDTypography>
                  {totalDishes > 0 && !isCreatingCurrentWeek && (
                    <Chip
                      icon={<RestaurantIcon />}
                      label={`${totalDishes} món - ${Math.round(totalWeekCal)} kcal`}
                      sx={{
                        mt: 0,
                        bgcolor: "rgba(0,0,0,0.05)",
                        color: "text.primary",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
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
                      disabled={isCreatingCurrentWeek}
                    >
                      Tạo menu tuần
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      startIcon={<RestaurantIcon />}
                      size="small"
                      color="info"
                      onClick={() => handleClickSuggest(start)}
                      disabled={loadingCreate}
                    >
                      Gợi ý menu tuần
                    </MDButton>
                  </>
                ) : (
                  <MDButton
                    variant={isEditingWeek ? "contained" : "outlined"}
                    startIcon={<Edit />}
                    size="small"
                    color="info"
                    onClick={() => setEditingWeek(isEditingWeek ? null : start)}
                    disabled={isCreatingCurrentWeek}
                  >
                    {isEditingWeek ? "Lưu thay đổi" : "Chỉnh sửa"}
                  </MDButton>
                )}
              </Box>
            </Box>

            {/* NỘI DUNG DƯỚI – skeleton hoặc list ngày */}
            {isCreatingCurrentWeek ? (
              <>
                {/* skeleton cho 7 ngày */}
                {weekDates.map((d) => (
                  <Box key={d} mb={2}>
                    <Skeleton variant="rectangular" height={30} sx={{ mb: 1, borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={70} sx={{ borderRadius: 2 }} />
                  </Box>
                ))}
              </>
            ) : (
              <>
                {hasMealPlan &&
                  weekDates.map((date) => {
                    const dayMenu = week[date] || [];
                    const validItems = (dayMenu || []).filter(Boolean);

                    // Tính tổng calo = sum(calories × portion)
                    const dayCal = validItems.reduce((sum, item) => {
                      const portion = item.portion || 1;
                      const calories = item.calories || 0;
                      return sum + calories * portion;
                    }, 0);

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
                              <Box display="flex" gap={1} alignItems="center">
                                {canTickForDate(date) && (
                                  <MDButton
                                    variant="outlined"
                                    color="success"
                                    size="small"
                                    onClick={() => handleTickAll(start, date, validItems)}
                                    disabled={updatingMealIds.size > 0}
                                  >
                                    Đánh dấu tất cả
                                  </MDButton>
                                )}
                                <MDButton
                                  variant="outlined"
                                  startIcon={<Edit />}
                                  size="small"
                                  color="info"
                                  onClick={() =>
                                    handleOpenModal({
                                      date,
                                      weekStart: start,
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
                              {validItems.map((item, idx) => {
                                const portion = item.portion || 1;
                                const itemCalories = item.calories || 0;
                                const totalCalories = itemCalories * portion;
                                const imageUrl =
                                  item.imageUrl ||
                                  "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg";
                                const name = item.name || "Unknown";
                                const isEaten = item.status === "eaten";
                                const _id = item._id;
                                const isUpdating = _id && updatingMealIds.has(_id);

                                return (
                                  <Grid item xs={12} sm={6} md={3} key={item._id || idx}>
                                    <Box sx={{ position: "relative" }}>
                                      <FoodCard
                                        title={name}
                                        calories={totalCalories}
                                        imageUrl={imageUrl}
                                      />
                                      {/* Tickbox góc dưới bên phải - chỉ hiển thị nếu ngày trong phạm vi cho phép */}
                                      {_id && canTickForDate(date) && (
                                        <Box
                                          sx={{
                                            position: "absolute",
                                            bottom: 8,
                                            right: 8,
                                            zIndex: 10,
                                          }}
                                        >
                                          <Tooltip
                                            title={isEaten ? "Bỏ đánh dấu đã ăn" : "Đánh dấu đã ăn"}
                                          >
                                            <IconButton
                                              onClick={() =>
                                                handleToggleEaten(
                                                  _id,
                                                  item.status || "planned",
                                                  start,
                                                  date,
                                                  idx
                                                )
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
                                                <CheckCircle
                                                  sx={{ color: "success.main", fontSize: 28 }}
                                                />
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

                {!hasMealPlan && (
                  <Box p={2} textAlign="center">
                    <MDTypography variant="body2" color="text" fontWeight="light">
                      Chưa có thực đơn cho tuần này
                    </MDTypography>
                  </Box>
                )}
              </>
            )}
          </Paper>
        );
      })}

      <Dialog open={modeDialogOpen} onClose={() => handleCloseModeDialog(false)}>
        <DialogTitle>Đã có thực đơn trong tuần này</DialogTitle>
        <DialogContent dividers>
          <p>Trong tuần này, một số ngày đã được tạo thực đơn.</p>
          <p>Bạn muốn xử lý các ngày này như thế nào?</p>
        </DialogContent>
        <DialogActions>
          <MDButton
            color="secondary"
            variant="outlined"
            onClick={() => handleCloseModeDialog()}
            disabled={loadingCreate}
          >
            Hủy
          </MDButton>

          <MDButton
            color="info"
            variant="outlined"
            onClick={() => handleSelectMode("reuse")}
            disabled={loadingCreate}
          >
            Giữ thực đơn cũ
          </MDButton>
          <MDButton
            variant="contained"
            color="info"
            onClick={() => handleSelectMode("overwrite")}
            disabled={loadingCreate}
          >
            Ghi đè thực đơn
          </MDButton>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Xác nhận tạo thực đơn</DialogTitle>
        <DialogContent dividers>
          <MDTypography mb={1}>Bạn có chắc chắn muốn để hệ thống gợi ý thực đơn?</MDTypography>
          <MDTypography variant="body2" color="text" mb={5}>
            Thực đơn sẽ được tạo tự động cho 7 ngày trong tuần này.
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
            onClick={handleConfirmCreateWeekPlan}
            disabled={loadingCreate}
          >
            Đồng ý
          </MDButton>
        </DialogActions>
      </Dialog>
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
  fetchWeeklyData: PropTypes.func,
};

export default WeekMenu;
