const User = require("../models/User");
const bcrypt = require("bcryptjs");
const AuditLog = require("../models/AuditLog");

/**
 * Tạo admin mặc định nếu chưa có admin nào trong database
 * Chỉ chạy khi chưa có user nào có role ADMIN
 */
async function createDefaultAdmin() {
  try {
    // Kiểm tra xem đã có admin chưa
    const existingAdmin = await User.findOne({ role: "ADMIN" });

    if (existingAdmin) {
      // Chỉ log trong dev mode
      if (process.env.NODE_ENV !== "production") {
        console.log("ℹ️  Admin account already exists");
      }
      return;
    }

    // Tạo admin mặc định
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    const defaultName = process.env.DEFAULT_ADMIN_NAME;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: defaultEmail });
    if (existingUser) {
      // Nếu user đã tồn tại nhưng không phải admin, update role
      const oldRole = existingUser.role;
      existingUser.role = "ADMIN";
      await existingUser.save();

      // Ghi audit log cho việc update role
      try {
        await AuditLog.create({
          userId: existingUser._id,
          userEmail: defaultEmail,
          action: "UPDATE",
          resourceType: "User",
          resourceId: existingUser._id,
          resourceName: existingUser.name,
          oldData: { role: oldRole },
          newData: { role: "ADMIN" },
          ipAddress: "system",
          userAgent: "system-init",
          reason: "Updated existing user to ADMIN role on system startup",
          success: true,
        });
      } catch (auditError) {
        console.error("Failed to log audit for role update:", auditError);
      }

      if (process.env.NODE_ENV !== "production") {
        console.log(`Updated user ${defaultEmail} to ADMIN role`);
      }
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Tạo admin mới
    const admin = new User({
      name: defaultName,
      email: defaultEmail,
      password: hashedPassword,
      role: "ADMIN",
    });

    await admin.save();

    // Ghi audit log (system-init action)
    try {
      await AuditLog.create({
        userId: admin._id,
        userEmail: defaultEmail,
        action: "CREATE",
        resourceType: "User",
        resourceId: admin._id,
        resourceName: defaultName,
        oldData: null,
        newData: { name: defaultName, email: defaultEmail, role: "ADMIN" },
        ipAddress: "system",
        userAgent: "system-init",
        reason: "Default admin account created on system startup",
        success: true,
      });
    } catch (auditError) {
      console.error("Failed to log audit for default admin:", auditError);
    }

    // Console log chỉ để developer biết (có thể xóa hoặc chỉ log trong dev mode)
    if (process.env.NODE_ENV !== "production") {
      console.log("✅ Default admin account created successfully!");
      console.log(`   Email: ${defaultEmail}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log(`   Role: ADMIN`);
      console.log(
        "\n⚠️  IMPORTANT: Change the default password after first login!"
      );
    } else {
      // Production: chỉ log thông báo ngắn gọn, không log password
      console.log(`✅ Default admin account created: ${defaultEmail}`);
    }
  } catch (error) {
    console.error("❌ Error creating default admin:", error.message);
    // Không throw error để không làm gián đoạn app startup
  }
}

module.exports = createDefaultAdmin;
