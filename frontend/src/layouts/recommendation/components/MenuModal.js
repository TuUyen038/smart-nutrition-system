import React from "react";
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
  currentMenu,
  toggleSelectRecipe,
  handleSave,
  mockRecipes,
  totalCalories,
  getDayName,
}) {
  return (
    <Modal open={open} onClose={onClose} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500 } }}>
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
              {mode === "day" ? `Thực đơn ${date}` : `Thực đơn tuần bắt đầu ${date}`}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip icon={<LocalFireDepartmentIcon />} label={`Tổng: ${totalCalories} kcal`} color="warning" sx={{ fontWeight: 600 }} />
              <Button onClick={onClose} sx={{ minWidth: "auto", p: 1 }}>
                <CloseIcon />
              </Button>
            </Box>
          </Box>

          {/* Món đã chọn */}
          <Box p={3}>
            <Typography variant="h6" mb={2} fontWeight={600}>
              Món đã chọn ({currentMenu.length})
            </Typography>
            {currentMenu.length > 0 ? (
              <Grid container spacing={2} mb={3}>
                {currentMenu.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <FoodCard title={item.name} calories={item.calories} image={item.image}>
                      <Button
                        fullWidth
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => toggleSelectRecipe(item)}
                      >
                        Xóa
                      </Button>
                    </FoodCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 3, mb: 3, textAlign: "center", bgcolor: "grey.50" }}>
                <Typography color="text.secondary">Chưa chọn món nào. Hãy chọn món từ danh sách bên dưới.</Typography>
              </Paper>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Danh sách món ăn */}
            <Typography variant="h6" mb={2} fontWeight={600}>
              Danh sách món ăn
            </Typography>
            <Grid container spacing={2} mb={3}>
              {mockRecipes.map((recipe) => {
                const isSelected = currentMenu.find((m) => m.id === recipe.id);
                return (
                  <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                    <FoodCard title={recipe.name} calories={recipe.calories} image={recipe.image}>
                      <Button
                        fullWidth
                        size="small"
                        variant={isSelected ? "contained" : "outlined"}
                        color={isSelected ? "success" : "primary"}
                        startIcon={isSelected ? <CheckCircleIcon /> : <AddIcon />}
                        onClick={() => toggleSelectRecipe(recipe)}
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
            <MDButton color="secondary" variant="outlined" fullWidth onClick={onClose} sx={{ py: 1.5 }}>
              Hủy
            </MDButton>
            <MDButton color="info" variant="contained" fullWidth onClick={handleSave} sx={{ py: 1.5 }}>
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
  currentMenu: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      calories: PropTypes.number,
      image: PropTypes.node,
      type: PropTypes.string,
    })
  ).isRequired,
  toggleSelectRecipe: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  mockRecipes: PropTypes.array.isRequired,
  totalCalories: PropTypes.number.isRequired,
  getDayName: PropTypes.func.isRequired,
};
