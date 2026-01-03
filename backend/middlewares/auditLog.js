const AuditLog = require("../models/AuditLog");

/**
 * Hàm để ghi audit log
 * @param {Object} req - Express request object
 * @param {String} action - Hành động (CREATE, UPDATE, DELETE, LOGIN, etc.)
 * @param {String} resourceType - Loại tài nguyên (User, Recipe, etc.)
 * @param {String|ObjectId} resourceId - ID của tài nguyên (optional)
 * @param {Object} oldData - Dữ liệu cũ (optional)
 * @param {Object} newData - Dữ liệu mới (optional)
 * @param {String} reason - Lý do (optional)
 * @param {String|ObjectId} userIdOverride - User ID override (dùng khi req.user chưa có, như LOGIN)
 * @param {String} userEmailOverride - User email override (dùng khi req.user chưa có)
 */
async function logAction(req, action, resourceType, resourceId, oldData, newData, reason, userIdOverride = null, userEmailOverride = null) {
  try {
    // Lấy thông tin user từ request hoặc override
    let userId = userIdOverride || req.user?.id || req.user?._id || null;
    let userEmail = userEmailOverride || req.user?.email || "anonymous";
    
    // Nếu vẫn không có userId và action là LOGIN, dùng resourceId làm userId
    if (!userId && action === "LOGIN" && resourceId) {
      userId = resourceId;
    }
    
    // Nếu vẫn không có userId, không thể tạo audit log (required field)
    if (!userId) {
      console.warn("⚠️  Cannot create audit log: userId is required but not available");
      return;
    }
    
    // Lấy thông tin request
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers["x-forwarded-for"] || "unknown";
    const userAgent = req?.get?.("user-agent") || "unknown";
    
    // Lấy resource name nếu có
    let resourceName = null;
    if (newData?.name) resourceName = newData.name;
    else if (oldData?.name) resourceName = oldData.name;
    else if (newData?.email) resourceName = newData.email;
    else if (oldData?.email) resourceName = oldData.email;
    
    await AuditLog.create({
      userId,
      userEmail,
      action,
      resourceType,
      resourceId: resourceId || null,
      resourceName,
      oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : null, // Deep copy để tránh reference
      newData: newData ? JSON.parse(JSON.stringify(newData)) : null,
      ipAddress,
      userAgent,
      reason,
      success: true,
    });
  } catch (error) {
    console.error("❌ Failed to log audit:", error);
    // Không throw error để không làm gián đoạn request
  }
}

/**
 * Middleware để tự động ghi log cho các hành động DELETE
 */
exports.logDelete = async (req, res, next) => {
  // Lưu lại resource trước khi xóa
  const originalSend = res.json;
  res.json = async function(data) {
    // Nếu thành công và có resourceId
    if (res.statusCode === 200 && req.resourceToDelete) {
      await logAction(
        req,
        "DELETE",
        req.resourceType,
        req.params.id,
        req.resourceToDelete,
        null,
        req.body.reason || "Deleted"
      );
    }
    return originalSend.call(this, data);
  };
  next();
};

module.exports = { logAction };

