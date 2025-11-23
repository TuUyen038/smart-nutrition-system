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
} from "@mui/material";
import FoodCard from "./FoodCard";
import MDButton from "components/MDButton";

import {
  LocalFireDepartment as LocalFireDepartmentIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

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
  useEffect(() => {
    if (!open) return;
    setSelectedItems(currentMenu);
  }, [open, currentMenu, mode, date]);

  const toggleLocal = (recipe) => {
    const formattedRecipe = {
      id: recipe.id || recipe._id,
      name: recipe.name,
      calories: recipe.calories || 0,
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
      console.log("Saving selectedItems:", selectedItems, "for date:", date);
      onSave(selectedItems, date);
    }
    onClose?.();
  };

  const totalCalories = selectedItems.reduce((sum, r) => sum + (r?.calories || 0), 0);

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
            width: "90%",
            maxWidth: 900,
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
                    <Grid item xs={12} sm={6} md={4} key={itemId}>
                      <FoodCard
                        title={item.name}
                        calories={item.calories}
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

            {/* Recipes list */}
            <Typography variant="h6" mb={2} fontWeight={600}>
              Danh sách món ăn
            </Typography>

            <Grid container spacing={2} mb={3}>
              {recipes.map((recipe) => {
                const recipeId = recipe._id?.toString() || recipe.id;
                const isSelected = selectedItems.some((item) => {
                  const itemId = item._id?.toString() || item.id || item.recipeId;
                  return itemId === recipeId;
                });

                return (
                  <Grid item xs={12} sm={6} md={4} key={recipeId}>
                    <FoodCard title={recipe.name} calories={recipe.calories} image={recipe.image}>
                      <MDButton
                        fullWidth
                        size="small"
                        variant={isSelected ? "contained" : "outlined"}
                        color={isSelected ? "success" : "info"}
                        startIcon={isSelected ? <CheckCircleIcon /> : <AddIcon />}
                        onClick={() => toggleLocal(recipe)}
                        sx={{
                          "&:hover": {
                            backgroundColor: isSelected ? "success.dark" : "info.main",
                            color: "#fff",
                          },
                        }}
                      >
                        {isSelected ? "Đã chọn" : "Thêm"}
                      </MDButton>
                    </FoodCard>
                  </Grid>
                );
              })}
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
