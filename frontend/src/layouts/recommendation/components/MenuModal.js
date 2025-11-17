import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal, Fade, Backdrop, Box, Typography, Grid, Button, Paper, Divider, Chip,
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
  date,           // nếu mode === "week", date thường là weekStart; nếu mode === "day", date là ngày đang edit
  currentMenu = [],
  onSave,         // (updatedItems, date) => void
  recipes = [],
  getDayName,
}) {
  // selectedItems luôn là MẢNG: các món của ngày đang edit
  const [selectedItems, setSelectedItems] = useState([]);

  // Khi mở modal hoặc currentMenu/date thay đổi => đồng bộ state local
  useEffect(() => {
    if (!open) return;

    // Nếu currentMenu là mảng => dùng trực tiếp (mode "day" thông thường)
    if (Array.isArray(currentMenu)) {
      setSelectedItems(currentMenu);
      return;
    }

    // Nếu currentMenu là object (ở mode "week") => lấy mảng tại key = date (nếu có)
    if (mode === "week" && currentMenu && date) {
      const dayArr = Array.isArray(currentMenu[date]) ? currentMenu[date] : [];
      setSelectedItems(dayArr);
      return;
    }

    // fallback an toàn
    setSelectedItems([]);
  }, [open, currentMenu, mode, date]);

  // Toggle món trong selectedItems (local)
  const toggleLocal = (recipe) => {
    setSelectedItems(prev => {
      const exists = prev.some(item => item.id === recipe.id);
      if (exists) {
        return prev.filter(item => item.id !== recipe.id);
      } else {
        return [...prev, recipe];
      }
    });
  };

  // Xóa 1 món cụ thể (dùng ở nút Xóa)
  const removeLocal = (recipeId) => {
    setSelectedItems(prev => prev.filter(i => i.id !== recipeId));
  };

  // Gọi onSave với dữ liệu local (parent sẽ update menus / weekMenus)
  const handleSaveLocal = () => {
    if (typeof onSave === "function") {
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
        <Box sx={{
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
        }}>
          {/* Header */}
          <Box sx={{
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
          }}>
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
                {selectedItems.map(item => (
                  <Grid item xs={12} sm={6} md={4} key={item.id || item.recipeId}>
                    <FoodCard title={item.name} calories={item.calories} image={item.image}>
                      <Button
                        fullWidth
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => removeLocal(item.id || item.recipeId)}
                      >
                        Xóa
                      </Button>
                    </FoodCard>
                  </Grid>
                ))}
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
              {recipes.map(recipe => {
                const isSelected = selectedItems.some(item => item.id === recipe.id);
                return (
                  <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                    <FoodCard title={recipe.name} calories={recipe.calories} image={recipe.image}>
                      <Button
                        fullWidth
                        size="small"
                        variant={isSelected ? "contained" : "outlined"}
                        color={isSelected ? "success" : "primary"}
                        startIcon={isSelected ? <CheckCircleIcon /> : <AddIcon />}
                        onClick={() => toggleLocal(recipe)}
                      >
                        {isSelected ? "Đã chọn" : "Thêm"}
                      </Button>
                    </FoodCard>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Footer */}
          <Box sx={{
            position: "sticky",
            bottom: 0,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
            p: 3,
            display: "flex",
            gap: 2,
          }}>
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
