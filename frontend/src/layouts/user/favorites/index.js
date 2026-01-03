import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Pagination,
  Alert,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { getFavoriteRecipes, toggleFavorite } from "services/favoriteApi";
import { useToast } from "context/ToastContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// Component FoodCard đơn giản để hiển thị recipe
function RecipeCard({ recipe, onToggleFavorite, isFavorite }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/recipe-detail/${recipe._id}`);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
      onClick={handleCardClick}
    >
      {/* Image */}
      <Box
        sx={{
          width: "100%",
          height: 200,
          backgroundImage: `url(${
            recipe.imageUrl ||
            recipe.image ||
            "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {/* Favorite Button */}
        <MDButton
          variant="contained"
          color="error"
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            minWidth: "auto",
            width: 40,
            height: 40,
            borderRadius: "50%",
            padding: 0,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe._id);
          }}
        >
          {isFavorite ? (
            <FavoriteIcon fontSize="small" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </MDButton>
      </Box>

      {/* Content */}
      <Box p={2}>
        <MDTypography variant="h6" fontWeight="bold" mb={1} noWrap>
          {recipe.name}
        </MDTypography>
        {recipe.description && (
          <MDTypography variant="body2" color="text" mb={1} noWrap>
            {recipe.description}
          </MDTypography>
        )}
        {recipe.totalNutrition?.calories && (
          <MDTypography variant="caption" color="text">
            {Math.round(recipe.totalNutrition.calories)} kcal
          </MDTypography>
        )}
      </Box>
    </Paper>
  );
}

function FavoritesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const { showSuccess, showError } = useToast();

  const fetchFavorites = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getFavoriteRecipes(page, pagination.limit);

      if (result.success) {
        setRecipes(result.data || []);
        setPagination(result.pagination || pagination);
      } else {
        setError("Không thể tải danh sách yêu thích");
      }
    } catch (err) {
      console.error("Fetch favorites error:", err);
      setError(err.message || "Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites(1);
  }, []);

  const handleToggleFavorite = async (recipeId) => {
    try {
      const result = await toggleFavorite(recipeId);

      if (result.success) {
        if (result.isFavorite) {
          showSuccess("Đã thêm vào danh sách yêu thích");
        } else {
          showSuccess("Đã xóa khỏi danh sách yêu thích");
          // Reload danh sách
          fetchFavorites(pagination.page);
        }
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);
      showError(err.message || "Không thể thay đổi trạng thái yêu thích");
    }
  };

  const handlePageChange = (event, newPage) => {
    fetchFavorites(newPage);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} px={2}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            Món ăn yêu thích
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Danh sách các món ăn bạn đã thêm vào yêu thích
          </MDTypography>
        </MDBox>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : recipes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <FavoriteBorderIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <MDTypography variant="h6" color="text" mb={1}>
              Chưa có món ăn yêu thích
            </MDTypography>
            <MDTypography variant="body2" color="text.secondary">
              Hãy thêm các món ăn bạn yêu thích vào danh sách này
            </MDTypography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3} mb={3}>
              {recipes.map((recipe) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={recipe._id}>
                  <RecipeCard
                    recipe={recipe}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={true} // Tất cả đều là favorite trong trang này
                  />
                </Grid>
              ))}
            </Grid>

            {pagination.totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}

            <Box mt={2} textAlign="center">
              <MDTypography variant="caption" color="text">
                Hiển thị {recipes.length} / {pagination.total} món ăn
              </MDTypography>
            </Box>
          </>
        )}
      </MDBox>
    </DashboardLayout>
  );
}

export default FavoritesPage;


RecipeCard.propTypes = {
  recipe: PropTypes.object.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool.isRequired,
};