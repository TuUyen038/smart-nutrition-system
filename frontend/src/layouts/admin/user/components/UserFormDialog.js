// src/layouts/admin/user/components/UserFormDialog.jsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Box,
} from "@mui/material";

import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import MDButton from "components/MDButton";

const GENDER_OPTIONS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const GOAL_OPTIONS = [
  { value: "lose_weight", label: "Giảm cân" },
  { value: "maintain_weight", label: "Duy trì cân nặng" },
  { value: "gain_weight", label: "Tăng cân" },
];

function UserFormDialog({ open, onClose, onSubmit, user }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
    allergies: [],
  });
  const [allergyInput, setAllergyInput] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        age: user.age ?? "",
        gender: user.gender || "",
        height: user.height ?? "",
        weight: user.weight ?? "",
        goal: user.goal || "",
        allergies: user.allergies || [],
      });
    } else {
      setForm({
        name: "",
        email: "",
        age: "",
        gender: "",
        height: "",
        weight: "",
        goal: "",
        allergies: [],
      });
    }
    setAllergyInput("");
  }, [user, open]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim() && !form.allergies.includes(allergyInput.trim())) {
      setForm((prev) => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()],
      }));
      setAllergyInput("");
    }
  };

  const handleRemoveAllergy = (allergy) => {
    setForm((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== allergy),
    }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("Tên người dùng là bắt buộc");
      return;
    }
    if (!form.email.trim()) {
      alert("Email là bắt buộc");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      age: form.age === "" ? undefined : Number(form.age),
      gender: form.gender || undefined,
      height: form.height === "" ? undefined : Number(form.height),
      weight: form.weight === "" ? undefined : Number(form.weight),
      goal: form.goal || undefined,
      allergies: form.allergies,
    };

    onSubmit(payload);
  };

  const title = user ? "Chỉnh sửa thông tin người dùng" : "Thêm người dùng mới";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <MDTypography variant="h6">{title}</MDTypography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          label: {
            pb: 1,
          },
          ".css-12n1zae-MuiInputBase-root-MuiOutlinedInput-root": {
            lineHeight: "3.15",
          },
        }}
      >
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Tên"
              value={form.name}
              onChange={handleChange("name")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              disabled={!!user} // Không cho sửa email khi edit
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Tuổi"
              value={form.age}
              onChange={handleChange("age")}
              inputProps={{ min: 0, max: 150 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Giới tính"
              value={form.gender}
              onChange={handleChange("gender")}
            >
              {GENDER_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Mục tiêu"
              value={form.goal}
              onChange={handleChange("goal")}
            >
              <MenuItem value="">Không có</MenuItem>
              {GOAL_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Chiều cao (cm)"
              value={form.height}
              onChange={handleChange("height")}
              inputProps={{ min: 0, step: "any" }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Cân nặng (kg)"
              value={form.weight}
              onChange={handleChange("weight")}
              inputProps={{ min: 0, step: "any" }}
            />
          </Grid>

          <Grid item xs={12}>
            <MDTypography variant="button" fontWeight="medium" mb={1}>
              Dị ứng
            </MDTypography>
            <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
              {form.allergies.map((allergy) => (
                <Chip
                  key={allergy}
                  label={allergy}
                  onDelete={() => handleRemoveAllergy(allergy)}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box display="flex" gap={1}>
              <TextField
                size="small"
                placeholder="Nhập dị ứng và nhấn Enter"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAllergy();
                  }
                }}
                sx={{ flex: 1 }}
              />
              <MDButton variant="outlined" size="small" onClick={handleAddAllergy}>
                Thêm
              </MDButton>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <MDButton variant="outlined" color="secondary" onClick={onClose}>
          Hủy
        </MDButton>
        <MDButton variant="contained" color="info" onClick={handleSubmit}>
          Lưu
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

UserFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    age: PropTypes.number,
    gender: PropTypes.string,
    height: PropTypes.number,
    weight: PropTypes.number,
    goal: PropTypes.string,
    allergies: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default UserFormDialog;

