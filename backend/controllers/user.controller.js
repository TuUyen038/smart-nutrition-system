const User = require("../models/User");
const { upsertNutritionGoal } = require("../services/nutritionGoal.service");

// Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy thông tin 1 user theo ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // chuyển sang object thường để xóa trường
    const data = user.toObject();
    delete data.password;
    delete data.tokens;
    delete data.__v;

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Tạo tài khoản user mới
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, age, gender, height, weight, allergies } = req.body;

    // Kiểm tra trùng email
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const newUser = new User({
      name,
      email,
      password, // nếu có bcrypt thì mã hóa tại đây
      age,
      gender,
      height,
      weight,
      allergies
    });

    await newUser.save();
    res.status(200).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    // ⚡ Tự động tính và cập nhật lại NutritionGoal
    const updatedGoal = await upsertNutritionGoal(user);

    res.json({
      message: "User and nutrition goal updated successfully",
      user,
      nutritionGoal: updatedGoal
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
