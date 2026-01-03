const mongoose = require("mongoose");
const { upsertNutritionGoal } = require("../services/nutritionGoal.service");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    age: Number,
    gender: { type: String, enum: ["male", "female", "other"] },
    height: Number,
    weight: Number,
    goal: {
      type: String,
      enum: ["lose_weight", "maintain_weight", "gain_weight"],
    },
    allergies: [String],
    // Favorite recipes
    favoriteRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
    // Password reset (dùng OTP)
    resetPasswordOTP: String,
    resetPasswordOTPExpires: Date,
    resetPasswordOTPVerified: { type: Boolean, default: false }, // Đánh dấu OTP đã được verify
    // Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOTP: String,
    emailVerificationOTPExpires: Date,
  },
  { timestamps: true }
);

userSchema.post("save", async function (doc, next) {
  try {
    // ⚠️ Chỉ chạy khi đủ thông tin để tính
    if (doc.age && doc.gender && doc.height && doc.weight) {
      await upsertNutritionGoal(doc);
    }
    next();
  } catch (error) {
    console.error("❌ Failed to update nutrition goal:", error);
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
