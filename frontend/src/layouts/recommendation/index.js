import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Modal,
  Fade,
  Backdrop,
  Divider,
  Chip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DefaultFoodCard from "examples/Cards/FoodCards/DefaultFoodCard";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MDTypography from "components/MDTypography";

function RecipeList() {
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [openSuggestModal, setOpenSuggestModal] = useState(false);
  const [filters, setFilters] = useState({ goal: "", duration: "" });
  let totalCalories = 300;
  const caloriesLimit = 300;
  // Giả lập dữ liệu
  const mockRecipes = [
    {
      id: 1,
      name: "Bánh mì ốp la",
      imageUrl: "/images/banh-mi-op-la.jpg",
      description: "Món ăn sáng giàu năng lượng.",
      totalNutrition: { calories: 350 },
      category: "Sáng",
    },
    {
      id: 2,
      name: "Cơm cá hồi",
      imageUrl: "/images/com-ca-hoi.jpg",
      description: "Giàu protein, tốt cho cơ bắp.",
      totalNutrition: { calories: 520 },
      category: "Trưa",
    },
    {
      id: 3,
      name: "Phở chay",
      imageUrl: "/images/pho-chay.jpg",
      description: "Thanh đạm, dễ tiêu hóa.",
      totalNutrition: { calories: 300 },
      category: "Tối",
    },
  ];

  const toggleSelect = (recipe) => {
    setSelectedRecipes((prev) =>
      prev.some((r) => r.id === recipe.id)
        ? prev.filter((r) => r.id !== recipe.id)
        : [...prev, recipe]
    );
  };

  const handleOpenSuggest = () => setOpenSuggestModal(true);
  const handleCloseSuggest = () => setOpenSuggestModal(false);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Box py={3} px={2}>
        {/* 🔹 Thanh bộ lọc */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Tiêu đề bên trái */}
          <Typography variant="h6" fontWeight="medium">
          </Typography>

          {/* Các options bên phải */}
          <Box sx={{ display: "flex", alignItems: "top", gap: 1 }}>
            {/* Bộ lọc theo loại bữa */}
            <FormControl sx={{ minWidth: 100 }} size="medium">
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Loại bữa"
                sx={{
                  
                  // padding: "12px 1px 0.3rem !important",
                  paddingBottom: "1.5rem !important",
                  "& .MuiOutlinedInput-input": { padding: "3px 0.75rem"},
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Sáng">Bữa sáng</MenuItem>
                <MenuItem value="Trưa">Bữa trưa</MenuItem>
                <MenuItem value="Tối">Bữa tối</MenuItem>
              </Select>
              <InputLabel sx={{ height: '1.75rem' }}>Danh mục</InputLabel>

            </FormControl>

            {/* Nút gợi ý thực đơn */}
            <MDButton
              variant="gradient"
              color="info"
              startIcon={<AutoAwesomeIcon />}
              onClick={handleOpenSuggest}
              sx={{ whiteSpace: "nowrap" }}
            >
              Gợi ý thực đơn
            </MDButton>
          </Box>
        </Paper>

        {/* 🔹 Danh sách món ăn */}
        <Grid container spacing={2}>
          {mockRecipes
            .filter((r) => !filterCategory || r.category === filterCategory)
            .map((item) => {
              const selected = selectedRecipes.some((r) => r.id === item.id);
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id} gap={1}>
                  <DefaultFoodCard
                    image={item.imageUrl}
                    label={`${item.totalNutrition.calories} kcal`}
                    title={item.name}
                    description={item.description}
                    action={null}
                  >
                    <MDButton
                      color={selected ? "success" : "info"}
                      size="small"
                      onClick={() => toggleSelect(item)}
                      fullWidth
                    >
                      {selected ? "Đã chọn" : "Thêm"}
                    </MDButton>
                  </DefaultFoodCard>
                </Grid>
              );
            })}
        </Grid>
      </Box>

      {/* 🔹 Thanh nổi bên dưới */}
      {selectedRecipes.length > 0 && (
        <Fade in>
          <Paper
            elevation={8}
            sx={{
              position: "fixed",
              bottom: 20, // Tạo khoảng cách từ mép dưới
              left: "61%",
              transform: "translateX(-50%)", // Căn giữa
              width: "calc(100% - 40px)", // Để lại margin 2 bên
              maxWidth: 925, // Giới hạn chiều rộng tối đa
              p: 2.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 1000,
              borderRadius: 3, // Bo góc mềm mại hơn
              backdropFilter: "blur(10px)", // Hiệu ứng blur nền
              backgroundColor: "rgba(255, 255, 255, 0.95)", // Trong suốt nhẹ
              border: "1px solid rgba(0, 0, 0, 0.08)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)", // Shadow đẹp hơn
            }}
          >
            {/* Phần thông tin bên trái */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              {/* Số món đã chọn */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MDTypography variant="h6" gutterBottom>
                  Đã chọn: {`${selectedRecipes.length} món`}
                </MDTypography>
              </Box>

              {/* Divider dọc */}
              <Divider orientation="vertical" flexItem />

              {/* Thông tin calories */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MDTypography variant="h6" gutterBottom>
                  Tổng calories:
                </MDTypography>
                <Chip
                  label={`${totalCalories} kcal`}
                  color={totalCalories > caloriesLimit ? "error" : "success"}
                  size="medium"
                  sx={{ fontWeight: "bold" }}
                  icon={
                    totalCalories > caloriesLimit ? (
                      <WarningIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    )
                  }
                />
                {caloriesLimit && (
                  <Typography variant="caption" color="text.secondary">
                    / {caloriesLimit} kcal
                  </Typography>
                )}
              </Box>

              {/* Cảnh báo vượt mức */}
              {totalCalories > caloriesLimit && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    fontWeight: "medium",
                  }}
                >
                  <WarningIcon sx={{ fontSize: 16 }} />
                  Vượt mức {totalCalories - caloriesLimit} kcal
                </Typography>
              )}
            </Box>

            {/* Nút action bên phải */}
            <MDButton
              color="info"
              variant="gradient"
              size="large"
              sx={{
                px: 4,
                whiteSpace: "nowrap",
                boxShadow: 3,
              }}
            >
              Đi đến tạo thực đơn
            </MDButton>
          </Paper>
        </Fade>
      )}

      {/* 🔹 Modal gợi ý thực đơn */}
      <Modal
        open={openSuggestModal}
        onClose={handleCloseSuggest}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={openSuggestModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              width: 400,
            }}
          >
            <Typography variant="h6" mb={2}>
              Gợi ý thực đơn
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Mục tiêu</InputLabel>
              <Select
                value={filters.goal}
                onChange={(e) => setFilters({ ...filters, goal: e.target.value })}
                label="Mục tiêu"
              >
                <MenuItem value="giam_can">Giảm cân</MenuItem>
                <MenuItem value="tang_co">Tăng cơ</MenuItem>
                <MenuItem value="can_bang">Cân bằng</MenuItem>
                <MenuItem value="an_chay">Ăn chay</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Thời gian</InputLabel>
              <Select
                value={filters.duration}
                onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                label="Thời gian"
              >
                <MenuItem value="ngay">Theo ngày</MenuItem>
                <MenuItem value="tuan">Theo tuần</MenuItem>
              </Select>
            </FormControl>

            <MDButton
              variant="contained"
              color="info"
              fullWidth
              onClick={() => {
                handleCloseSuggest();
                console.log("Lấy gợi ý:", filters);
              }}
            >
              Xem gợi ý
            </MDButton>
          </Box>
        </Fade>
      </Modal>
    </DashboardLayout>
  );
}

export default RecipeList;
