import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/user/authentication/components/CoverLayout";

// API
import { resetPassword } from "services/authApi";

// Images
import bgImage from "assets/images/bg-reset-cover.jpeg";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Lấy email từ location state
    const emailFromState = location.state?.email;
    const otpVerified = location.state?.otpVerified;
    
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      // Nếu không có email hoặc chưa verify OTP, redirect về forgot-password
      navigate("/authentication/forgot-password");
    }

    if (!otpVerified) {
      // Nếu chưa verify OTP, redirect về verify OTP
      navigate("/authentication/verify-reset-otp", {
        state: { email: emailFromState },
      });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, newPassword);
      setSuccess("Đặt lại mật khẩu thành công!");
      
      // Redirect đến sign-in sau 2 giây
      setTimeout(() => {
        navigate("/authentication/sign-in");
      }, 2000);
    } catch (err) {
      setError(err.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CoverLayout coverHeight="50vh" image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          py={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h3" fontWeight="medium" color="white" mt={1}>
            Đặt lại Mật khẩu
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Nhập mật khẩu mới cho tài khoản của bạn
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          <MDBox mb={2}>
            <MDTypography variant="body2" color="text">
              Email: <strong>{email}</strong>
            </MDTypography>
          </MDBox>

          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Mật khẩu mới"
                variant="standard"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
              />
            </MDBox>
            <MDBox mb={4}>
              <MDInput
                type="password"
                label="Xác nhận mật khẩu"
                variant="standard"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </MDBox>
            <MDBox mt={6} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </MDButton>
            </MDBox>
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
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default ResetPassword;
