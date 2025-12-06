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
} from "@mui/material";
import { Edit, Restaurant as RestaurantIcon } from "@mui/icons-material";
import MDButton from "components/MDButton";
import FoodCard from "./FoodCard";
import MDTypography from "components/MDTypography";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { createMealPlan } from "services/mealPlanApi";
import { createRecommendMealPlan, getWeekDailyMenuStatus } from "services/mealPlanApi";

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

  const [modeDialogOpen, setModeDialogOpen] = useState(false);
  const [pendingWeekStart, setPendingWeekStart] = useState(null); // start date tuần đang chọn
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [existingDates, setExistingDates] = useState([]); // các ngày đã có DailyMenu trong tuần
  const [editingWeek, setEditingWeek] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmWeekStart, setConfirmWeekStart] = useState(null);
  // tuần đang show skeleton
  const [creatingWeekStart, setCreatingWeekStart] = useState(null);

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

    // đóng popup chọn mode, show skeleton cho tuần đang xử lý
    handleCloseModeDialog(true); // force đóng, không bị chặn bởi loadingCreate
    setCreatingWeekStart(targetWeekStart);

    try {
      setLoadingCreate(true);

      const plan = await createRecommendMealPlan({
        startDate: targetWeekStart,
        days: 7,
        mode, // "reuse" hoặc "overwrite"
      });

      const formattedMenus = {};
      plan?.dailyMenuIds?.forEach((d) => {
        const dateKey = d.date; // "yyyy-mm-dd"
        formattedMenus[dateKey] = (d.recipes || []).map((r) => ({
          id: r.recipeId?._id,
          name: r.recipeId.name,
          calories: r.recipeId.totalNutrition?.calories || 0,
          image:
            r.recipeId.imageUrl ||
            "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
        }));
      });

      setWeekMenus((prev) => ({
        ...prev,
        [targetWeekStart]: {
          ...(prev[targetWeekStart] || {}),
          ...formattedMenus, // ghi đè các ngày mà AI gợi ý
        },
      }));
    } catch (err) {
      console.error("Create daily meal plan error:", err);
      alert(err.message || "Tạo thực đơn thất bại");
    } finally {
      setLoadingCreate(false);
      setCreatingWeekStart(null); // tắt skeleton
    }
  };

  const handleConfirmCreateWeekPlan = async () => {
    if (!confirmWeekStart) return;

    const targetWeekStart = confirmWeekStart;

    // đóng popup xác nhận, show skeleton ngoài tuần
    handleCloseConfirmDialog();
    setCreatingWeekStart(targetWeekStart);

    try {
      setLoadingCreate(true);

      const plan = await createRecommendMealPlan({
        startDate: targetWeekStart,
        days: 7,
        mode: "overwrite",
      });

      console.log("✅ Weekly plan created:", plan);

      // ------- CHUYỂN RESPONSE -> DỮ LIỆU weekMenus -------
      const formattedMenus = {};
      plan?.dailyMenuIds.forEach((d) => {
        const dateKey = d.date; // đảm bảo là "yyyy-mm-dd"
        formattedMenus[dateKey] = (d.recipes || []).map((r) => ({
          id: r.recipeId._id,
          name: r.recipeId.name,
          calories: r.recipeId.totalNutrition?.calories || 0,
          image:
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
    } catch (error) {
      console.error("❌ Error in handleConfirmCreateWeekPlan:", error);
      alert(error.message || "Tạo thực đơn thất bại");
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
      alert(err.message || "Gợi ý thực đơn thất bại");
      setLoadingCreate(false);
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

        const totalWeekCal = Object.values(week)
          .flatMap((dayMeals) => dayMeals || [])
          .reduce((sum, meal) => sum + (meal?.calories || 0), 0);

        const totalDishes = Object.values(week)
          .flatMap((dayMeals) => dayMeals || [])
          .filter((meal) => meal?.id).length;

        const isEditingWeek = editingWeek === start;
        const isCreatingCurrentWeek = creatingWeekStart === start && loadingCreate;

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

                    const dayCal = validItems.reduce((sum, item) => sum + (item.calories || 0), 0);

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
                                const calories = item.calories || 0;
                                const imageUrl =
                                  item.image ||
                                  "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg";
                                const name = item.name || "Unknown";

                                return (
                                  <Grid item xs={12} sm={6} md={3} key={item._id || idx}>
                                    <FoodCard title={name} calories={calories} image={imageUrl} />
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
          <MDButton color="secondary"
            variant="outlined" onClick={() => handleCloseModeDialog()} disabled={loadingCreate}>
            Hủy
          </MDButton>

          <MDButton color="info"
            variant="outlined" onClick={() => handleSelectMode("reuse")} disabled={loadingCreate}>
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
};

export default WeekMenu;
