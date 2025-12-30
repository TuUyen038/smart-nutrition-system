const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { logAction } = require("../middlewares/auditLog");

// Helper function để tạo JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "your-secret-key-change-in-production",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * Đăng ký tài khoản mới
 */
exports.signup = async (req, res) => {
  try {
    const { name, email, password, age, gender, height, weight, goal, allergies } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Vui lòng điền đầy đủ thông tin: tên, email và mật khẩu" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Mật khẩu phải có ít nhất 6 ký tự" 
      });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email này đã được sử dụng" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "USER", // Mặc định là USER
      age,
      gender,
      height,
      weight,
      goal,
      allergies: allergies || [],
    });

    await newUser.save();

    // Tạo token
    const token = generateToken(newUser._id);

    // Ghi audit log
    await logAction(
      req,
      "CREATE",
      "User",
      newUser._id,
      null,
      { name: newUser.name, email: newUser.email, role: newUser.role },
      "User signup"
    );

    // Trả về user (không có password) và token
    const userData = newUser.toObject();
    delete userData.password;
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpires;

    res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      message: "Lỗi khi đăng ký: " + error.message 
    });
  }
};

/**
 * Đăng nhập
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Vui lòng nhập email và mật khẩu" 
      });
    }

    // Tìm user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Ghi log đăng nhập thất bại
      await logAction(
        req,
        "LOGIN",
        "Auth",
        null,
        null,
        null,
        `Failed login attempt: email ${email} not found`
      );
      return res.status(401).json({ 
        message: "Email hoặc mật khẩu không đúng" 
      });
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Ghi log đăng nhập thất bại
      await logAction(
        req,
        "LOGIN",
        "Auth",
        user._id,
        null,
        null,
        `Failed login attempt: wrong password for ${user.email}`
      );
      return res.status(401).json({ 
        message: "Email hoặc mật khẩu không đúng" 
      });
    }

    // Tạo token
    const token = generateToken(user._id);

    // Ghi audit log
    await logAction(
      req,
      "LOGIN",
      "Auth",
      user._id,
      null,
      { email: user.email, role: user.role },
      "User login"
    );

    // Trả về user (không có password) và token
    const userData = user.toObject();
    delete userData.password;
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpires;

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      message: "Lỗi khi đăng nhập: " + error.message 
    });
  }
};

/**
 * Yêu cầu reset password (Forgot Password)
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: "Vui lòng nhập email" 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Không tiết lộ nếu email không tồn tại (bảo mật)
    if (!user) {
      // Vẫn trả về success để không tiết lộ email có tồn tại hay không
      return res.json({ 
        message: "Nếu email tồn tại, chúng tôi đã gửi link reset password" 
      });
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Lưu token và thời gian hết hạn (1 giờ)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 giờ
    await user.save();

    // Ghi audit log
    await logAction(
      req,
      "PASSWORD_RESET_REQUEST",
      "Auth",
      user._id,
      null,
      null,
      `Password reset requested for ${user.email}`
    );

    // TODO: Gửi email với reset token
    // Trong production, bạn nên gửi email thật
    // Ví dụ: await sendResetPasswordEmail(user.email, resetToken);
    
    // Tạm thời trả về token trong response (CHỈ ĐỂ TEST, không làm vậy trong production!)
    // Trong production, token phải được gửi qua email
    res.json({
      message: "Link reset password đã được gửi đến email của bạn",
      // ⚠️ CHỈ ĐỂ TEST - XÓA DÒNG NÀY TRONG PRODUCTION
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      message: "Lỗi khi xử lý yêu cầu reset password: " + error.message 
    });
  }
};

/**
 * Reset password với token
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: "Vui lòng cung cấp token và mật khẩu mới" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "Mật khẩu phải có ít nhất 6 ký tự" 
      });
    }

    // Hash token để so sánh
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Tìm user với token hợp lệ và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Token không hợp lệ hoặc đã hết hạn" 
      });
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Lưu password mới và xóa reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Ghi audit log
    await logAction(
      req,
      "PASSWORD_RESET",
      "Auth",
      user._id,
      null,
      null,
      `Password reset successful for ${user.email}`
    );

    res.json({ 
      message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." 
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ 
      message: "Lỗi khi đặt lại mật khẩu: " + error.message 
    });
  }
};

/**
 * Đổi mật khẩu (khi đã đăng nhập)
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "Mật khẩu mới phải có ít nhất 6 ký tự" 
      });
    }

    // Lấy user với password
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        message: "User không tồn tại" 
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Mật khẩu hiện tại không đúng" 
      });
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Ghi audit log
    await logAction(
      req,
      "PASSWORD_RESET",
      "Auth",
      user._id,
      null,
      null,
      `Password changed by user ${user.email}`
    );

    res.json({ 
      message: "Đổi mật khẩu thành công" 
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ 
      message: "Lỗi khi đổi mật khẩu: " + error.message 
    });
  }
};

/**
 * Lấy thông tin user hiện tại (sau khi đăng nhập)
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -resetPasswordToken -resetPasswordExpires");
    
    if (!user) {
      return res.status(404).json({ 
        message: "User không tồn tại" 
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ 
      message: "Lỗi khi lấy thông tin user: " + error.message 
    });
  }
};

