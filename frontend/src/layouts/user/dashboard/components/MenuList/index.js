import React, { useEffect, useState } from "react";
import { Grid, Card, Box, IconButton, Typography, Divider } from "@mui/material";
import MDTypography from "components/MDTypography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { getRecipesByDateAndStatus, updateMealStatus } from "services/dailyMenuApi";
import { useToast } from "context/ToastContext";

const myId = "68f4394c4d4cc568e6bc5daa";

const MenuList = () => {
  const { showSuccess, showError } = useToast();
  const [foodData, setFoodData] = useState([]);
  const [updatingMealIds, setUpdatingMealIds] = useState(new Set()); // Track meals being updated

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRecipesByDateAndStatus(new Date(), new Date(), undefined);

        // Flatten recipes và thêm property 'eaten'
        const flatData = data.flatMap((dailyMenu) =>
          dailyMenu.recipes.map((r) => ({
            id: r.recipeId?._id || r.recipeId, // Recipe ID
            mealId: r._id, // Meal ID để update status - từ backend service đã trả về
            name: r.name,
            calories: r.totalNutrition?.calories || 0,
            protein: r.totalNutrition?.protein || 0,
            eaten: r.status === "eaten" || false, // mặc định false
            image: r.imageUrl || "",
          }))
        );

        setFoodData(flatData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleToggleEaten = async (mealId, currentStatus) => {
    if (!mealId) {
      console.error("mealId is missing. Available data:", foodData);
      showError("Không tìm thấy ID món ăn. Vui lòng thử lại.");
      return;
    }

    // Chặn double click - nếu đang update thì bỏ qua
    if (updatingMealIds.has(mealId)) {
      return;
    }

    const newStatus = currentStatus === "eaten" ? "planned" : "eaten";

    // Đánh dấu đang update
    setUpdatingMealIds((prev) => new Set(prev).add(mealId));

    try {
      // Optimistic update - cập nhật UI ngay
      setFoodData((prev) =>
        prev.map((item) =>
          item.mealId === mealId ? { ...item, eaten: newStatus === "eaten" } : item
        )
      );

      // Gọi API để cập nhật status
      await updateMealStatus(mealId, newStatus);

      showSuccess(newStatus === "eaten" ? "Đã đánh dấu món ăn đã ăn" : "Đã bỏ đánh dấu món ăn");
    } catch (error) {
      // Rollback nếu có lỗi
      setFoodData((prev) =>
        prev.map((item) =>
          item.mealId === mealId ? { ...item, eaten: currentStatus === "eaten" } : item
        )
      );
      showError(error.message || "Không thể cập nhật trạng thái món ăn");
    } finally {
      // Xóa khỏi danh sách đang update
      setUpdatingMealIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(mealId);
        return newSet;
      });
    }
  };

  // Tính toán tiến độ kcal
  const totalCalories = foodData.reduce((sum, m) => sum + m.calories, 0);
  const eatenCalories = foodData.filter((m) => m.eaten).reduce((sum, m) => sum + m.calories, 0);
  const progress = totalCalories ? Math.round((eatenCalories / totalCalories) * 100) : 0;

  return (
    <Box>
      {/* Thanh tiến độ tổng */}
      <Box sx={{ position: "relative", mb: 1 }}>
        <Box
          sx={{
            height: 12,
            borderRadius: 5,
            bgcolor: "#f0f0f0",
            overflow: "hidden",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          <Box
            sx={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: 5,
              background: "linear-gradient(90deg, #4caf50 0%, #81c784 100%)",
              transition: "width 0.4s ease",
            }}
          />
        </Box>
      </Box>

      <MDTypography variant="button" color="text" mb={2} display="block">
        Đã nạp {eatenCalories} / {totalCalories} kcal ({progress}%)
      </MDTypography>

      {/* Danh sách món ăn đã được sửa lỗi tràn */}
      <Grid container spacing={1}>
        {foodData.map((meal) => (
          <Grid item xs={12} md={6} lg={4} key={meal.id}>
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1.5,
                borderRadius: 3,
                boxShadow: meal.eaten ? 2 : 1,
                bgcolor: meal.eaten ? "action.selected" : "background.paper",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: 3,
                  transform: "translateY(-2px)",
                },
              }}
            >
              {/* Box 1: Container chứa nội dung (Text + Image/Icon nếu có) */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexGrow: 1,
                  gap: 1.5,
                  minWidth: 0, // Đảm bảo Box này co lại trong Card
                }}
              >
                {/* Box 2: Container chứa các dòng Typography. Đây là Flex Item quan trọng. */}
                <Box
                  sx={{
                    minWidth: 0,
                    flex: 1, // Cho phép Box co lại, giải quyết lỗi tràn text
                  }}
                >
                  {/* Tên món: 1 dòng, overflow -> ... */}
                  <MDTypography
                    variant="h6"
                    color="dark"
                    mb={0.5}
                    noWrap // Cách chuẩn của MUI/Component Typography
                  >
                    {meal.name}
                  </MDTypography>

                  {/* Mô tả / bữa: 1 dòng, overflow -> ... */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis", // CSS thủ công
                    }}
                  >
                    Bữa sáng
                  </Typography>

                  {/* Thông tin dinh dưỡng */}
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                    {meal.calories} kcal • {meal.protein}g protein
                  </Typography>
                </Box>
              </Box>

              {/* IconButton luôn giữ nguyên kích thước */}
              <IconButton
                onClick={() => handleToggleEaten(meal.mealId, meal.eaten ? "eaten" : "planned")}
                disabled={updatingMealIds.has(meal.mealId)}
                color={meal.eaten ? "success" : "default"}
                sx={{
                  ml: 1,
                  transition: "0.2s",
                  "&:hover": {
                    color: meal.eaten ? "success.dark" : "primary.main",
                  },
                  "&:disabled": {
                    opacity: 0.6,
                    cursor: "not-allowed",
                  },
                }}
              >
                {meal.eaten ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
              </IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MenuList;
