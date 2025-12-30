import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { getUser, getToken } from "services/authApi";
import { getUserById, updateUser } from "services/userApi";
import { useToast } from "context/ToastContext";

function Profile() {
  const { showSuccess, showError } = useToast();
  const [avatar, setAvatar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "male",
    height: "",
    weight: "",
    goal: "maintain_weight",
    allergies: [],
  });

  const [originalProfile, setOriginalProfile] = useState({ ...profile });

  // Map goal from frontend to backend format
  const mapGoalToBackend = (goal) => {
    const goalMap = {
      giam_can: "lose_weight",
      tang_co: "gain_weight",
      maintain: "maintain_weight",
      can_bang: "maintain_weight",
      an_chay: "maintain_weight",
    };
    return goalMap[goal] || goal;
  };

  // Map goal from backend to frontend format
  const mapGoalToFrontend = (goal) => {
    const goalMap = {
      lose_weight: "giam_can",
      gain_weight: "tang_co",
      maintain_weight: "maintain",
    };
    return goalMap[goal] || goal;
  };

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const user = getUser();
        if (!user || !user._id) {
          showError("Vui lòng đăng nhập để xem thông tin cá nhân");
          return;
        }

        const userData = await getUserById(user._id);
        if (userData) {
          setCurrentUser(userData);
          setProfile({
            name: userData.name || "",
            age: userData.age?.toString() || "",
            gender: userData.gender || "male",
            height: userData.height?.toString() || "",
            weight: userData.weight?.toString() || "",
            goal: mapGoalToFrontend(userData.goal) || "maintain",
            allergies: userData.allergies || [],
          });
          setOriginalProfile({
            name: userData.name || "",
            age: userData.age?.toString() || "",
            gender: userData.gender || "male",
            height: userData.height?.toString() || "",
            weight: userData.weight?.toString() || "",
            goal: mapGoalToFrontend(userData.goal) || "maintain",
            allergies: userData.allergies || [],
          });
        }
      } catch (error) {
        console.error("Load profile error:", error);
        showError("Không thể tải thông tin cá nhân");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Calculate BMR (Basal Metabolic Rate)
  const calculateBMR = () => {
    const age = parseFloat(profile.age);
    const height = parseFloat(profile.height);
    const weight = parseFloat(profile.weight);
    const gender = profile.gender;

    if (!age || !height || !weight || !gender) return 0;

    // Mifflin-St Jeor Equation
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === "female") {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
    return 10 * weight + 6.25 * height - 5 * age - 78; // Average for "other"
  };

  // Adjust calories based on goal
  const adjustByGoal = (calories, goal) => {
    switch (goal) {
      case "giam_can":
      case "lose_weight":
        return calories - 500;
      case "tang_co":
      case "gain_weight":
        return calories + 500;
      case "maintain":
      case "maintain_weight":
      default:
        return calories;
    }
  };

  // Calculate nutrition goals
  const calculateNutritionGoals = () => {
    const bmr = calculateBMR();
    if (bmr === 0) {
      // Fallback values if missing data
      return {
        calories: 2000,
        protein: 150,
        fat: 65,
        carbs: 250,
      };
    }

    const caloriesTarget = Math.round(adjustByGoal(bmr, profile.goal));
    const proteinTarget = Math.round((caloriesTarget * 0.3) / 4); // 30% calories, 4 cal/g
    const fatTarget = Math.round((caloriesTarget * 0.25) / 9); // 25% calories, 9 cal/g
    const carbTarget = Math.round((caloriesTarget * 0.45) / 4); // 45% calories, 4 cal/g

    return {
      calories: caloriesTarget,
      protein: proteinTarget,
      fat: fatTarget,
      carbs: carbTarget,
    };
  };

  // Calculate BMI
  const calculateBMI = () => {
    const heightInM = parseFloat(profile.height) / 100;
    const weightInKg = parseFloat(profile.weight);
    if (heightInM > 0 && weightInKg > 0) {
      return (weightInKg / (heightInM * heightInM)).toFixed(1);
    }
    return "0";
  };

  const getBMICategory = (bmi) => {
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return { label: "Thiếu cân", color: "info" };
    if (bmiNum < 23) return { label: "Bình thường", color: "success" };
    if (bmiNum < 25) return { label: "Thừa cân", color: "warning" };
    return { label: "Béo phì", color: "error" };
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleChange = (field) => (e) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const handleSave = async () => {
    if (!currentUser || !currentUser._id) {
      showError("Không tìm thấy thông tin người dùng");
      return;
    }

    try {
      setSaving(true);

      // Convert allergies string to array if needed
      const allergiesArray = Array.isArray(profile.allergies)
        ? profile.allergies
        : typeof profile.allergy === "string" && profile.allergy.trim()
        ? profile.allergy.split(",").map((a) => a.trim()).filter(Boolean)
        : [];

      // Prepare data for backend
      const updateData = {
        name: profile.name,
        age: profile.age ? parseInt(profile.age) : undefined,
        gender: profile.gender,
        height: profile.height ? parseFloat(profile.height) : undefined,
        weight: profile.weight ? parseFloat(profile.weight) : undefined,
        goal: mapGoalToBackend(profile.goal),
        allergies: allergiesArray,
      };

      // Remove undefined fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined || updateData[key] === "") {
          delete updateData[key];
        }
      });

      const token = getToken();
      const response = await fetch(`http://localhost:3000/api/users/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể cập nhật thông tin");
      }

      const result = await response.json();
      setCurrentUser(result.user || result);
      setOriginalProfile({ ...profile });
      setIsEditing(false);
      showSuccess("Cập nhật thông tin thành công! Mục tiêu dinh dưỡng đã được tính toán lại.");
    } catch (error) {
      console.error("Save profile error:", error);
      showError(error.message || "Không thể lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile({ ...originalProfile });
    setIsEditing(false);
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);
  const nutritionGoals = calculateNutritionGoals();

  const goalLabels = {
    giam_can: "Giảm cân",
    tang_co: "Tăng cơ",
    maintain: "Duy trì",
    can_bang: "Cân bằng",
    an_chay: "Ăn chay",
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} px={2} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} px={2}>
        <Grid container spacing={3}>
          {/* Cột trái: Thông tin cá nhân */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: "100%" }}>
              {/* Avatar */}
              <MDBox display="flex" flexDirection="column" alignItems="center" mb={3} position="relative">
                <Avatar
                  src={avatar}
                  alt="Avatar"
                  sx={{ width: 120, height: 120, border: "3px solid", borderColor: "grey.300", mb: 2 }}
                />
                {isEditing && (
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: "calc(50% - 68px)",
                      backgroundColor: "white",
                      boxShadow: 2,
                      "&:hover": { backgroundColor: "grey.100" },
                    }}
                  >
                    <EditIcon color="primary" fontSize="small" />
                    <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />
                  </IconButton>
                )}
                <MDTypography variant="h5" fontWeight="medium">
                  {profile.name}
                </MDTypography>
              </MDBox>

              <Divider sx={{ my: 2 }} />

              {/* Thông tin cá nhân */}
            {!isEditing ? (
                <>
                  <MDTypography variant="h6" mb={2} fontWeight="medium">
                    Thông tin cá nhân
                  </MDTypography>
                  <MDBox display="flex" flexDirection="column" gap={1.5}>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" color="text" fontWeight="medium">
                        Tuổi:
                      </MDTypography>
                      <MDTypography variant="button" color="text">
                        {profile.age} tuổi
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" color="text" fontWeight="medium">
                        Giới tính:
                      </MDTypography>
                      <MDTypography variant="button" color="text">
                        {profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nữ" : "Khác"}
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" color="text" fontWeight="medium">
                        Chiều cao:
                      </MDTypography>
                      <MDTypography variant="button" color="text">
                        {profile.height} cm
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" color="text" fontWeight="medium">
                        Cân nặng:
                      </MDTypography>
                      <MDTypography variant="button" color="text">
                        {profile.weight} kg
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" color="text" fontWeight="medium">
                        BMI:
                      </MDTypography>
                      <MDBox display="flex" alignItems="center" gap={1}>
                        <MDTypography variant="button" color={bmiCategory.color} fontWeight="medium">
                          {bmi}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          ({bmiCategory.label})
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </MDBox>

                  <Divider sx={{ my: 2 }} />

                  <MDBox display="flex" flexDirection="column" gap={1.5}>
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="button" color="text" fontWeight="medium">
                        Mục tiêu:
                      </MDTypography>
                      <MDTypography variant="button" color="text">
                        {goalLabels[profile.goal] || profile.goal}
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" flexDirection="column">
                      <MDTypography variant="button" color="text" fontWeight="medium" mb={0.5}>
                        Dị ứng:
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        {Array.isArray(profile.allergies) && profile.allergies.length > 0
                          ? profile.allergies.join(", ")
                          : profile.allergy || "Không có"}
                      </MDTypography>
                    </MDBox>
                </MDBox>

                  <MDButton
                    variant="gradient"
                    color="info"
                    fullWidth
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    sx={{ mt: 3 }}
                  >
                    Chỉnh sửa thông tin
                  </MDButton>
                </>
              ) : (
                <>
                  <MDTypography variant="h6" mb={2} fontWeight="medium">
                  Thông tin cá nhân
                </MDTypography>
                <MDBox display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Họ tên"
                    fullWidth
                    value={profile.name}
                    onChange={handleChange("name")}
                      size="small"
                  />
                  <TextField
                    label="Tuổi"
                    fullWidth
                      type="number"
                    value={profile.age}
                    onChange={handleChange("age")}
                      size="small"
                      inputProps={{ min: 1, max: 120 }}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Giới tính</InputLabel>
                      <Select value={profile.gender} onChange={handleChange("gender")} label="Giới tính">
                        <MenuItem value="male">Nam</MenuItem>
                        <MenuItem value="female">Nữ</MenuItem>
                        <MenuItem value="other">Khác</MenuItem>
                      </Select>
                    </FormControl>
                  <TextField
                    label="Chiều cao (cm)"
                    fullWidth
                      type="number"
                    value={profile.height}
                    onChange={handleChange("height")}
                      size="small"
                      inputProps={{ min: 50, max: 250 }}
                  />
                  <TextField
                    label="Cân nặng (kg)"
                    fullWidth
                      type="number"
                    value={profile.weight}
                    onChange={handleChange("weight")}
                      size="small"
                      inputProps={{ min: 1, max: 300 }}
                    />
                    {bmi !== "0" && (
                      <MDBox
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: `${bmiCategory.color}.lighter`,
                          border: `1px solid`,
                          borderColor: `${bmiCategory.color}.main`,
                        }}
                      >
                        <MDTypography variant="caption" color="text" fontWeight="medium">
                          BMI: {bmi} - {bmiCategory.label}
                        </MDTypography>
                      </MDBox>
                    )}
                </MDBox>

                  <Divider sx={{ my: 2 }} />

                  <MDTypography variant="h6" mb={2} fontWeight="medium">
                  Mục tiêu dinh dưỡng
                </MDTypography>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Mục tiêu</InputLabel>
                    <Select value={profile.goal} onChange={handleChange("goal")} label="Mục tiêu">
                    <MenuItem value="giam_can">Giảm cân</MenuItem>
                    <MenuItem value="tang_co">Tăng cơ</MenuItem>
                      <MenuItem value="maintain">Duy trì</MenuItem>
                    <MenuItem value="can_bang">Cân bằng</MenuItem>
                    <MenuItem value="an_chay">Ăn chay</MenuItem>
                  </Select>
                </FormControl>

                  <Divider sx={{ my: 2 }} />

                  <MDTypography variant="h6" mb={2} fontWeight="medium">
                  Tiền sử dị ứng
                </MDTypography>
                <TextField
                  label="Thực phẩm dị ứng"
                  fullWidth
                  multiline
                  rows={3}
                    value={
                      Array.isArray(profile.allergies) && profile.allergies.length > 0
                        ? profile.allergies.join(", ")
                        : profile.allergy || ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      const allergiesArray = value
                        .split(",")
                        .map((a) => a.trim())
                        .filter(Boolean);
                      setProfile({ ...profile, allergies: allergiesArray, allergy: value });
                    }}
                    size="small"
                    placeholder="Ví dụ: Hải sản, Sữa bò, Đậu phộng"
                    sx={{ mb: 2 }}
                  />

                  <MDBox display="flex" gap={1.5}>
                    <MDButton
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Hủy
                    </MDButton>
                    <MDButton
                      variant="gradient"
                      color="success"
                      fullWidth
                      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Đang lưu..." : "Lưu"}
                    </MDButton>
                  </MDBox>
                </>
              )}
              </Card>
          </Grid>
          
          {/* Cột phải: Thông tin bổ sung */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Card: Thông tin dinh dưỡng */}
              <Grid item xs={12}>
                <Card sx={{ p: 3 }}>
                  <MDTypography variant="h6" mb={2} fontWeight="medium">
                    Mục tiêu dinh dưỡng hàng ngày
                  </MDTypography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <MDBox
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "info.lighter",
                          textAlign: "center",
                        }}
                      >
                        <MDTypography variant="h4" color="info.main" fontWeight="bold">
                          {nutritionGoals.calories}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          kcal
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <MDBox
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "success.lighter",
                          textAlign: "center",
                        }}
                      >
                        <MDTypography variant="h4" color="success.main" fontWeight="bold">
                          {nutritionGoals.protein}g
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Protein
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <MDBox
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "warning.lighter",
                          textAlign: "center",
                        }}
                      >
                        <MDTypography variant="h4" color="warning.main" fontWeight="bold">
                          {nutritionGoals.fat}g
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Fat
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <MDBox
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "error.lighter",
                          textAlign: "center",
                        }}
                      >
                        <MDTypography variant="h4" color="error.main" fontWeight="bold">
                          {nutritionGoals.carbs}g
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Carbs
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                  {calculateBMR() === 0 && (
                    <MDBox mt={2}>
                      <MDTypography variant="caption" color="warning.main">
                        ⚠️ Vui lòng nhập đầy đủ thông tin (tuổi, giới tính, chiều cao, cân nặng) để tính toán mục tiêu dinh dưỡng chính xác.
                      </MDTypography>
                    </MDBox>
                  )}
                </Card>
              </Grid>

              {/* Card: Lịch sử */}
              <Grid item xs={12}>
                <Card sx={{ p: 3 }}>
                  <MDTypography variant="h6" mb={2} fontWeight="medium">
                    Thống kê hoạt động
                  </MDTypography>
                  <MDBox display="flex" flexDirection="column" gap={2}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center">
                      <MDTypography variant="button" color="text">
                        Tổng số món đã phân tích
                      </MDTypography>
                      <MDTypography variant="h6" color="info.main" fontWeight="bold">
                        45
                      </MDTypography>
                    </MDBox>
                    <Divider />
                    <MDBox display="flex" justifyContent="space-between" alignItems="center">
                      <MDTypography variant="button" color="text">
                        Số ngày sử dụng
                      </MDTypography>
                      <MDTypography variant="h6" color="success.main" fontWeight="bold">
                        30 ngày
                      </MDTypography>
                    </MDBox>
                    <Divider />
                    <MDBox display="flex" justifyContent="space-between" alignItems="center">
                      <MDTypography variant="button" color="text">
                        Món ăn yêu thích
                      </MDTypography>
                      <MDTypography variant="button" color="text">
                        Phở bò, Cơm gà
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Profile;
