import React from "react";
import { Box, Typography, Tooltip, LinearProgress } from "@mui/material";
import PropTypes from "prop-types";

// Bảng màu mới
const COLOR_PALETTE = {
  MEAL: "#5cb85c", // Xanh lá đậm cho phần đã ăn
  DISH: "#ffc107", // Vàng đậm cho phần món ăn bổ sung
  OVER_WARNING: "#d9534f", // Đỏ cảnh báo cho phần vượt quá
  BACKGROUND: "#e9ecef", // Nền xám nhạt cho thanh tiến trình
};

const NutritionProgress = ({ totalNutrition, mealNutrition, recommendedNutrition }) => {
  const nutritionLabels = {
    calories: "Năng lượng (kcal)",
    protein: "Protein (g)",
    fat: "Chất béo (g)",
    carbs: "Carbohydrate (g)",
    fiber: "Chất xơ (g)",
    sugar: "Đường (g)",
    sodium: "Natri (mg)",
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
      {Object.keys(nutritionLabels).map((key) => {
        const mealValue = mealNutrition[key] || 0;
        const dishValue = totalNutrition[key] || 0;
        const recommended = recommendedNutrition[key] || 100;
        const total = mealValue + dishValue;
        const over = total > recommended;

        // Tính phần trăm so với mức khuyến nghị (không giới hạn ở 100% cho việc tính toán)
        const totalPercent = (total / recommended) * 100;
        const mealPercent = (mealValue / recommended) * 100;
        const dishPercent = (dishValue / recommended) * 100;

        // Phần hiển thị trên thanh tiến trình (giới hạn ở 100% để thanh không tràn)
        const displayMealPercent = Math.min(mealPercent, 100);
        const displayDishPercent = Math.min(dishPercent, 100 - displayMealPercent);

        return (
          <Box key={key}>
            {/* Dòng 1: Tên dinh dưỡng và tổng giá trị */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography
                variant="body1"
                sx={{ color: over ? COLOR_PALETTE.OVER_WARNING : "text.primary" }}
              >
                {nutritionLabels[key]}
              </Typography>
              <Typography
                variant="body1"
                fontWeight={over ? 600 : 500}
                sx={{ color: over ? COLOR_PALETTE.OVER_WARNING : "text.primary" }}
              >
                **{total.toFixed(total % 1 !== 0 ? 1 : 0)}** {over && "⚠️"}
              </Typography>
            </Box>

            {/* Dòng 2: Mức khuyến nghị và phần trăm đạt được */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
                color: "text.secondary",
              }}
            >
              <Typography variant="caption">
                Khuyến nghị: {recommended.toFixed(recommended % 1 !== 0 ? 1 : 0)}
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                Đã đạt: {Math.min(totalPercent, 100).toFixed(0)}%
              </Typography>
            </Box>

            {/* Thanh tiến trình */}
            <Box
              sx={{
                position: "relative",
                height: 14, // Tăng chiều cao
                borderRadius: 7, // Bo tròn góc nhiều hơn
                bgcolor: COLOR_PALETTE.BACKGROUND,
                overflow: "hidden",
                border:
                  over && totalPercent > 100 ? `2px solid ${COLOR_PALETTE.OVER_WARNING}` : "none", // Viền cảnh báo khi vượt
              }}
            >
              {/* Meal part (Đã có) */}
              <Tooltip title={`Đã có: ${mealValue.toFixed(1)}`} placement="top">
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${displayMealPercent}%`,
                    bgcolor: COLOR_PALETTE.MEAL,
                    transition: "width 0.6s ease",
                    borderTopLeftRadius: 7,
                    borderBottomLeftRadius: 7,
                  }}
                />
              </Tooltip>

              {/* Dish part (Món ăn bổ sung) */}
              <Tooltip title={`Món ăn bổ sung: ${dishValue.toFixed(1)}`} placement="top">
                <Box
                  sx={{
                    position: "absolute",
                    left: `${displayMealPercent}%`,
                    top: 0,
                    height: "100%",
                    width: `${displayDishPercent}%`,
                    bgcolor: COLOR_PALETTE.DISH,
                    transition: "width 0.6s ease",
                    // Chỉ bo tròn góc bên phải nếu đây là phần cuối cùng và chưa vượt quá
                    ...(displayMealPercent + displayDishPercent === 100 &&
                      !over && {
                        borderTopRightRadius: 7,
                        borderBottomRightRadius: 7,
                      }),
                  }}
                />
              </Tooltip>
              {/* Vạch báo vượt quá 100% (Optional: Có thể dùng vạch đứng) */}
              {totalPercent > 100 && (
                <Tooltip title={`Vượt quá: ${(total - recommended).toFixed(1)}`} placement="top">
                  <Box
                    sx={{
                      position: "absolute",
                      left: "100%",
                      top: 0,
                      height: "100%",
                      width: "4px", // Vạch báo nhỏ
                      bgcolor: COLOR_PALETTE.OVER_WARNING,
                      transform: "translateX(-2px)", // Căn giữa vạch
                      zIndex: 1,
                    }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

NutritionProgress.propTypes = {
  totalNutrition: PropTypes.object.isRequired,
  mealNutrition: PropTypes.object.isRequired,
  recommendedNutrition: PropTypes.object.isRequired,
};

export default NutritionProgress;
