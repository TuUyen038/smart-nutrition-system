# Hướng dẫn nhanh cấu hình .env

## Cách 1: Tự động (Khuyến nghị)

Chạy script để tự động thêm các key cần thiết:

```bash
cd backend
node scripts/setup-env.js
```

Script sẽ:
- ✅ Kiểm tra file .env hiện tại
- ✅ Thêm các key còn thiếu với giá trị mặc định
- ✅ Giữ nguyên các key đã có (như HF_API_KEY)
- ✅ Tự động generate JWT_SECRET ngẫu nhiên

## Cách 2: Thủ công

### Bước 1: Copy từ template
```bash
cd backend
cp .env.example .env
```

### Bước 2: Generate JWT_SECRET mạnh
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy kết quả và thay thế `CHANGE_THIS_TO_A_RANDOM_SECRET_KEY_MINIMUM_32_CHARACTERS` trong file `.env`

### Bước 3: Kiểm tra MONGO_URI
Đảm bảo `MONGO_URI` đúng với MongoDB của bạn:
- Local: `mongodb://localhost:27017/smart_nutrition`
- Cloud (Atlas): `mongodb+srv://username:password@cluster.mongodb.net/smart_nutrition`

## Các key tối thiểu cần có:

1. **MONGO_URI** - Connection string MongoDB
2. **JWT_SECRET** - Secret key cho JWT (phải đổi!)
3. **JWT_EXPIRES_IN** - Thời gian hết hạn token (mặc định: 7d)
4. **NODE_ENV** - Môi trường (development/production)

## Kiểm tra sau khi setup:

```bash
cd backend
node -e "require('dotenv').config(); console.log('MONGO_URI:', process.env.MONGO_URI ? '✅' : '❌'); console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅' : '❌');"
```

Nếu thấy cả 2 đều ✅ thì đã setup thành công!

