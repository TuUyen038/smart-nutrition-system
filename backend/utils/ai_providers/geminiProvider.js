// geminiProvider.js (Nâng cấp)
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

/**
 * Hàm hỗ trợ: Chuyển đổi dữ liệu file ảnh Multer sang PartData.
 * (Giữ nguyên và tách ra khỏi Class/Service)
 */
function fileToGenerativePart(imageFile) {
  if (!imageFile || !imageFile.path || !imageFile.mimetype) {
    throw new Error("Dữ liệu file ảnh bị thiếu hoặc không hợp lệ.");
  }
  // Kiểm tra file tồn tại
  if (!fs.existsSync(imageFile.path)) {
       throw new Error(`[FS Error] File ảnh không tồn tại tại đường dẫn: ${imageFile.path}`);
  }
  
  // Logic đọc file
  // ... (giữ nguyên logic fileToGenerativePart) ...
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(imageFile.path)).toString("base64"),
      mimeType: imageFile.mimetype,
    },
  };
}

// =======================================================================

class GeminiService {
    /**
     * Khởi tạo service với cấu hình tùy chỉnh.
     * @param {string} apiKey - Khóa API riêng biệt cho service này.
     * @param {string} [defaultModel='gemini-2.5-flash'] - Mô hình mặc định.
     */
    constructor(apiKey, defaultModel = 'gemini-2.5-flash') {
        if (!apiKey) {
            throw new Error("Lỗi cấu hình: Gemini API Key phải được cung cấp.");
        }
        // Khởi tạo client riêng cho từng instance
        this.aiClient = new GoogleGenAI({ apiKey }); 
        this.defaultModel = defaultModel;
    }

    /**
     * Phân tích nội dung (ảnh và/hoặc prompt) với các tùy chọn cấu hình.
     * @param {object | null} imageFile - Đối tượng file (null nếu chỉ là prompt)
     * @param {string} prompt - Prompt hướng dẫn AI
     * @param {string} [model] - Ghi đè mô hình mặc định (nếu cần)
     * @returns {string} - Chuỗi JSON kết quả phân tích
     */
    async analyze(imageFile, prompt, model = this.defaultModel) {
        // Tùy chỉnh: Nếu không có imageFile (như các request công thức/dinh dưỡng), contents sẽ khác
        const imagePart = imageFile ? fileToGenerativePart(imageFile) : null;
        
        const contents = imagePart
            ? [{ role: "user", parts: [imagePart, { text: prompt }] }]
            : [{ role: "user", parts: [{ text: prompt }] }]; // Trường hợp chỉ có text

        try {
            console.log(`🤖 [Gemini] Đang gọi API với model: ${model}`);
            const response = await this.aiClient.models.generateContent({
                model: model, 
                contents: contents,
                config: {
                    responseMimeType: "application/json",
                    // Thêm các cấu hình khác nếu cần
                },
            });

            // Xử lý và làm sạch kết quả
            const resultText = response.text;
            console.log(`✅ [Gemini] Thành công với model: ${model}`);
            return resultText.replace(/```json|```/g, '').trim(); 
            
        } catch (error) {
            console.error(`❌ [Gemini] Lỗi với model ${model}:`, error.message);
            console.error("Chi tiết lỗi:", error);
        
        // ⚠️ BẮT BUỘC: Tạo đối tượng lỗi rõ ràng và JSON.stringify nó.
        const errorObject = { 
            foodName: "Lỗi API/Không xác định",
            errorMessage: error.message || "Lỗi không xác định khi gọi AI",
            statusCode: error.status || error.response?.status || 500,
            provider: "gemini"
        };

        // Trả về CHUỖI JSON HỢP LỆ (string)
        return JSON.stringify(errorObject);
        }
    }
}

module.exports = { 
    GeminiService 
};