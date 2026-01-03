import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/user/authentication/components/CoverLayout";

// API
import { verifyEmail, resendVerificationOTP } from "services/authApi";
import { getUser } from "services/authApi";

// Images
const bgImage = "https://res.cloudinary.com/denhj5ubh/image/upload/v1767413364/bgr_vom478.jpg";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Lấy email từ location state hoặc từ user đã đăng nhập
    const user = getUser();
    const emailFromState = location.state?.email;

    if (emailFromState) {
      setEmail(emailFromState);
    } else if (user?.email) {
      setEmail(user.email);
    } else {
      // Nếu không có email, redirect về sign-in
      navigate("/authentication/sign-in");
    }
  }, [location, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Vui lòng nhập mã OTP 6 chữ số");
      return;
    }

    setLoading(true);

    try {
      const data = await verifyEmail(email, otp);
      setSuccess("Email đã được xác thực thành công!");

      // Redirect sau 2 giây
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err.message || "Xác thực email thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      await resendVerificationOTP(email);
      setSuccess("Mã OTP mới đã được gửi đến email của bạn");
      setCountdown(60); // 60 giây cooldown
    } catch (err) {
      setError(err.message || "Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Chỉ cho phép số
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: "500px", md: "600px" },
          mx: "auto",
        }}
      >
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={{ xs: 1, sm: 2 }}
          mt={-6}
          p={{ xs: 2, sm: 3 }}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Xác thực Email
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Nhập mã OTP đã được gửi đến email của bạn
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={4} px={{ xs: 2, sm: 3, md: 4 }}>
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

          <MDBox mb={3}>
            <MDTypography variant="body2" color="text">
              Mã OTP đã được gửi đến: <strong>{email}</strong>
            </MDTypography>
          </MDBox>

          <MDBox component="form" role="form" onSubmit={handleVerify}>
            <MDBox mb={4}>
              <MDInput
                type="text"
                label="Mã OTP (6 chữ số)"
                variant="outlined"
                fullWidth
                value={otp}
                onChange={handleOtpChange}
                inputProps={{
                  maxLength: 6,
                  pattern: "[0-9]*",
                  inputMode: "numeric",
                  style: {
                    textAlign: "center",
                    fontSize: "22px",
                    letterSpacing: "8px",
                    fontWeight: "bold",
                    padding: "14px 14px",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: "50px",
                  },
                  "& .MuiInputLabel-root": {
                    lineHeight: "1.5",
                  },
                }}
                required
                autoFocus
              />
            </MDBox>

            <MDBox mt={6} mb={2}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={loading || otp.length !== 6}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Xác thực"}
              </MDButton>
            </MDBox>

            <MDBox mt={1} mb={2} textAlign="right">
              <MDTypography variant="body2" color="text" sx={{ fontSize: "0.875rem" }}>
                Không nhận được mã?{" "}
                {countdown > 0 ? (
                  <MDTypography
                    component="span"
                    variant="body2"
                    color="text"
                    sx={{ opacity: 0.7, fontSize: "0.875rem" }}
                  >
                    Gửi lại sau {countdown}s
                  </MDTypography>
                ) : (
                  <MDTypography
                    component="button"
                    type="button"
                    variant="body2"
                    color="info"
                    onClick={handleResend}
                    disabled={resending}
                    sx={{
                      fontSize: "0.875rem",
                      border: "none",
                      background: "none",
                      cursor: resending ? "not-allowed" : "pointer",
                      textDecoration: "underline",
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {resending ? "Đang gửi..." : "Gửi lại mã"}
                  </MDTypography>
                )}
              </MDTypography>
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

export default VerifyEmail;
