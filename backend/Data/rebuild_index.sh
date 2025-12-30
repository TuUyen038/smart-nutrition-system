#!/bin/bash

# Script để rebuild index sau khi import dữ liệu mới
# Usage: ./rebuild_index.sh

echo "🔄 Rebuilding ingredient index after import..."

# Kiểm tra MONGO_URI
if [ -z "$MONGO_URI" ]; then
    echo "❌ MONGO_URI chưa được set"
    echo "Vui lòng set MONGO_URI trước:"
    echo "  export MONGO_URI='mongodb://localhost:27017/smart_nutrition'"
    exit 1
fi

# Chuyển đến thư mục nutrition-mapping
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NUTRITION_MAPPING_DIR="$SCRIPT_DIR/../../nutrition-mapping"

if [ ! -d "$NUTRITION_MAPPING_DIR" ]; then
    echo "❌ Không tìm thấy thư mục nutrition-mapping"
    exit 1
fi

cd "$NUTRITION_MAPPING_DIR"

# Chạy build_index.py
echo "📦 Building index..."
python build_index.py

if [ $? -eq 0 ]; then
    echo "✅ Rebuild index thành công!"
else
    echo "❌ Rebuild index thất bại"
    exit 1
fi

