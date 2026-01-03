import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/user/authentication/components/BasicLayout";

// API
import { forgotPassword } from "services/authApi";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const data = await forgotPassword(email);
      setSuccess(true);
      
      // Nếu cần verify OTP, redirect đến trang verify
      if (data.requiresOTPVerification) {
        setTimeout(() => {
          navigate("/authentication/verify-reset-otp", {
            state: { email },
          });
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Không thể gửi yêu cầu reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={4}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Quên mật khẩu
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Mã OTP đã được gửi đến email của bạn. Đang chuyển đến trang xác thực...
            </Alert>
          )}
          {!success ? (
            <MDBox component="form" role="form" onSubmit={handleSubmit}>
              <MDBox mb={2}>
                <MDInput
                  type="email"
                  label="Email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </MDBox>
              <MDBox mt={4} mb={1}>
                <MDButton
                  variant="gradient"
                  color="info"
                  fullWidth
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                </MDButton>
              </MDBox>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="text">
                  Nhớ mật khẩu?{" "}
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
          ) : (
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Quay lại đăng nhập
                </MDTypography>
              </MDTypography>
            </MDBox>
          )}
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default ForgotPassword;

