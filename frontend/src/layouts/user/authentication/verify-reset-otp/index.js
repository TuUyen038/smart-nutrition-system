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
import { verifyResetPasswordOTP, resendResetPasswordOTP } from "services/authApi";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

function VerifyResetOTP() {
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
    // Lấy email từ location state
    const emailFromState = location.state?.email;
    
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      // Nếu không có email, redirect về forgot-password
      navigate("/authentication/forgot-password");
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
      const data = await verifyResetPasswordOTP(email, otp);
      setSuccess("Mã OTP đã được xác thực thành công!");
      
      // Redirect đến reset password sau 1 giây
      setTimeout(() => {
        navigate("/authentication/reset-password", {
          state: { email, otpVerified: true },
        });
      }, 1000);
    } catch (err) {
      setError(err.message || "Xác thực OTP thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      await resendResetPasswordOTP(email);
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
            Xác thực OTP
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Nhập mã OTP đã được gửi đến email của bạn
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

          <MDBox mb={3}>
            <MDTypography variant="body2" color="text">
              Mã OTP đã được gửi đến: <strong>{email}</strong>
            </MDTypography>
          </MDBox>

          <MDBox component="form" role="form" onSubmit={handleVerify}>
            <MDBox mb={3}>
              <MDInput
                type="text"
                label="Mã OTP (6 chữ số)"
                variant="standard"
                fullWidth
                value={otp}
                onChange={handleOtpChange}
                inputProps={{
                  maxLength: 6,
                  pattern: "[0-9]*",
                  inputMode: "numeric",
                  style: {
                    textAlign: "center",
                    fontSize: "24px",
                    letterSpacing: "8px",
                    fontWeight: "bold",
                  },
                }}
                required
                autoFocus
              />
            </MDBox>

            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                type="submit"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Xác thực"
                )}
              </MDButton>
            </MDBox>

            <MDBox mt={2} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Không nhận được mã?{" "}
                {countdown > 0 ? (
                  <MDTypography variant="button" color="text" component="span">
                    Gửi lại sau {countdown}s
                  </MDTypography>
                ) : (
                  <MDTypography
                    component="button"
                    type="button"
                    variant="button"
                    color="info"
                    fontWeight="medium"
                    textGradient
                    onClick={handleResend}
                    disabled={resending}
                    sx={{ border: "none", background: "none", cursor: resending ? "not-allowed" : "pointer" }}
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
                  to="/authentication/forgot-password"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Quay lại
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default VerifyResetOTP;

