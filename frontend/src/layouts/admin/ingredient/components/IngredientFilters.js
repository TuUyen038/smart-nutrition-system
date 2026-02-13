// src/layouts/admin/ingredients/components/IngredientFilters.jsx
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

import MDBox from "components/MDBox";
import PropTypes from "prop-types";
import { IconButton, InputAdornment, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

function IngredientFilters({ search, onSearchChange }) {
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
      </Grid>
    </MDBox>
  );
}

IngredientFilters.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

export default IngredientFilters;
