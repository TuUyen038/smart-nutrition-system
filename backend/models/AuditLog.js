const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  // Ai thực hiện
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  userEmail: { type: String, required: true },
  
  // Hành động gì
  action: { 
    type: String, 
    enum: [
      "CREATE", "UPDATE", "DELETE", 
      "LOGIN", "LOGOUT", 
      "VERIFY", "UNVERIFY",
      "PASSWORD_RESET_REQUEST", "PASSWORD_RESET"
    ],
    required: true 
  },
  
  // Tài nguyên nào
  resourceType: { 
    type: String, 
    enum: ["User", "Ingredient", "Recipe", "DailyMenu", "MealPlan", "Auth"],
    required: true 
  },
  
  // ID của tài nguyên
  resourceId: { 
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  
  // Tên/Thông tin của tài nguyên
  resourceName: String,
  
  // Dữ liệu cũ (trước khi thay đổi)
  oldData: mongoose.Schema.Types.Mixed,
  
  // Dữ liệu mới (sau khi thay đổi)
  newData: mongoose.Schema.Types.Mixed,
  
  // IP address
  ipAddress: String,
  
  // User agent
  userAgent: String,
  
  // Lý do
  reason: String,
  
  // Kết quả
  success: { type: Boolean, default: true },
  errorMessage: String,
  
}, { timestamps: true });

// Index để tìm kiếm nhanh
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userEmail: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

