// src/layouts/admin/user/components/UserFilters.jsx
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { IconButton, InputAdornment, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import MDBox from "components/MDBox";
import PropTypes from "prop-types";

const GENDER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const GOAL_OPTIONS = [
  { value: "all", label: "Tất cả mục tiêu" },
  { value: "lose_weight", label: "Giảm cân" },
  { value: "maintain_weight", label: "Duy trì cân nặng" },
  { value: "gain_weight", label: "Tăng cân" },
];

function UserFilters({ search, onSearchChange, gender, onGenderChange, goal, onGoalChange }) {
  return (
    <MDBox mb={3}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm theo tên hoặc email…"
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
        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Giới tính"
            value={gender}
            sx={{
              label: {
                pb: 1,
              },
              ".css-12n1zae-MuiInputBase-root-MuiOutlinedInput-root": {
                lineHeight: "3.12",
              },
            }}
            onChange={(e) => onGenderChange(e.target.value)}
          >
            {GENDER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Mục tiêu"
            value={goal}
            sx={{
              label: {
                pb: 1,
              },
              ".css-12n1zae-MuiInputBase-root-MuiOutlinedInput-root": {
                lineHeight: "3.12",
              },
            }}
            onChange={(e) => onGoalChange(e.target.value)}
          >
            {GOAL_OPTIONS.map((opt) => (
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

UserFilters.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  gender: PropTypes.string.isRequired,
  onGenderChange: PropTypes.func.isRequired,
  goal: PropTypes.string.isRequired,
  onGoalChange: PropTypes.func.isRequired,
};

export default UserFilters;

