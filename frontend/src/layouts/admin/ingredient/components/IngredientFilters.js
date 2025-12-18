// src/layouts/admin/ingredients/components/IngredientFilters.jsx
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types"; // <--- THÊM DÒNG NÀY
import { IconButton, InputAdornment, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

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
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={9}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm theo tên (VI/EN)…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <Tooltip title="Xóa">
                    <IconButton size="small" onClick={() => onSearchChange("")}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              ".css-enr3vy-MuiFormControl-root-MuiTextField-root .MuiOutlinedInput-root": {
                borderRadius: 10,
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            size="small"
            label="Nhóm nguyên liệu"
            value={category}
            sx={{
              label: {
                pb: 1,
              },
              ".css-12n1zae-MuiInputBase-root-MuiOutlinedInput-root": {
                lineHeight: "3.12",
              },
            }}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </MDBox>
  );
}

IngredientFilters.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
};

export default IngredientFilters;
