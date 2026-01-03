const User = require("../models/User");
const { upsertNutritionGoal } = require("../services/nutritionGoal.service");
const { logAction } = require("../middlewares/auditLog");
const bcrypt = require("bcryptjs");

/**
 * Lấy danh sách tất cả người dùng (CHỈ ADMIN)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Lấy thông tin user hiện tại (đã đăng nhập)
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Lấy thông tin 1 user theo ID
 * - ADMIN: có thể xem bất kỳ user nào
 * - USER: chỉ có thể xem thông tin của chính mình
 */
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // USER chỉ có thể xem thông tin của chính mình
    if (req.user.role !== "ADMIN" && userId !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Bạn chỉ có thể xem thông tin của chính mình",
      });
    }

    const user = await User.findById(userId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Cập nhật thông tin người dùng
 * - ADMIN: có thể cập nhật bất kỳ user nào
 * - USER: chỉ có thể cập nhật thông tin của chính mình
 * - Không cho phép đổi password ở đây (dùng changePassword)
 * - Không cho phép đổi email
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // USER chỉ có thể cập nhật thông tin của chính mình
    if (req.user.role !== "ADMIN" && userId !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Bạn chỉ có thể cập nhật thông tin của chính mình",
      });
    }

    // Tìm user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Lưu dữ liệu cũ để audit log
    const oldData = user.toObject();
    delete oldData.password;
    delete oldData.resetPasswordToken;
    delete oldData.resetPasswordExpires;

    // Không cho phép đổi password ở đây
    if (req.body.password) {
      return res.status(400).json({
        message:
          "Không thể đổi mật khẩu ở đây. Vui lòng dùng chức năng đổi mật khẩu.",
      });
    }

    // Không cho phép đổi email
    if (req.body.email && req.body.email !== user.email) {
      return res.status(400).json({
        message: "Không thể đổi email",
      });
    }

    // Không cho USER đổi role
    if (req.body.role && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Bạn không có quyền thay đổi role",
      });
    }

    // Cập nhật thông tin (loại bỏ các field không được phép)
    const { password, email, ...updateData } = req.body;

    // Kiểm tra nếu admin đang chỉnh sửa thông tin nhạy cảm của user khác
    const isAdminEditingOtherUser =
      req.user.role === "ADMIN" && userId !== req.user._id.toString();
    const sensitiveFieldsChanged =
      updateData.age !== undefined ||
      updateData.gender !== undefined ||
      updateData.height !== undefined ||
      updateData.weight !== undefined;

    // Nếu admin chỉnh sửa thông tin nhạy cảm, yêu cầu lý do
    if (isAdminEditingOtherUser && sensitiveFieldsChanged && !req.body.reason) {
      return res.status(400).json({
        message:
          "Vui lòng cung cấp lý do khi chỉnh sửa thông tin nhạy cảm (tuổi, giới tính, chiều cao, cân nặng)",
      });
    }

    // Cập nhật user
    Object.assign(user, updateData);
    await user.save();

    // ⚡ Tự động tính và cập nhật lại NutritionGoal nếu có thay đổi thông tin liên quan
    if (
      updateData.age ||
      updateData.gender ||
      updateData.height ||
      updateData.weight ||
      updateData.goal
    ) {
      await upsertNutritionGoal(user);
    }

    // Lấy dữ liệu mới (không có password)
    const newData = user.toObject();
    delete newData.password;
    delete newData.resetPasswordToken;
    delete newData.resetPasswordExpires;

    // Ghi audit log
    await logAction(
      req,
      "UPDATE",
      "User",
      userId,
      oldData,
      newData,
      req.body.reason ||
        (req.user.role === "ADMIN" && userId !== req.user._id.toString()
          ? "Admin updated user information"
          : "User updated profile")
    );

    res.json({
      message: "Cập nhật thông tin thành công",
      user: newData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Xóa người dùng (CHỈ ADMIN)
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Không cho phép xóa chính mình
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        message: "Bạn không thể xóa tài khoản của chính mình",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Lưu dữ liệu cũ để audit log
    const oldData = user.toObject();
    delete oldData.password;
    delete oldData.resetPasswordToken;
    delete oldData.resetPasswordExpires;

    // Xóa user
    await User.findByIdAndDelete(userId);

    // Ghi audit log
    await logAction(
      req,
      "DELETE",
      "User",
      userId,
      oldData,
      null,
      req.body.reason || "Admin deleted user"
    );

    res.json({
      message: "Xóa người dùng thành công",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
