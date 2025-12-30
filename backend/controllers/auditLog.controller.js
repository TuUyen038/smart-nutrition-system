const AuditLog = require("../models/AuditLog");

/**
 * Lấy danh sách audit logs (CHỈ ADMIN)
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const { 
      userId, 
      resourceType, 
      resourceId, 
      action,
      userEmail,
      startDate,
      endDate,
      page = 1,
      limit = 50 
    } = req.query;

    const query = {};
    
    if (userId) query.userId = userId;
    if (resourceType) query.resourceType = resourceType;
    if (resourceId) query.resourceId = resourceId;
    if (action) query.action = action;
    if (userEmail) query.userEmail = { $regex: userEmail, $options: "i" };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("userId", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      logs,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Lấy chi tiết 1 audit log (CHỈ ADMIN)
 */
exports.getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate("userId", "name email role");
    
    if (!log) {
      return res.status(404).json({ message: "Audit log not found" });
    }
    
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

