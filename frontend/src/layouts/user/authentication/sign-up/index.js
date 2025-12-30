import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/user/authentication/components/CoverLayout";

// API
import { signup } from "services/authApi";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

function Cover() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      // Loại bỏ confirmPassword trước khi gửi
      const { confirmPassword, ...signupData } = formData;
      
      // Chuyển đổi số
      if (signupData.age) signupData.age = parseInt(signupData.age);
      if (signupData.height) signupData.height = parseFloat(signupData.height);
      if (signupData.weight) signupData.weight = parseFloat(signupData.weight);
      
      // Loại bỏ các field rỗng
      Object.keys(signupData).forEach(key => {
        if (signupData[key] === "" || signupData[key] === null) {
          delete signupData[key];
        }
      });

      const data = await signup(signupData);
      
      // Redirect đến dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Đăng ký
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Nhập thông tin để tạo tài khoản mới
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Tên"
                variant="standard"
                fullWidth
                value={formData.name}
                onChange={handleChange("name")}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                variant="standard"
                fullWidth
                value={formData.email}
                onChange={handleChange("email")}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Mật khẩu"
                variant="standard"
                fullWidth
                value={formData.password}
                onChange={handleChange("password")}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Xác nhận mật khẩu"
                variant="standard"
                fullWidth
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                required
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="number"
                label="Tuổi"
                variant="standard"
                fullWidth
                value={formData.age}
                onChange={handleChange("age")}
                inputProps={{ min: 0, max: 150 }}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                select
                label="Giới tính"
                variant="standard"
                fullWidth
                value={formData.gender}
                onChange={handleChange("gender")}
              >
                <MenuItem value="">Không chọn</MenuItem>
                <MenuItem value="male">Nam</MenuItem>
                <MenuItem value="female">Nữ</MenuItem>
                <MenuItem value="other">Khác</MenuItem>
              </MDInput>
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="number"
                label="Chiều cao (cm)"
                variant="standard"
                fullWidth
                value={formData.height}
                onChange={handleChange("height")}
                inputProps={{ min: 0, step: "any" }}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="number"
                label="Cân nặng (kg)"
                variant="standard"
                fullWidth
                value={formData.weight}
                onChange={handleChange("weight")}
                inputProps={{ min: 0, step: "any" }}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                select
                label="Mục tiêu"
                variant="standard"
                fullWidth
                value={formData.goal}
                onChange={handleChange("goal")}
              >
                <MenuItem value="">Không chọn</MenuItem>
                <MenuItem value="lose_weight">Giảm cân</MenuItem>
                <MenuItem value="maintain_weight">Duy trì cân nặng</MenuItem>
                <MenuItem value="gain_weight">Tăng cân</MenuItem>
              </MDInput>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Đã có tài khoản?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Đăng nhập
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
