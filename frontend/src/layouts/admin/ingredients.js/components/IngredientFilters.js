// src/layouts/admin/ingredients/components/IngredientFilters.jsx
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types"; // <--- THÊM DÒNG NÀY

const CATEGORY_OPTIONS = [
  { value: "all", label: "Tất cả nhóm" },
  { value: "protein", label: "Protein" },
  { value: "carb", label: "Carb" },
  { value: "fat", label: "Chất béo" },
  { value: "vegetable", label: "Rau củ" },
  { value: "fruit", label: "Trái cây" },
  { value: "dairy", label: "Sữa & chế phẩm" },
  { value: "seasoning", label: "Gia vị" },
  { value: "beverage", label: "Thức uống" },
  { value: "other", label: "Khác" },
];

function IngredientFilters({ search, onSearchChange, category, onCategoryChange }) {
  return (
    <MDBox mb={3}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label="Tìm kiếm theo tên (VI/EN)"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Nhóm nguyên liệu"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <MDTypography variant="caption" color="text">
            * Dữ liệu dinh dưỡng được tính theo đơn vị cơ bản (ví dụ 100g hoặc 1 đơn vị).
          </MDTypography>
        </Grid>
      </Grid>
    </MDBox>
  );
}

// 🔹 THÊM PROP TYPES Ở CUỐI FILE
IngredientFilters.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
};

export default IngredientFilters;
