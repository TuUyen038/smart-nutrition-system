const mongoose = require("mongoose");
const { upsertNutritionGoal } = require("../services/nutritionGoal.service");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: Number,
  gender: { type: String, enum: ["male", "female", "other"] },
  height: Number,
  weight: Number,
  goal: { type: String, enum: ["lose_weight", "maintain_weight", "gain_weight"] },
  allergies: [String],
}, { timestamps: true });

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
