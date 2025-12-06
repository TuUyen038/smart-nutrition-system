import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Fade,
  Backdrop,
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Divider,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import FoodCard from "./FoodCard";
import MDButton from "components/MDButton";

import {
  LocalFireDepartment as LocalFireDepartmentIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { getRecipesByIngredients } from "services/recipeApi";

export default function MenuModal({
  open,
  onClose,
  mode,
  date,
  currentMenu = [],
  onSave,
  recipes = [],
  getDayName,
}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchImageFile, setSearchImageFile] = useState(null);
  const [searchResults, setSearchResults] = useState(recipes);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // ví dụ hàm handleSearchByImage – tạm thời chỉ là skeleton để bạn gắn API
  const handleSearchByImage = async () => {
    // mở input file ẩn, lấy file ảnh, gọi API search bằng ảnh
    // hoặc mở một dialog nhỏ khác để upload ảnh
    // kết quả API -> setRecipesFromImage([...]) hoặc merge vào `recipes`
    console.log("TODO: implement search by image");
  };
  // Reset selectedItems khi mở modal hoặc đổi ngày/mode
  useEffect(() => {
    if (!open) return;

    // currentMenu là menu đã lưu của ngày đó
    setSelectedItems(Array.isArray(currentMenu) ? currentMenu : []);
    setSearchTerm("");
    setSearchError(null);

    // khi mới mở modal: hiển thị list recipes gốc mà parent truyền xuống
    setSearchResults(recipes);
  }, [open, date, mode]);
  useEffect(() => {
    if (!open) return;

    const keyword = searchTerm.trim();

    // Nếu rỗng -> về lại danh sách gốc
    if (!keyword) {
      setSearchResults(recipes);
      setSearchError(null);
      return;
    }

    // Nếu độ dài < 2 thì không gọi API, tránh spam
    if (keyword.length < 2) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError(null);

        const res = await getRecipesByIngredients(keyword);

        // tuỳ cấu trúc API của bạn, chỉnh dòng này:
        const foundRecipes = res?.data?.recipes || res?.recipes || [];

        if (!cancelled) {
          setSearchResults(foundRecipes);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Search error:", err);
          setSearchError(err.message || "Lỗi tìm kiếm");
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 400); // 400ms debounce

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchTerm, open, recipes]);

  const toggleLocal = (recipe) => {
    const formattedRecipe = {
      id: recipe.id || recipe._id,
      name: recipe.name,
      calories: recipe.calories || recipe.totalNutrition?.calories || 0,
      image:
        recipe.image ||
        "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
    };
    setSelectedItems((prev) => {
      const exists = prev.some((item) => {
        const itemId = item.id || item._id || item.recipeId;
        const recipeId = recipe.id || recipe._id;
        return itemId === recipeId;
      });

      if (exists) {
        return prev.filter((item) => {
          const itemId = item.id || item._id || item.recipeId;
          const recipeId = recipe.id || recipe._id;
          return itemId !== recipeId;
        });
      } else {
        return [...prev, formattedRecipe];
      }
    });
  };

  const removeLocal = (recipeId) => {
    setSelectedItems((prev) =>
      prev.filter((i) => {
        const itemId = i.id || i._id || i.recipeId;
        return itemId !== recipeId;
      })
    );
  };

  const handleSaveLocal = () => {
    if (typeof onSave === "function") {
      onSave(selectedItems, date);
    }
    onClose?.();
  };

  const totalCalories = selectedItems.reduce(
    (sum, r) => sum + (r?.calories || r?.totalNutrition?.calories || 0),
    0
  );
  const dedupById = (list) => {
    const map = new Map();
    list.forEach((r) => {
      const id = r._id?.toString() || r.id;
      if (id && !map.has(id)) {
        map.set(id, r);
      }
    });
    return Array.from(map.values());
  };

  const safeSearchResults = dedupById(searchResults);

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 3,
            width: "95%",
            maxWidth: 1100, // tăng rộng hơn chút cho 4 card 1 hàng
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              bgcolor: "background.paper",
              borderBottom: 1,
              borderColor: "divider",
              p: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 1,
            }}
          >
            <Typography variant="h5" fontWeight={700}>
              {`Thực đơn ${getDayName ? getDayName(date) : date}`}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                icon={<LocalFireDepartmentIcon />}
                label={`Tổng: ${totalCalories} kcal`}
                color="warning"
                sx={{ fontWeight: 600 }}
              />
              <Button onClick={onClose} sx={{ minWidth: "auto", p: 1 }}>
                <CloseIcon />
              </Button>
            </Box>
          </Box>

          {/* Selected */}
          <Box p={3}>
            <Typography variant="h6" mb={2} fontWeight={600}>
              Món đã chọn ({selectedItems.length})
            </Typography>

            {selectedItems.length > 0 ? (
              <Grid container spacing={2} mb={3}>
                {selectedItems.map((item) => {
                  const itemId = item.id;
                  return (
                    <Grid item xs={12} sm={6} md={3} key={itemId}>
                      {/* md={3} -> 4 món / hàng trên màn hình rộng */}
                      <FoodCard
                        title={item.name}
                        calories={item.calories || item.totalNutrition?.calories || 0}
                        image={
                          item.image ||
                          "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg"
                        }
                      >
                        <MDButton
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<DeleteIcon />}
                          onClick={() => removeLocal(itemId)}
                        >
                          Xóa
                        </MDButton>
                      </FoodCard>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Paper sx={{ p: 3, mb: 3, textAlign: "center", bgcolor: "grey.50" }}>
                <Typography color="text.secondary">
                  Chưa chọn món nào. Hãy chọn món từ danh sách bên dưới.
                </Typography>
              </Paper>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Recipes list + Search */}
            {/* Tiêu đề + thanh tìm kiếm */}
            <Box
              mb={2}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
              flexWrap="wrap"
            >
              <Typography variant="h6" fontWeight={600}>
                Danh sách món ăn
              </Typography>

              <TextField
                size="small"
                placeholder="Tìm món theo tên / nguyên liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 260, width: 560, marginBottom:2 }}
              />
            </Box>

            {/* Nếu đang loading search */}
            {searchLoading && (
              <Typography color="text.secondary" mb={2}>
                Đang tìm kiếm...
              </Typography>
            )}

            {/* Nếu lỗi */}
            {searchError && (
              <Typography color="error" mb={2}>
                {searchError}
              </Typography>
            )}

            <Grid container spacing={2} mb={3}>
              {safeSearchResults.length === 0 && searchTerm.trim().length >= 2 && !searchLoading ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: "center", bgcolor: "grey.50" }}>
                    <Typography color="text.secondary">
                      {`Không tìm thấy món phù hợp với từ khóa "${searchTerm}".`}
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                safeSearchResults.map((recipe) => {
                  const recipeId = recipe._id?.toString() || recipe.id;
                  const isSelected = selectedItems.some((item) => {
                    const itemId = item._id?.toString() || item.id || item.recipeId;
                    return itemId === recipeId;
                  });

                  const keyword = searchTerm.trim();

                  const recipeLabel = (() => {
                    if (!keyword) return null;

                    // if (recipe.matchByName && recipe.matchByIngredient) {
                    //   return `Tên & nguyên liệu có: "${keyword}"`;
                    // }
                    if (recipe.matchByName) {
                      return `Tên món có: "${keyword}"`;
                    }
                    if (recipe.matchByIngredient) {
                      const ingNames = recipe.matchedIngredientNames?.slice(0, 2).join(", ");
                      return `Có nguyên liệu: ${ingNames}`;
                      // return ingNames ? `Có nguyên liệu: ${ingNames}` : `guyên liệu có: "${keyword}"`;
                    }
                    return null;
                  })();

                  return (
                    <Grid item xs={12} sm={6} md={3} key={recipeId}>
                      <FoodCard
                        title={recipe.name}
                        calories={recipe.calories || recipe.totalNutrition?.calories || "__"}
                        image={
                          recipe.image ||
                          recipe.imageUrl ||
                          "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg"
                        }
                      >
                        <Box display="flex" flexDirection="column" gap={0.5} width="100%">
                          {recipeLabel && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mb: 0.5 }}
                            >
                              {recipeLabel}
                            </Typography>
                          )}

                          <MDButton
                            fullWidth
                            size="small"
                            variant={isSelected ? "contained" : "outlined"}
                            color={isSelected ? "success" : "info"}
                            startIcon={isSelected ? <CheckCircleIcon /> : <AddIcon />}
                            onClick={() => toggleLocal(recipe)}
                          >
                            {isSelected ? "Đã chọn" : "Thêm"}
                          </MDButton>
                        </Box>
                      </FoodCard>
                    </Grid>
                  );
                })
              )}
            </Grid>
          </Box>
          {/* Footer */}
          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              bgcolor: "background.paper",
              borderTop: 1,
              borderColor: "divider",
              p: 3,
              display: "flex",
              gap: 2,
            }}
          >
            <MDButton
              color="secondary"
              variant="outlined"
              fullWidth
              onClick={onClose}
              sx={{ py: 1.5 }}
            >
              Hủy
            </MDButton>
            <MDButton
              color="info"
              variant="contained"
              fullWidth
              onClick={handleSaveLocal}
              sx={{ py: 1.5 }}
            >
              Lưu thay đổi
            </MDButton>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
MenuModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(["day", "week"]).isRequired,
  date: PropTypes.string.isRequired,
  currentMenu: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  onSave: PropTypes.func.isRequired,
  recipes: PropTypes.array.isRequired,
  getDayName: PropTypes.func,
};
