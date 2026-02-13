import React, { use, useEffect, useState } from "react";
import { Box, Grid, Divider, Typography, IconButton, Tooltip, Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DefaultFoodCard from "examples/Cards/FoodCards/DefaultFoodCard";
import CustomList from "components/CustomList";
import { getRecipesByDateAndStatus } from "services/dailyMenuApi";
import { findRecipeById } from "services/recipeApi";
import { toggleFavorite, checkFavorite } from "services/favoriteApi";
import { getUser } from "services/authApi";
import { useNavigate } from "react-router-dom";
import MDButton from "components/MDButton";
import { useToast } from "context/ToastContext";

function FoodHistory() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteStatuses, setFavoriteStatuses] = useState({}); // { recipeId: boolean }
  
  // Pagination state: track current 7-day window
  const [currentEndDate, setCurrentEndDate] = useState(new Date()); // Mặc định là hôm nay
  const DAYS_PER_PAGE = 7;

  // Calculate start date based on current end date
  const getStartDate = (endDate) => {
    const start = new Date(endDate);
    start.setDate(start.getDate() - (DAYS_PER_PAGE - 1)); // 7 ngày: từ start đến end (inclusive)
    return start;
  };

  const fetchData = async (endDate) => {
    setIsLoading(true);
    try {
      // Lấy userId từ user hiện tại
      const user = getUser();
      if (!user || (!user._id && !user.id)) {
        showError("Vui lòng đăng nhập để xem lịch sử món ăn");
        setIsLoading(false);
        return;
      }
      const userId = user._id || user.id;

      // Tính startDate: 7 ngày trước endDate (inclusive)
      const startDate = getStartDate(endDate);

      const data = await getRecipesByDateAndStatus(
        startDate,
        endDate,
        "eaten"
      );
      
      // Chỉ lấy những ngày có thực đơn (có recipes)
      const filteredData = Array.isArray(data)
        ? data.filter((day) => {
            // Kiểm tra xem ngày có recipes không và recipes có dữ liệu không
            return (
              day.recipes &&
              Array.isArray(day.recipes) &&
              day.recipes.length > 0
            );
          })
        : [];
      
      setHistoryData(filteredData);

      // Check favorite status cho tất cả recipes - tối ưu bằng Promise.all
      const recipeIds = filteredData.flatMap((day) =>
        day.recipes.map((item) => item.recipeId?._id || item.recipeId)
      ).filter(Boolean);

      // Tối ưu: check tất cả favorites song song thay vì tuần tự
      const favoriteChecks = await Promise.all(
        recipeIds.map(async (recipeId) => {
          try {
            const isFav = await checkFavorite(recipeId);
            return { recipeId, isFav };
          } catch (err) {
            console.error(`Error checking favorite for ${recipeId}:`, err);
            return { recipeId, isFav: false };
          }
        })
      );

      const statuses = {};
      favoriteChecks.forEach(({ recipeId, isFav }) => {
        statuses[recipeId] = isFav;
      });
      setFavoriteStatuses(statuses);
    } catch (err) {
      console.error(err);
      showError("Không thể tải lịch sử món ăn");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentEndDate);
  }, [currentEndDate]);

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

  // Pagination handlers
  const handlePrevious = () => {
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() - DAYS_PER_PAGE);
    setCurrentEndDate(newEndDate);
  };

  const handleNext = () => {
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + DAYS_PER_PAGE);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // Không cho phép đi đến tương lai
    if (newEndDate > today) {
      setCurrentEndDate(today);
    } else {
      setCurrentEndDate(newEndDate);
    }
  };

  const handleGoToToday = () => {
    setCurrentEndDate(new Date());
  };

  // Calculate date range for display
  const startDate = getStartDate(currentEndDate);
  const endDate = new Date(currentEndDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isAtToday = endDate >= today;

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
          historyData
            .filter((day) => day.recipes && Array.isArray(day.recipes) && day.recipes.length > 0)
            .map((day) => (
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
                        {/* Nút Favorite góc dưới bên phải */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 8,
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

        {/* Pagination Controls - ở cuối trang */}
        {!isLoading && (
          <MDBox
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={4}
            mb={2}
            px={2}
            sx={{
              borderTop: "1px solid rgba(0, 0, 0, 0.12)",
              pt: 3,
            }}
          >
            <MDButton
              variant="contained"
              color="info"
              startIcon={<ChevronLeftIcon />}
              onClick={handlePrevious}
              disabled={isLoading}
              sx={{ minWidth: 120, fontWeight: "medium" }}
            >
              Trước
            </MDButton>

            <MDBox display="flex" alignItems="center" gap={2} flexDirection="column">
              <MDTypography variant="body1" color="text" fontWeight="medium">
                {startDate.toLocaleDateString("vi-VN")} - {endDate.toLocaleDateString("vi-VN")}
              </MDTypography>
              {!isAtToday && (
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={handleGoToToday}
                  disabled={isLoading}
                  sx={{ fontWeight: "medium" }}
                >
                  Về hôm nay
                </MDButton>
              )}
            </MDBox>

            <MDButton
              variant="contained"
              color="info"
              endIcon={<ChevronRightIcon />}
              onClick={handleNext}
              disabled={isLoading || isAtToday}
              sx={{ minWidth: 120, fontWeight: "medium" }}
            >
              Sau
            </MDButton>
          </MDBox>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default FoodHistory;
