const API_BASE_URL = "http://localhost:3000/api/auth";

/**
 * Đăng ký tài khoản mới
 */
export const signup = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Đăng ký thất bại");
    }

    // Lưu token vào localStorage
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

/**
 * Đăng nhập
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Đăng nhập thất bại");
    }

    // Lưu token vào localStorage
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Đăng xuất
 */
export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

/**
 * Lấy token từ localStorage
 */
export const getToken = () => {
  return localStorage.getItem("authToken");
};

/**
 * Lấy user từ localStorage
 */
export const getUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Kiểm tra đã đăng nhập chưa
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Gửi OTP xác thực email
 */
export const sendVerificationOTP = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/send-verification-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể gửi mã OTP");
    }

    return data;
  } catch (error) {
    console.error("Send verification OTP error:", error);
    throw error;
  }
};

/**
 * Xác thực email với OTP
 */
export const verifyEmail = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Xác thực email thất bại");
    }

    // Cập nhật token và user nếu có
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error("Verify email error:", error);
    throw error;
  }
};

/**
 * Gửi lại OTP xác thực email
 */
export const resendVerificationOTP = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resend-verification-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể gửi lại mã OTP");
    }

    return data;
  } catch (error) {
    console.error("Resend verification OTP error:", error);
    throw error;
  }
};

/**
 * Lấy thông tin user hiện tại từ server
 */
export const getMe = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token không hợp lệ, xóa token
        logout();
      }
      throw new Error(data.message || "Không thể lấy thông tin user");
    }

    // Cập nhật user trong localStorage
    localStorage.setItem("user", JSON.stringify(data));

    return data;
  } catch (error) {
    console.error("Get me error:", error);
    throw error;
  }
};

/**
 * Yêu cầu reset password (gửi OTP)
 */
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể gửi yêu cầu reset password");
    }

    return data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
};

/**
 * Xác thực OTP reset password
 */
export const verifyResetPasswordOTP = async (email, otp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-reset-password-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Xác thực OTP thất bại");
    }

    return data;
  } catch (error) {
    console.error("Verify reset password OTP error:", error);
    throw error;
  }
};

/**
 * Reset password với OTP đã verify
 */
export const resetPassword = async (email, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể reset password");
    }

    return data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

/**
 * Gửi lại OTP reset password
 */
export const resendResetPasswordOTP = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resend-reset-password-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể gửi lại mã OTP");
    }

    return data;
  } catch (error) {
    console.error("Resend reset password OTP error:", error);
    throw error;
  }
};

/**
 * Đổi mật khẩu (khi đã đăng nhập)
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Chưa đăng nhập");
    }

    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Không thể đổi mật khẩu");
    }

    return data;
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
};
