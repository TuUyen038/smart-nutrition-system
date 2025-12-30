const AuditLog = require("../models/AuditLog");

/**
 * Hàm để ghi audit log
 */
async function logAction(req, action, resourceType, resourceId, oldData, newData, reason) {
  try {
    // Lấy thông tin user từ request
    const userId = req.user?.id || req.user?._id || null;
    const userEmail = req.user?.email || "anonymous";
    
    // Lấy thông tin request
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers["x-forwarded-for"] || "unknown";
    const userAgent = req.get("user-agent") || "unknown";
    
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

