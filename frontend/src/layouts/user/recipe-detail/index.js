import React, { useEffect, useState } from "react";
import { Box, Grid, Divider, Typography, Card, Chip, Breadcrumbs, IconButton, Tooltip } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import BigFoodCard from "examples/Cards/FoodCards/BigFoodCard";
import CustomList from "components/CustomList";
import { findRecipeById } from "services/recipeApi";
import { toggleFavorite, checkFavorite } from "services/favoriteApi";
import { useParams } from "react-router-dom";
import { useToast } from "context/ToastContext";
import MDButton from "components/MDButton";

function RecipeDetail() {
  const { id } = useParams();
  const { showSuccess, showError } = useToast();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await findRecipeById(id);
        setRecipe(data);

        // Check favorite status
        try {
          const favoriteStatus = await checkFavorite(id);
          setIsFavorite(favoriteStatus);
        } catch (err) {
          console.error("Error checking favorite:", err);
          setIsFavorite(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (isTogglingFavorite) return;

    try {
      setIsTogglingFavorite(true);
      const result = await toggleFavorite(id);
      if (result.success) {
        setIsFavorite(result.isFavorite);
        if (result.isFavorite) {
          showSuccess("Đã thêm vào danh sách yêu thích");
        } else {
          showSuccess("Đã xóa khỏi danh sách yêu thích");
        }
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);
      showError(err.message || "Không thể thay đổi trạng thái yêu thích");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  if (isLoading) return <DashboardLayout><DashboardNavbar /><Box p={2}>Loading...</Box></DashboardLayout>;
  if (!recipe) return <DashboardLayout><DashboardNavbar /><Box p={2}>Không tìm thấy món ăn</Box></DashboardLayout>;

  const { name, imageUrl, description, ingredients = [], instructions = [], totalNutrition = {}, servings = 1 } = recipe;

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Box pt={2} px={3}>
        {/* Header với nút Favorite */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h4" fontWeight="bold">
            {name || "Chi tiết món ăn"}
          </MDTypography>
          <Tooltip title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}>
            <MDButton
              variant={isFavorite ? "contained" : "outlined"}
              color="error"
              startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
            >
              {isFavorite ? "Đã yêu thích" : "Yêu thích"}
            </MDButton>
          </Tooltip>
        </MDBox>

        {/* Tên + hình + mô tả */}
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <Box sx={{ position: "relative" }}>
              <BigFoodCard
                image={imageUrl || ""}
                label={`${totalNutrition?.calories || 0} kcal`}
                title={name || "Không có tên"}
                description={description || ""}
              />
              {/* Nút Favorite trên ảnh (optional - có thể bỏ nếu đã có ở header) */}
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
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 1)",
                      },
                    }}
                    size="large"
                  >
                    {isFavorite ? (
                      <FavoriteIcon sx={{ color: "error.main", fontSize: 32 }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ color: "text.secondary", fontSize: 32 }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            {/* Tổng quan dinh dưỡng */}
            <Card p={2}>
              <MDBox mb={3} px={2} pt={2}>
                <MDTypography variant="h6">Thông tin dinh dưỡng</MDTypography>
                <Divider sx={{ mb: 1 }} />
                <Grid container spacing={1}>
                  {totalNutrition && Object.entries(totalNutrition).map(([key, value]) => (
                    <Grid item xs={6} sm={4} md={3} key={key}>
                      <MDTypography variant="button" color="text">
                        {key.charAt(0).toUpperCase() + key.slice(1)}: {value?.toFixed?.(1) || value}
                      </MDTypography>
                    </Grid>
                  ))}
                  <Grid item xs={6}>
                    <MDTypography variant="button" color="text">Servings: {servings}</MDTypography>
                  </Grid>
                </Grid>
              </MDBox>

              {/* Nguyên liệu */}
              <MDBox mb={3}  px={2}>
                <MDTypography variant="h6">Nguyên liệu</MDTypography>
                <Divider sx={{ mb: 1 }} />
                  <Grid container spacing={2}>
                    {ingredients.length > 0 ? (
                      ingredients.map((item, index) => (
                        <Grid item xs={6} key={index}>
                          <MDTypography variant="button" color="text">
                            {item.name || "Nguyên liệu"} {item.quantity?.amount ? `${item.quantity.amount} ${item.quantity.unit || "g"}` : item.quantity || ""}
                          </MDTypography>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <MDTypography variant="caption" color="text">
                          Chưa có thông tin nguyên liệu
                        </MDTypography>
                      </Grid>
                    )}
                  </Grid>  
              </MDBox>

              {/* Hướng dẫn */}
              <MDBox mb={3}  px={2}>
                <MDTypography variant="h6">Công thức nấu</MDTypography>
                <Divider sx={{ mb: 1 }} />
                  <Grid container spacing={2}>
                    {instructions.map((item, index) => (
                      <Grid item xs={12} key={index}>
                        <MDTypography variant="button" color="text">
                          {item}
                        </MDTypography>
                      </Grid>
                    ))}
                  </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}

export default RecipeDetail;
