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
  Autocomplete,
  Chip,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { getUser, getToken, getMe } from "services/authApi";
import { getUserById, updateUser } from "services/userApi";
import { getFavoriteRecipes } from "services/favoriteApi";
import { getRecipesByDateAndStatus } from "services/dailyMenuApi";
import { getIngredients } from "services/ingredientApi";
import { useToast } from "context/ToastContext";

function Profile() {
  const { showSuccess, showError } = useToast();
  const [avatar, setAvatar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [statistics, setStatistics] = useState({
    totalAnalyzedRecipes: 0,
    totalDaysUsed: 0,
    favoriteRecipes: [],
    totalFavorites: 0,
    loading: true,
  });
  const [ingredients, setIngredients] = useState([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "male",
    height: "",
    weight: "",
    goal: "maintain_weight",
    allergies: [],
    allergy: "",
  });

  const [originalProfile, setOriginalProfile] = useState({ ...profile });

  // Map goal from frontend to backend format
  const mapGoalToBackend = (goal) => {
    // Nếu đã là format mới, giữ nguyên
    if (
      goal === "lose_weight" ||
      goal === "gain_weight" ||
      goal === "maintain_weight" ||
      goal === ""
    ) {
      return goal;
    }
    // Map từ format cũ sang format mới
    const goalMap = {
      giam_can: "lose_weight",
      tang_co: "gain_weight",
      maintain: "maintain_weight",
      can_bang: "maintain_weight",
    };
    return goalMap[goal] || goal;
  };

  // Map goal from backend to frontend format
  const mapGoalToFrontend = (goal) => {
    // Nếu đã là format mới, giữ nguyên
    if (
      goal === "lose_weight" ||
      goal === "gain_weight" ||
      goal === "maintain_weight" ||
      goal === ""
    ) {
      return goal;
    }
    // Map từ format cũ sang format mới (fallback)
    const goalMap = {
      lose_weight: "lose_weight",
      gain_weight: "gain_weight",
      maintain_weight: "maintain_weight",
    };
    return goalMap[goal] || goal || "";
  };

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) {
          showError("Vui lòng đăng nhập để xem thông tin cá nhân");
          return;
        }

        // Lấy thông tin user hiện tại từ server
        let userData = null;
        try {
          userData = await getMe();
        } catch (error) {
          console.error("Get me error, trying getUserById:", error);
          // Fallback: thử lấy từ localStorage và gọi getUserById
          const user = getUser();
          if (user && (user._id || user.id)) {
            const userId = user._id || user.id;
            userData = await getUserById(userId);
          }
        }

        if (!userData) {
          showError("Không thể tải thông tin cá nhân");
          return;
        }

        // Xử lý dữ liệu user (có thể là object hoặc có user property)
        const userInfo = userData.user || userData;
        setCurrentUser(userInfo);

        const allergiesArray = Array.isArray(userInfo.allergies) ? userInfo.allergies : [];
        const allergyString = allergiesArray.length > 0 ? allergiesArray.join(", ") : "";

        setProfile({
          name: userInfo.name || "",
          age: userInfo.age?.toString() || "",
          gender: userInfo.gender || "male",
          height: userInfo.height?.toString() || "",
          weight: userInfo.weight?.toString() || "",
          goal: mapGoalToFrontend(userInfo.goal) || "maintain",
          allergies: allergiesArray,
          allergy: allergyString,
        });
        setOriginalProfile({
          name: userInfo.name || "",
          age: userInfo.age?.toString() || "",
          gender: userInfo.gender || "male",
          height: userInfo.height?.toString() || "",
          weight: userInfo.weight?.toString() || "",
          goal: mapGoalToFrontend(userInfo.goal) || "maintain",
          allergies: allergiesArray,
          allergy: allergyString,
        });
      } catch (error) {
        console.error("Load profile error:", error);
        showError("Không thể tải thông tin cá nhân: " + (error.message || "Lỗi không xác định"));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Load ingredients list
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setIngredientsLoading(true);
        // Lấy tất cả ingredients (limit lớn để lấy hết)
        const result = await getIngredients({ limit: 1000, sortBy: "name", sortOrder: "asc" });
        const ingredientsList = result.data || [];
        setIngredients(ingredientsList);
      } catch (error) {
        console.error("Error loading ingredients:", error);
        // Không hiển thị lỗi, chỉ log để không ảnh hưởng UX
      } finally {
        setIngredientsLoading(false);
      }
    };

    loadIngredients();
  }, []);

  // Load statistics
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setStatistics((prev) => ({ ...prev, loading: true }));
        const user = getUser();
        if (!user || (!user._id && !user.id)) {
          return;
        }
        const userId = user._id || user.id;

        // Lấy món yêu thích
        let favoriteRecipes = [];
        let totalFavorites = 0;
        try {
          const favoritesData = await getFavoriteRecipes(1, 100); // Lấy tối đa 100 món
          if (favoritesData && favoritesData.data) {
            favoriteRecipes = favoritesData.data.recipes || favoritesData.data || [];
            totalFavorites = favoritesData.pagination?.total || favoriteRecipes.length;
          }
        } catch (error) {
          console.error("Error loading favorites:", error);
        }

        // Lấy lịch sử món đã ăn (30 ngày gần nhất)
        let totalAnalyzedRecipes = 0;
        let totalDaysUsed = 0;
        const uniqueRecipes = new Set();
        const uniqueDays = new Set();

        try {
          const endDate = new Date();

          // Tính số ngày từ khi đăng ký đến hiện tại
          let daysSinceSignup = 0;
          if (currentUser.createdAt) {
            const signupDate = new Date(currentUser.createdAt);
            const diffTime = Math.abs(endDate - signupDate);
            daysSinceSignup = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }

          // Lấy tất cả daily menu từ ngày đăng ký (hoặc 1 năm gần nhất nếu không có createdAt)
          const startDate = currentUser.createdAt
            ? new Date(currentUser.createdAt)
            : (() => {
                const date = new Date();
                date.setDate(date.getDate() - 365);
                return date;
              })();

          // Lấy tất cả daily menu (không filter status) để đếm số ngày thực tế sử dụng
          const allDailyMenuData = await getRecipesByDateAndStatus(
            userId,
            startDate,
            endDate,
            null
          );

          if (Array.isArray(allDailyMenuData)) {
            allDailyMenuData.forEach((day) => {
              if (day.date) {
                uniqueDays.add(day.date.split("T")[0]); // Lấy ngày
              }
            });
          }

          // Lấy riêng món đã eaten để đếm số món đã phân tích
          const eatenData = await getRecipesByDateAndStatus(userId, startDate, endDate, "eaten");
          if (Array.isArray(eatenData)) {
            eatenData.forEach((day) => {
              if (day.recipes && Array.isArray(day.recipes)) {
                day.recipes.forEach((item) => {
                  const recipeId = item.recipeId?._id || item.recipeId;
                  if (recipeId) {
                    uniqueRecipes.add(recipeId);
                  }
                });
              }
            });
          }

          totalAnalyzedRecipes = uniqueRecipes.size;

          // Số ngày sử dụng: ưu tiên số ngày thực tế có daily menu, nếu không có thì dùng số ngày từ khi đăng ký
          totalDaysUsed = uniqueDays.size > 0 ? uniqueDays.size : daysSinceSignup;
        } catch (error) {
          console.error("Error loading history:", error);
          // Nếu có lỗi, vẫn tính từ ngày đăng ký
          if (currentUser.createdAt) {
            const signupDate = new Date(currentUser.createdAt);
            const endDate = new Date();
            const diffTime = Math.abs(endDate - signupDate);
            totalDaysUsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }
        }

        setStatistics({
          totalAnalyzedRecipes,
          totalDaysUsed,
          favoriteRecipes: favoriteRecipes.slice(0, 5), // Top 5 món yêu thích
          totalFavorites,
          loading: false,
        });
      } catch (error) {
        console.error("Load statistics error:", error);
        setStatistics((prev) => ({ ...prev, loading: false }));
      }
    };

    if (currentUser) {
      loadStatistics();
    }
  }, [currentUser]);

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
      case "lose_weight":
      case "giam_can": // Giữ lại để tương thích
        return calories - 500;
      case "gain_weight":
      case "tang_co": // Giữ lại để tương thích
        return calories + 500;
      case "maintain_weight":
      case "maintain": // Giữ lại để tương thích
      case "can_bang": // Giữ lại để tương thích
      case "an_chay": // Giữ lại để tương thích
      case "": // Không chọn
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
    if (!currentUser) {
      showError("Không tìm thấy thông tin người dùng");
      return;
    }

    // Lấy userId từ _id hoặc id
    const userId = currentUser._id || currentUser.id;
    if (!userId) {
      showError("Không tìm thấy ID người dùng");
      return;
    }

    try {
      setSaving(true);

      // Convert allergies string to array if needed
      let allergiesArray = [];
      if (Array.isArray(profile.allergies) && profile.allergies.length > 0) {
        // Nếu đã là array và có dữ liệu, sử dụng trực tiếp
        allergiesArray = profile.allergies.filter(Boolean); // Loại bỏ giá trị rỗng
      } else if (typeof profile.allergy === "string" && profile.allergy.trim()) {
        // Nếu là string, tách theo dấu phẩy hoặc xuống dòng
        allergiesArray = profile.allergy
          .split(/[,\n]/) // Tách theo dấu phẩy hoặc xuống dòng
          .map((a) => a.trim()) // Loại bỏ khoảng trắng đầu/cuối
          .filter(Boolean) // Loại bỏ giá trị rỗng
          .filter((item, index, self) => self.indexOf(item) === index); // Loại bỏ trùng lặp
      }

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

      // Sử dụng updateUser từ userApi
      const result = await updateUser(userId, updateData);

      // Xử lý response có thể là { user: {...} } hoặc trực tiếp là user object
      const updatedUser = result.user || result;
      setCurrentUser(updatedUser);
      setOriginalProfile({ ...profile });
      setIsEditing(false);

      // Cập nhật localStorage với thông tin mới
      const user = getUser();
      if (user) {
        const updatedUserInfo = { ...user, ...updatedUser };
        localStorage.setItem("user", JSON.stringify(updatedUserInfo));
      }

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
    lose_weight: "Giảm cân",
    gain_weight: "Tăng cân",
    maintain_weight: "Duy trì cân nặng",
    "": "Không chọn",
    // Giữ lại các giá trị cũ để tương thích
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
        <MDBox
          py={3}
          px={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
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
              <MDBox
                display="flex"
                flexDirection="column"
                alignItems="center"
                mb={3}
                position="relative"
              >
                <Avatar
                  src={avatar}
                  alt="Avatar"
                  sx={{
                    width: 120,
                    height: 120,
                    border: "3px solid",
                    borderColor: "grey.300",
                    mb: 2,
                  }}
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
                        {profile.gender === "male"
                          ? "Nam"
                          : profile.gender === "female"
                          ? "Nữ"
                          : "Khác"}
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
                        <MDTypography
                          variant="button"
                          color={bmiCategory.color}
                          fontWeight="medium"
                        >
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
                      <MDTypography variant="button" color="text" >
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
                    Chỉnh sửa
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
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Giới tính</InputLabel>
                      <Select
                        value={profile.gender}
                        onChange={handleChange("gender")}
                        label="Giới tính"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            minHeight: "56px",
                          },
                          "& .MuiSelect-select": {
                            padding: "14px 14px",
                            lineHeight: "2.9",
                          },
                          fontSize: "13px",
                        }}
                      >
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
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel id="goal-label" sx={{ lineHeight: "1.5" }}>
                      Mục tiêu
                    </InputLabel>
                    <Select
                      labelId="goal-label"
                      label="Mục tiêu"
                      value={profile.goal}
                      onChange={handleChange("goal")}
                      sx={{
                        minHeight: "48px",
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                          padding: "14px 14px !important",
                          lineHeight: "1.5",
                          minHeight: "20px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.23)",
                          borderWidth: "1px",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.87)",
                          borderWidth: "1px",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1976d2",
                          borderWidth: "1px",
                        },
                      }}
                    >
                      <MenuItem value="">Không chọn</MenuItem>
                      <MenuItem value="lose_weight">Giảm cân</MenuItem>
                      <MenuItem value="maintain_weight">Duy trì cân nặng</MenuItem>
                      <MenuItem value="gain_weight">Tăng cân</MenuItem>
                    </Select>
                  </FormControl>

                  <Divider sx={{ my: 2 }} />

                  <MDTypography variant="h6" mb={2} fontWeight="medium">
                    Tiền sử dị ứng
                  </MDTypography>
                  <Autocomplete
                    multiple
                    freeSolo
                    limitTags={0}
                    options={ingredients.map((ingredient) => ingredient.name)}
                    value={
                      Array.isArray(profile.allergies) && profile.allergies.length > 0
                        ? profile.allergies
                        : []
                    }
                    onChange={(event, newValue) => {
                      // newValue là array các string (có thể là từ suggestions hoặc tự nhập)
                      const allergiesArray = newValue
                        .map((item) => (typeof item === "string" ? item.trim() : item))
                        .filter(Boolean)
                        .filter((item, index, self) => self.indexOf(item) === index); // Loại bỏ trùng lặp

                      setProfile({
                        ...profile,
                        allergies: allergiesArray,
                        allergy: allergiesArray.join(", "), // Giữ lại để tương thích
                      });
                    }}
                    loading={ingredientsLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Thực phẩm dị ứng"
                        size="small"
                        placeholder="Chọn hoặc nhập tên nguyên liệu dị ứng"
                      />
                    )}
                    renderTags={() => null}
                    filterOptions={(options, params) => {
                      const filtered = options.filter((option) =>
                        option.toLowerCase().includes(params.inputValue.toLowerCase())
                      );

                      // Nếu giá trị nhập không có trong danh sách, thêm vào (freeSolo)
                      if (params.inputValue && !filtered.includes(params.inputValue)) {
                        return [params.inputValue, ...filtered];
                      }

                      return filtered;
                    }}
                  />
                  {/* Hiển thị Chip bên ngoài */}
                  {Array.isArray(profile.allergies) && profile.allergies.length > 0 && (
                    <MDBox
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        mt: 1,
                        mb: 2,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: "grey.50",
                        border: "1px solid",
                        borderColor: "grey.300",
                      }}
                    >
                      {profile.allergies.map((allergy, index) => (
                        <Chip
                          key={index}
                          label={allergy}
                          size="small"
                          variant="outlined"
                          onDelete={() => {
                            const newAllergies = profile.allergies.filter((_, i) => i !== index);
                            setProfile({
                              ...profile,
                              allergies: newAllergies,
                              allergy: newAllergies.join(", "),
                            });
                          }}
                          sx={{
                            "& .MuiChip-deleteIcon": {
                              fontSize: "16px",
                            },
                          }}
                        />
                      ))}
                    </MDBox>
                  )}

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
                      startIcon={
                        saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />
                      }
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
                        ⚠️ Vui lòng nhập đầy đủ thông tin (tuổi, giới tính, chiều cao, cân nặng) để
                        tính toán mục tiêu dinh dưỡng chính xác.
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
                  {statistics.loading ? (
                    <MDBox display="flex" justifyContent="center" alignItems="center" py={4}>
                      <CircularProgress size={24} />
                    </MDBox>
                  ) : (
                    <MDBox display="flex" flexDirection="column" gap={2}>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center">
                        <MDTypography variant="button" color="text">
                          Tổng số món đã phân tích
                        </MDTypography>
                        <MDTypography variant="h6" color="info.main" fontWeight="bold">
                          {statistics.totalAnalyzedRecipes}
                        </MDTypography>
                      </MDBox>
                      <Divider />
                      <MDBox display="flex" justifyContent="space-between" alignItems="center">
                        <MDTypography variant="button" color="text">
                          Số ngày sử dụng
                        </MDTypography>
                        <MDTypography variant="h6" color="success.main" fontWeight="bold">
                          {statistics.totalDaysUsed}{" "}
                          {statistics.totalDaysUsed === 1 ? "ngày" : "ngày"}
                        </MDTypography>
                      </MDBox>
                      <Divider />
                      <MDBox display="flex" justifyContent="space-between" alignItems="center">
                        <MDTypography variant="button" color="text">
                          Tổng số món yêu thích
                        </MDTypography>
                        <MDTypography variant="h6" color="error.main" fontWeight="bold">
                          {statistics.totalFavorites}
                        </MDTypography>
                      </MDBox>
                      {statistics.favoriteRecipes.length > 0 && (
                        <>
                          <Divider />
                          <MDBox display="flex" flexDirection="column" gap={1}>
                            <MDTypography
                              variant="button"
                              color="text"
                              fontWeight="medium"
                              mb={0.5}
                            >
                              Top món ăn yêu thích:
                            </MDTypography>
                            <MDBox display="flex" flexDirection="column" gap={0.5}>
                              {statistics.favoriteRecipes.map((recipe, index) => (
                                <MDTypography
                                  key={recipe._id || index}
                                  variant="caption"
                                  color="text"
                                  sx={{ pl: 1 }}
                                >
                                  {index + 1}. {recipe.name || recipe.recipeId?.name || "Không tên"}
                                </MDTypography>
                              ))}
                            </MDBox>
                          </MDBox>
                        </>
                      )}
                    </MDBox>
                  )}
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
