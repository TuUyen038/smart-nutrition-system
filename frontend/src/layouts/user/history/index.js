import React, { use, useEffect, useState } from "react";
import { Box, Grid, Divider, Typography, IconButton, Tooltip } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DefaultFoodCard from "examples/Cards/FoodCards/DefaultFoodCard";
import CustomList from "components/CustomList";
import { getRecipesByDateAndStatus } from "services/dailyMenuApi";
import { findRecipeById } from "services/recipeApi";
import { toggleFavorite, checkFavorite } from "services/favoriteApi";
import { useNavigate } from "react-router-dom";
import MDButton from "components/MDButton";
import { useToast } from "context/ToastContext";

function FoodHistory() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteStatuses, setFavoriteStatuses] = useState({}); // { recipeId: boolean }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getRecipesByDateAndStatus(
          new Date("2025-11-01"),
          new Date("2025-11-04"),
          "eaten"
        );
        setHistoryData(data);

        // Check favorite status cho tất cả recipes
        const recipeIds = data.flatMap((day) =>
          day.recipes.map((item) => item.recipeId?._id || item.recipeId)
        ).filter(Boolean);

        const statuses = {};
        for (const recipeId of recipeIds) {
          try {
            const isFav = await checkFavorite(recipeId);
            statuses[recipeId] = isFav;
          } catch (err) {
            console.error(`Error checking favorite for ${recipeId}:`, err);
            statuses[recipeId] = false;
          }
        }
        setFavoriteStatuses(statuses);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const goToDetail = (id) => {
    navigate(`/recipes/${id}`);
  };

  const handleToggleFavorite = async (recipeId, e) => {
    e.stopPropagation(); // Ngăn chặn event bubble lên parent
    try {
      const result = await toggleFavorite(recipeId);
      if (result.success) {
        // Update local state
        setFavoriteStatuses((prev) => ({
          ...prev,
          [recipeId]: result.isFavorite,
        }));

        if (result.isFavorite) {
          showSuccess("Đã thêm vào danh sách yêu thích");
        } else {
          showSuccess("Đã xóa khỏi danh sách yêu thích");
        }
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);
      showError(err.message || "Không thể thay đổi trạng thái yêu thích");
    }
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box pt={2}>
        {isLoading && (
          <Typography variant="button" color="text" sx={{ whiteSpace: "nowrap" }}>
            Loading...
          </Typography>
        )}

        {!isLoading && historyData.length === 0 && (
          <Typography variant="button" color="text" sx={{ whiteSpace: "nowrap" }}>
            Chưa có dữ liệu
          </Typography>
        )}

        {!isLoading &&
          historyData.length > 0 &&
          historyData.map((day) => (
            <Box key={day.date} mb={2}>
              {/* Tiêu đề ngày */}
              <MDBox display="flex" alignItems="center" gap={2} mb={1}>
                <MDTypography variant="button" color="text" sx={{ whiteSpace: "nowrap" }}>
                  {new Date(day.date).toLocaleDateString("vi-VN")}
                </MDTypography>
                <Divider sx={{ flexGrow: 1 }} />
              </MDBox>

              {/* Danh sách món ăn */}
              <CustomList
                items={day.recipes}
                renderItem={(item) => {
                  const recipeId = item.recipeId?._id || item.recipeId;
                  const isFavorite = favoriteStatuses[recipeId] || false;

                  return (
                    <Box sx={{ mb: 1, position: "relative" }}>
                      <DefaultFoodCard
                        image={item.imageUrl}
                        label={`${item.totalNutrition.calories} kcal`}
                        title={item.name}
                        description={item.description}
                        action={{ onClick: () => goToDetail(recipeId) }}
                      >
                        {/* Nút Favorite */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 10,
                          }}
                        >
                          <Tooltip title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}>
                            <IconButton
                              onClick={(e) => handleToggleFavorite(recipeId, e)}
                              sx={{
                                bgcolor: "rgba(255, 255, 255, 0.9)",
                                "&:hover": {
                                  bgcolor: "rgba(255, 255, 255, 1)",
                                },
                              }}
                              size="small"
                            >
                              {isFavorite ? (
                                <FavoriteIcon sx={{ color: "error.main" }} />
                              ) : (
                                <FavoriteBorderIcon sx={{ color: "text.secondary" }} />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </DefaultFoodCard>
                    </Box>
                  );
                }}
              />
            </Box>
          ))}
      </Box>
    </DashboardLayout>
  );
}

export default FoodHistory;
