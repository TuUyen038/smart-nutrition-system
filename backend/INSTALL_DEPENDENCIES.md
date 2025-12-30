# Hướng dẫn cài đặt Dependencies

## Cài đặt các dependencies cần thiết cho Authentication

Do có vấn đề với permission trong sandbox, bạn cần chạy lệnh này **trực tiếp trong terminal của bạn**:

```bash
cd backend
npm install jsonwebtoken bcryptjs
```

Hoặc nếu muốn cài tất cả dependencies (bao gồm cả các dependencies mới):

```bash
cd backend
npm install
```

## Kiểm tra đã cài thành công

Sau khi cài xong, kiểm tra:

```bash
cd backend
npm list jsonwebtoken bcryptjs
```

Nếu thấy version hiển thị thì đã cài thành công!

## Các dependencies đã được thêm vào package.json

- `jsonwebtoken` - Để tạo và verify JWT tokens
- `bcryptjs` - Để hash và verify passwords

## Lưu ý

Nếu gặp lỗi permission, thử:

1. Chạy với `sudo` (macOS/Linux): `sudo npm install jsonwebtoken bcryptjs`
2. Hoặc sử dụng `npm install --legacy-peer-deps` nếu có conflict
