import React, { useState, useEffect, useRef } from "react";
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
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import { getRecipesByIngredients, searchRecipesByImage } from "services/recipeApi";

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
  const [detectedFoodName, setDetectedFoodName] = useState(null);
  const fileInputRef = useRef(null);

  // Hybrid Image→Text→Search: Tìm kiếm món ăn bằng ảnh
  const handleSearchByImage = async (imageFile) => {
    if (!imageFile) return;

    try {
      setSearchLoading(true);
      setSearchError(null);
      setDetectedFoodName(null);

      // Gọi API Hybrid Search
      const result = await searchRecipesByImage(imageFile);

      if (result.success && result.data) {
        // Format recipes để hiển thị (giống format từ getRecipesByIngredients)
        const formattedRecipes = result.data.map((r) => ({
          _id: r._id,
          id: r._id,
          name: r.name,
          calories: r.totalNutrition?.calories || 0,
          totalNutrition: r.totalNutrition,
          imageUrl: r.imageUrl,
          description: r.description,
          category: r.category,
          ingredients: r.ingredients,
          matchByName: r.matchByName,
          matchByIngredient: r.matchByIngredient,
        }));

        setSearchResults(formattedRecipes);
        setDetectedFoodName(result.detectedFoodName);
        setSearchImageFile(null); // Reset file input
      } else {
        // Khi không có kết quả, vẫn set detectedFoodName để hiển thị message phù hợp
        setDetectedFoodName(result.detectedFoodName || "món ăn");
        setSearchError(null);
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Search by image error:", err);
      setSearchError(err.message || "Lỗi tìm kiếm bằng ảnh");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Xử lý khi user chọn file ảnh
  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setSearchError("Vui lòng chọn file ảnh hợp lệ.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSearchError("Kích thước ảnh không được vượt quá 5MB.");
        return;
      }

      setSearchImageFile(file);
      handleSearchByImage(file);
    }
  };

  // Mở file picker
  const handleOpenImagePicker = () => {
    fileInputRef.current?.click();
  };
  // Reset selectedItems CHỈ KHI modal mở (open chuyển từ false -> true), không reset khi currentMenu thay đổi
  const prevOpenRef = useRef(false);
  useEffect(() => {
    // Chỉ reset khi modal VỪA MỞ (open = true và prevOpen = false)
    const wasClosed = !prevOpenRef.current;
    prevOpenRef.current = open;

    if (!open) {
      // Modal đóng - reset một số state nếu cần
      setSearchTerm("");
      setSearchError(null);
      setDetectedFoodName(null);
      setSearchImageFile(null);
      return;
    }

    // Chỉ reset selectedItems khi modal VỪA MỞ, không reset khi currentMenu thay đổi trong khi modal đang mở
    if (wasClosed) {
      // currentMenu là menu đã lưu của ngày đó
      const menuArray = Array.isArray(currentMenu) ? currentMenu : [];

      // Debug log để kiểm tra
      console.log("🔍 [MenuModal] Modal just opened - currentMenu:", currentMenu);
      console.log("🔍 [MenuModal] menuArray:", menuArray);
      console.log(
        "🔍 [MenuModal] menuArray IDs:",
        menuArray.map((item) => ({
          id: item.id,
          _id: item._id,
          recipeId: item.recipeId,
          idString: String(item.id || item._id || item.recipeId || ""),
        }))
      );

      setSelectedItems(menuArray);
      setSearchTerm("");
      setSearchError(null);
      setDetectedFoodName(null);
      setSearchImageFile(null);
      // khi mới mở modal: hiển thị list recipes gốc mà parent truyền xuống
      setSearchResults(recipes);
    }
  }, [open, date, mode]); // Loại bỏ currentMenu khỏi dependency array
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
      imageUrl:
        recipe.imageUrl ||
        "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg",
    };
    const recipeId = recipe.id || recipe._id;

    setSelectedItems((prev) => {
      const exists = prev.some((item) => {
        const itemId = String(item.id || item._id || item.recipeId || "");
        const compareRecipeId = String(recipeId || "");
        return itemId === compareRecipeId && itemId !== "" && compareRecipeId !== "";
      });

      if (exists) {
        const compareRecipeId = String(recipeId || "");
        return prev.filter((item) => {
          const itemId = String(item.id || item._id || item.recipeId || "");
          return itemId !== compareRecipeId;
        });
      } else {
        return [...prev, formattedRecipe];
      }
    });
  };

  const removeLocal = (recipeId) => {
    const compareRecipeId = String(recipeId || "");
    setSelectedItems((prev) => {
      const filtered = prev.filter((i) => {
        const itemId = String(i.id || i._id || i.recipeId || "");
        const shouldKeep = itemId !== compareRecipeId && itemId !== "" && compareRecipeId !== "";
        return shouldKeep;
      });
      return filtered;
    });
  };

  const handleSaveLocal = () => {
    if (typeof onSave === "function") {
      // Gửi các món đã chọn
      const itemsToSave = selectedItems.map((item) => {
        const itemId = item.id || item._id || item.recipeId?._id || item.recipeId;
        return {
          ...item,
          id: itemId,
          calories: item.calories || item.totalNutrition?.calories || 0,
          imageUrl: item.imageUrl,
          status: item.status || "planned",
          note: item.note || "",
          servingTime: item.servingTime || "other",
        };
      });

      onSave(itemsToSave, date);
    }
    onClose?.();
  };

  // Tính tổng calo = sum(calories)
  const totalCalories = selectedItems.reduce((sum, r) => {
    const calories = r?.calories || r?.totalNutrition?.calories || 0;
    return sum + calories;
  }, 0);

  // Làm tròn đến 2 chữ số thập phân
  const roundedTotalCalories = Math.round(totalCalories * 100) / 100;
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
            maxWidth: 1100,
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
                label={`Tổng: ${roundedTotalCalories.toFixed(2)} kcal`}
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
                  const itemId = item.id || item._id || item.recipeId;
                  const itemCalories = item.calories || item.totalNutrition?.calories || 0;
                  const roundedCalories = Math.round(itemCalories * 100) / 100;
                  const itemImage =
                    item.imageUrl ||
                    "https://res.cloudinary.com/denhj5ubh/image/upload/v1762541471/foodImages/ml4njluxyrvhthnvx0xr.jpg";

                  return (
                    <Grid item xs={12} sm={6} md={3} key={itemId}>
                      <FoodCard title={item.name} calories={roundedCalories} imageUrl={itemImage}>
                        <Box sx={{ width: "100%" }}>
                          {/* Nút xóa */}
                          <MDButton
                            fullWidth
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            onClick={() => removeLocal(itemId)}
                          >
                            Xóa
                          </MDButton>
                        </Box>
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

              <Box display="flex" alignItems="center" gap={2}>
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
                  sx={{ minWidth: 260, width: 400 }}
                />

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageFileChange}
                />

                {/* Button tìm kiếm bằng ảnh */}
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={<PhotoCameraIcon />}
                  onClick={handleOpenImagePicker}
                  disabled={searchLoading}
                >
                  Tìm bằng ảnh
                </MDButton>
              </Box>
            </Box>

            {/* Hiển thị tên món đã detect (nếu search bằng ảnh) */}
            {detectedFoodName && (
              <Box mb={2} p={1.5} sx={{ bgcolor: "info.light", borderRadius: 1 }}>
                <Typography variant="body2" color="info.dark" fontWeight={600}>
                  Đã nhận diện: <strong>{detectedFoodName}</strong>
                </Typography>
              </Box>
            )}

            {/* Nếu đang loading search */}
            {searchLoading && (
              <Typography color="text.secondary" mb={2}>
                {detectedFoodName ? "Đang tìm kiếm trong database..." : "Đang tìm kiếm..."}
              </Typography>
            )}

            {/* Nếu lỗi */}
            {searchError && (
              <Typography color="error" mb={2}>
                {searchError}
              </Typography>
            )}

            <Grid container spacing={2} mb={3}>
              {safeSearchResults.length === 0 &&
              !searchLoading &&
              (searchTerm.trim().length >= 2 || detectedFoodName) ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: "center", bgcolor: "grey.50" }}>
                    <Typography color="text.secondary">
                      {detectedFoodName
                        ? "Không tìm thấy món ăn phù hợp"
                        : `Không tìm thấy món phù hợp với từ khóa "${searchTerm}".`}
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                safeSearchResults.map((recipe) => {
                  const recipeId = (recipe._id?.toString() || recipe.id || "").toString();
                  const isSelected = selectedItems.some((item) => {
                    const itemId = // item._id?.toString() ||
                    (item.id || item.recipeId || "").toString();
                    return itemId === recipeId;
                  });

                  const keyword = searchTerm.trim();

                  const recipeLabel = (() => {
                    if (!keyword) return null;
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
                        imageUrl={
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
  date: PropTypes.string,
  currentMenu: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  onSave: PropTypes.func.isRequired,
  recipes: PropTypes.array.isRequired,
  getDayName: PropTypes.func,
};
