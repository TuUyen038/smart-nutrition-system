# Hướng dẫn Import và Rebuild Index

## Workflow đầy đủ

Sau khi có dữ liệu mới trong Excel, bạn cần làm 2 bước:

### Bước 1: Import dữ liệu vào MongoDB

```bash
cd /Users/tuantq/UyenTTT/khuyennghidinhduong/backend
node Data/import_ingredients.js
```

Script này sẽ:
- ✅ Đọc file `Data/data.xlsx`
- ✅ Xóa dữ liệu cũ trong collection `ingredients`
- ✅ Import dữ liệu mới vào MongoDB

### Bước 2: Rebuild Index (QUAN TRỌNG!)

Sau khi import, **bắt buộc** phải rebuild index để model có thể sử dụng dữ liệu mới.

#### Cách 1: Dùng script helper (Khuyến nghị)

```bash
cd /Users/tuantq/UyenTTT/khuyennghidinhduong/backend
node Data/rebuild_index.js
```

#### Cách 2: Chạy trực tiếp

```bash
cd /Users/tuantq/UyenTTT/nutrition-mapping
MONGO_URI="mongodb://localhost:27017/smart_nutrition" python build_index.py
```

#### Cách 3: Dùng shell script

```bash
cd /Users/tuantq/UyenTTT/khuyennghidinhduong/backend/Data
chmod +x rebuild_index.sh
./rebuild_index.sh
```

---

## Tại sao cần rebuild index?

- **Index** là file FAISS chứa embeddings của tất cả nguyên liệu
- Khi import dữ liệu mới, index cũ không có thông tin về nguyên liệu mới
- Model mapping sẽ không tìm thấy nguyên liệu mới nếu không rebuild index

---

## Workflow tự động (Tùy chọn)

Bạn có thể tạo script để chạy cả 2 bước một lúc:

```bash
# Tạo file: Data/import_and_rebuild.sh
#!/bin/bash
node Data/import_ingredients.js && node Data/rebuild_index.js
```

Sau đó chạy:
```bash
chmod +x Data/import_and_rebuild.sh
./Data/import_and_rebuild.sh
```

---

## Kiểm tra kết quả

Sau khi rebuild, kiểm tra:

1. **Index file được tạo:**
   ```bash
   ls -lh /Users/tuantq/UyenTTT/nutrition-mapping/embeddings/e5_base/index.faiss
   ```

2. **Mapping file được tạo:**
   ```bash
   ls -lh /Users/tuantq/UyenTTT/nutrition-mapping/embeddings/e5_base/mapping.pkl
   ```

3. **Số lượng ingredients trong index:**
   - Script sẽ hiển thị: `✅ Loaded X ingredients from Mongo.`
   - Và: `📊 Statistics: - Ingredients: X`

---

## Lưu ý

- ⚠️ **Luôn rebuild index sau khi import dữ liệu mới**
- ⚠️ **Index cũ sẽ không có thông tin về nguyên liệu mới**
- ✅ **Rebuild index không ảnh hưởng đến dữ liệu trong MongoDB**
- ✅ **Có thể rebuild nhiều lần mà không lo lắng**

---

## Troubleshooting

### Lỗi: "No documents found"
- Kiểm tra import đã thành công chưa
- Kiểm tra database/collection name đúng chưa

### Lỗi: "Invalid MONGO_URI"
- Kiểm tra MONGO_URI trong `.env` file
- Format: `mongodb://localhost:27017/smart_nutrition`

### Lỗi: "Failed to connect to MongoDB"
- Kiểm tra MongoDB đang chạy: `mongosh mongodb://localhost:27017`
- Kiểm tra MONGO_URI đúng chưa

