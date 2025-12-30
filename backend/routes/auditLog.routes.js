const express = require("express");
const router = express.Router();
const auditLogController = require("../controllers/auditLog.controller");
const { authenticate, authorize } = require("../middlewares/auth");

// Tất cả routes đều cần authentication và chỉ ADMIN
router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", auditLogController.getAuditLogs);
router.get("/:id", auditLogController.getAuditLogById);

module.exports = router;

