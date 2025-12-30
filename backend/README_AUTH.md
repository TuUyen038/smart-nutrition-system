# Hướng dẫn Authentication & Authorization

## Cài đặt Dependencies

```bash
cd backend
npm install jsonwebtoken bcryptjs
```

## Cấu hình Environment Variables

Tạo file `.env` trong thư mục `backend`:

```env
MONGO_URI=mongodb://localhost:27017/smart_nutrition
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## API Endpoints

### Authentication (Public)
- `POST /api/auth/signup` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Yêu cầu reset password
- `POST /api/auth/reset-password` - Reset password với token

### Authentication (Protected)
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/change-password` - Đổi mật khẩu

### User Management (Protected)
- `GET /api/users/me` - Lấy thông tin của chính mình
- `GET /api/users` - Lấy danh sách tất cả users (ADMIN only)
- `GET /api/users/:id` - Lấy thông tin 1 user
- `PUT /api/users/:id` - Cập nhật thông tin user
- `DELETE /api/users/:id` - Xóa user (ADMIN only)

### Audit Logs (ADMIN only)
- `GET /api/audit-logs` - Lấy danh sách audit logs
- `GET /api/audit-logs/:id` - Lấy chi tiết 1 audit log

## Sử dụng Authentication trong Frontend

### 1. Lưu token sau khi login/signup
Token được tự động lưu vào `localStorage` khi login/signup thành công.

### 2. Gửi token trong request
```javascript
import { getToken } from "services/authApi";

const response = await fetch("/api/users", {
  headers: {
    "Authorization": `Bearer ${getToken()}`
  }
});
```

### 3. Kiểm tra authentication
```javascript
import { isAuthenticated, getUser } from "services/authApi";

if (isAuthenticated()) {
  const user = getUser();
  // User đã đăng nhập
}
```

## Phân quyền

### USER
- Xem và chỉnh sửa thông tin của chính mình
- Tạo và quản lý DailyMenu, MealPlan của mình
- Tạo và quản lý Recipes của mình
- Không thể xem thông tin user khác

### ADMIN
- Tất cả quyền của USER
- Xem danh sách tất cả users
- Chỉnh sửa thông tin bất kỳ user nào
- Xóa user
- Quản lý Ingredients và Recipes
- Xem audit logs

## Backup

### Tạo backup
```bash
node backend/scripts/backup.js
```

### Restore từ backup
```bash
node backend/scripts/backup.js --restore=/path/to/backup
```

Backup được lưu trong `backend/backups/` và tự động xóa sau 7 ngày.

## Tạo Admin User

Để tạo user admin đầu tiên, bạn có thể:

1. Tạo user bình thường qua signup
2. Vào MongoDB và update role:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

Hoặc tạo script:
```javascript
// backend/scripts/createAdmin.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function createAdmin() {
  const admin = new User({
    name: "Admin",
    email: "admin@example.com",
    password: await bcrypt.hash("admin123", 10),
    role: "ADMIN"
  });
  
  await admin.save();
  console.log("Admin created:", admin.email);
}
```

