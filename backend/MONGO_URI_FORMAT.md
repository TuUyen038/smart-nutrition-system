# Format MONGO_URI

## Local MongoDB (Khuyến nghị cho development)

```
MONGO_URI=mongodb://localhost:27017/smart_nutrition
```

**Giải thích:**
- `mongodb://` - Protocol
- `localhost:27017` - Host và port (27017 là port mặc định của MongoDB)
- `smart_nutrition` - Tên database

## MongoDB với Authentication

```
MONGO_URI=mongodb://username:password@localhost:27017/smart_nutrition
```

## MongoDB Atlas (Cloud)

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_nutrition
```

**Lưu ý:**
- Dùng `mongodb+srv://` cho Atlas
- Thay `username`, `password`, `cluster` bằng thông tin thực tế của bạn

## Kiểm tra URI đúng

### Test connection với mongosh:
```bash
mongosh mongodb://localhost:27017/smart_nutrition
```

### Test connection với Python:
```python
from pymongo import MongoClient
client = MongoClient("mongodb://localhost:27017/smart_nutrition")
client.admin.command('ping')
print("✅ Connected!")
```

## Ví dụ URI cho các trường hợp

### 1. Local MongoDB (không auth)
```
MONGO_URI=mongodb://localhost:27017/smart_nutrition
```

### 2. Local MongoDB (có auth)
```
MONGO_URI=mongodb://admin:password123@localhost:27017/smart_nutrition
```

### 3. MongoDB Atlas
```
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/smart_nutrition?retryWrites=true&w=majority
```

### 4. MongoDB với IP cụ thể
```
MONGO_URI=mongodb://192.168.1.100:27017/smart_nutrition
```

## Lưu ý quan trọng

1. **Không có khoảng trắng** trong URI
2. **Password có ký tự đặc biệt** cần URL encode:
   - `@` → `%40`
   - `:` → `%3A`
   - `/` → `%2F`
   - `#` → `%23`
   - `?` → `%3F`

3. **Database name** (`smart_nutrition`) có thể thay đổi, nhưng phải khớp với:
   - Database trong MongoDB
   - `MONGO_DB` trong `build_index.py` (nếu dùng)

## Kiểm tra URI hiện tại

Nếu bạn muốn xem URI hiện tại trong `.env`:

```bash
cd /Users/tuantq/UyenTTT/khuyennghidinhduong/backend
grep MONGO_URI .env
```

Hoặc trong Node.js:
```javascript
console.log(process.env.MONGO_URI);
```

