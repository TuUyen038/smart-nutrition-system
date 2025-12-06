import React from "react";
import { Box, Typography, Tooltip, LinearProgress, Divider } from "@mui/material";
import PropTypes from "prop-types";

// 🎨 Bảng màu tối ưu theo UX
const COLOR_PALETTE = {
  MEAL: "#4caf50", // xanh lá tươi hơn, dễ nhìn
  DISH: "#ffb300", // vàng ấm
  OVER_WARNING: "#f44336", // đỏ nổi bật
  BACKGROUND: "#f1f3f4", // nền xám sáng
};

// 📊 Component hiển thị tiến trình dinh dưỡng
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
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 2,
        borderRadius: 3,
        bgcolor: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="600"
        color="text.primary"
        sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1 }}
      >
        Phân tích dinh dưỡng
      </Typography>

      <Divider sx={{ mb: 1 }} />

      {Object.keys(nutritionLabels).map((key, idx) => {
        const mealValue = mealNutrition[key] || 0;
        const dishValue = totalNutrition[key] || 0;
        const recommended = recommendedNutrition[key] || 100;
        const total = mealValue + dishValue;
        const over = total > recommended;

        const totalPercent = (total / recommended) * 100;
        const mealPercent = (mealValue / recommended) * 100;
        const dishPercent = (dishValue / recommended) * 100;

        const displayMealPercent = Math.min(mealPercent, 100);
        const displayDishPercent = Math.min(dishPercent, 100 - displayMealPercent);

        return (
          <Box key={key} sx={{ mb: 1.5 }}>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: over ? COLOR_PALETTE.OVER_WARNING : "text.primary",
                }}
              >
                {nutritionLabels[key]}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  color: over ? COLOR_PALETTE.OVER_WARNING : "text.secondary",
                }}
              >
                {total.toFixed(total % 1 !== 0 ? 1 : 0)} {over && "⚠️"}
              </Typography>
            </Box>

            {/* Sub info */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "text.secondary",
                mb: 0.5,
              }}
            >
              <Typography variant="caption">
                Khuyến nghị: {recommended.toFixed(recommended % 1 !== 0 ? 1 : 0)}
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                Đạt: {Math.min(totalPercent, 100).toFixed(0)}%
              </Typography>
            </Box>

            {/* Thanh tiến trình */}
            <Box
              sx={{
                position: "relative",
                height: 12,
                borderRadius: 6,
                bgcolor: COLOR_PALETTE.BACKGROUND,
                overflow: "hidden",
                boxShadow: over
                  ? `inset 0 0 0 2px ${COLOR_PALETTE.OVER_WARNING}`
                  : "inset 0 0 0 1px rgba(0,0,0,0.05)",
              }}
            >
              {/* Meal */}
              {displayMealPercent > 0 && (
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
                    }}
                  />
                </Tooltip>
              )}

              {/* Dish */}
              {displayDishPercent > 0 && (
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
                    }}
                  />
                </Tooltip>
              )}

              {/* Vạch cảnh báo */}
              {totalPercent > 100 && (
                <Tooltip title={`Vượt quá ${Math.round(totalPercent - 100)}%`} placement="top">
                  <Box
                    sx={{
                      position: "absolute",
                      left: "100%",
                      top: 0,
                      height: "100%",
                      width: "4px",
                      bgcolor: COLOR_PALETTE.OVER_WARNING,
                      transform: "translateX(-2px)",
                    }}
                  />
                </Tooltip>
              )}
            </Box>

            {/* Chia nhóm cách nhau nhẹ */}
            {idx !== Object.keys(nutritionLabels).length - 1 && (
              <Divider sx={{ mt: 1.5, opacity: 0.3 }} />
            )}
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
