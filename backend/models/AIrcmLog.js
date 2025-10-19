const mongoose = require("mongoose");

const aiRcmLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recommend_data: Object, // lưu JSON gợi ý món ăn
  create_at: { type: Date, default: Date.now },
  status: { type: String, enum: ["success", "failed", "pending"], default: "pending" },
  type: { type: String, enum: ["meal", "ingredient", "nutrition"] }
});

module.exports = mongoose.model("AIrcmLog", aiRcmLogSchema);
