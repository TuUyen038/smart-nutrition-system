# Hướng dẫn Test các tính năng Authentication & Authorization

## Bước 1: Cài đặt Dependencies

```bash
cd backend
npm install
```

Kiểm tra đã cài thành công:
```bash
npm list jsonwebtoken bcryptjs
```

## Bước 2: Kiểm tra file .env

Đảm bảo file `.env` có đủ các biến:
- ✅ `MONGO_URI` - Connection string MongoDB
- ✅ `JWT_SECRET` - Secret key (đã có)
- ✅ `JWT_EXPIRES_IN` - Thời gian hết hạn (mặc định: 7d)
- ✅ `NODE_ENV` - Môi trường

## Bước 3: Khởi động Backend Server

```bash
cd backend
npm run dev
# hoặc
node index.js
```

Server sẽ chạy trên port 3000 (hoặc port trong .env).

## Bước 4: Test các API Endpoints

### 4.1. Test Signup (Đăng ký)

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "age": 25,
    "gender": "male",
    "height": 175,
    "weight": 70,
    "goal": "maintain_weight"
  }'
```

**Expected Response:**
```json
{
  "message": "Đăng ký thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "USER",
    ...
  }
}
```

**Lưu token để dùng cho các request sau!**

### 4.2. Test Login (Đăng nhập)

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:** Tương tự signup, có token và user info.

### 4.3. Test Get Me (Lấy thông tin user hiện tại)

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "_id": "...",
  "name": "Test User",
  "email": "test@example.com",
  "role": "USER",
  ...
}
```

### 4.4. Test Get Users (ADMIN only)

**Request:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:**
- Nếu là USER → 403 Forbidden
- Nếu là ADMIN → 200 OK với danh sách users

### 4.5. Test Update User

**Request:**
```bash
curl -X PUT http://localhost:3000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "age": 26
  }'
```

**Expected:**
- USER chỉ có thể update của mình
- ADMIN có thể update bất kỳ user nào

### 4.6. Test Forgot Password

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "message": "Link reset password đã được gửi đến email của bạn",
  "resetToken": "abc123..." // Chỉ trong development
}
```

### 4.7. Test Reset Password

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_FORGOT_PASSWORD",
    "newPassword": "newpassword123"
  }'
```

**Expected Response:**
```json
{
  "message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."
}
```

### 4.8. Test Change Password (khi đã đăng nhập)

**Request:**
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

### 4.9. Test Audit Logs (ADMIN only)

**Request:**
```bash
curl -X GET http://localhost:3000/api/audit-logs \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

**Expected:** Danh sách các audit logs

## Bước 5: Test Frontend

### 5.1. Khởi động Frontend

```bash
cd frontend
npm start
# hoặc
npm run dev
```

### 5.2. Test các trang

1. **Sign Up** (`/authentication/sign-up`)
   - Điền form đăng ký
   - Submit
   - Kiểm tra redirect đến dashboard
   - Kiểm tra token đã lưu trong localStorage

2. **Sign In** (`/authentication/sign-in`)
   - Đăng nhập với email/password vừa tạo
   - Kiểm tra redirect
   - Kiểm tra token trong localStorage

3. **Forgot Password** (`/authentication/forgot-password`)
   - Nhập email
   - Submit
   - Kiểm tra nhận được reset token (trong development)

4. **Dashboard**
   - Kiểm tra có thể truy cập sau khi đăng nhập
   - Kiểm tra thông tin user hiển thị đúng

5. **Admin Pages** (nếu là ADMIN)
   - Truy cập `/admin`
   - Truy cập `/admin/users`
   - Kiểm tra có thể xem danh sách users

## Bước 6: Tạo Admin User để test phân quyền

### Cách 1: Update trong MongoDB

```javascript
// Kết nối MongoDB
use smart_nutrition

// Tìm user và update role
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { role: "ADMIN" } }
)
```

### Cách 2: Tạo script

Tạo file `backend/scripts/createAdmin.js`:

```javascript
const User = require("../models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const mongoose = require("mongoose");

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const admin = new User({
    name: "Admin",
    email: "admin@example.com",
    password: await bcrypt.hash("admin123", 10),
    role: "ADMIN"
  });
  
  await admin.save();
  console.log("✅ Admin created:", admin.email);
  process.exit(0);
}

createAdmin();
```

Chạy:
```bash
node backend/scripts/createAdmin.js
```

## Bước 7: Test các trường hợp lỗi

### 7.1. Test Authentication Errors

- ❌ Login với email không tồn tại → 401
- ❌ Login với password sai → 401
- ❌ Request không có token → 401
- ❌ Request với token không hợp lệ → 401
- ❌ Request với token đã hết hạn → 401

### 7.2. Test Authorization Errors

- ❌ USER cố truy cập `/api/users` (ADMIN only) → 403
- ❌ USER cố xem thông tin user khác → 403
- ❌ USER cố sửa thông tin user khác → 403
- ❌ USER cố xóa user → 403

### 7.3. Test Validation Errors

- ❌ Signup không có email → 400
- ❌ Signup password < 6 ký tự → 400
- ❌ Signup email đã tồn tại → 400
- ❌ Update user với password → 400 (phải dùng changePassword)
- ❌ Update user với email khác → 400

## Bước 8: Test Audit Log

1. Thực hiện một số hành động (create, update, delete user)
2. Kiểm tra audit logs:
   ```bash
   curl -X GET http://localhost:3000/api/audit-logs \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```
3. Kiểm tra có ghi lại:
   - Ai thực hiện (userId, email)
   - Hành động gì (CREATE, UPDATE, DELETE)
   - Tài nguyên nào (User, Recipe, etc.)
   - Dữ liệu cũ/mới

## Bước 9: Test Backup

```bash
# Tạo backup
node backend/scripts/backup.js

# Kiểm tra backup đã tạo
ls -la backend/backups/

# Restore từ backup (test)
node backend/scripts/backup.js --restore=backend/backups/backup-2024-01-15
```

## Checklist Test

- [ ] Signup thành công
- [ ] Login thành công
- [ ] Get me trả về đúng thông tin
- [ ] USER không thể xem danh sách users
- [ ] ADMIN có thể xem danh sách users
- [ ] USER chỉ có thể sửa của mình
- [ ] ADMIN có thể sửa bất kỳ user nào
- [ ] Forgot password tạo reset token
- [ ] Reset password thành công
- [ ] Change password thành công
- [ ] Audit log ghi lại các hành động
- [ ] Backup script hoạt động
- [ ] Frontend login/signup hoạt động
- [ ] Frontend redirect đúng sau login

## Tools để test

1. **Postman** - Test API endpoints dễ dàng
2. **curl** - Command line (như ví dụ trên)
3. **Browser DevTools** - Test frontend, xem localStorage, network requests
4. **MongoDB Compass** - Xem database, tạo admin user

## Lưu ý

- Trong development, reset token được trả về trong response (để test)
- Trong production, reset token phải được gửi qua email
- JWT token có thời gian hết hạn (mặc định 7 ngày)
- Backup tự động xóa sau 7 ngày

