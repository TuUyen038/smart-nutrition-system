// groqProvider.js
// Groq SDK là optional dependency
let Groq;
try {
  Groq = require('groq-sdk');
} catch (error) {
  console.warn("⚠️ groq-sdk chưa được cài đặt. Chạy: npm install groq-sdk");
  Groq = null;
}
const fs = require('fs');

/**
 * Hàm hỗ trợ: Chuyển đổi dữ liệu file ảnh Multer sang base64.
 * Lưu ý: Groq không hỗ trợ vision trực tiếp, nên sẽ bỏ qua imageFile
 */
function fileToBase64(imageFile) {
  if (!imageFile || !imageFile.path || !imageFile.mimetype) {
    return null;
  }
  if (!fs.existsSync(imageFile.path)) {
    return null;
  }
  return {
    data: Buffer.from(fs.readFileSync(imageFile.path)).toString("base64"),
    mimeType: imageFile.mimetype,
  };
}

class GroqService {
  /**
   * Khởi tạo service với cấu hình tùy chỉnh.
   * @param {string} apiKey - Khóa API Groq
   * @param {string} [defaultModel='llama-3.1-70b-versatile'] - Mô hình mặc định
   */
  constructor(apiKey, defaultModel = 'llama-3.1-70b-versatile') {
    if (!apiKey) {
      throw new Error("Lỗi cấu hình: Groq API Key phải được cung cấp.");
    }
    if (!Groq) {
      throw new Error("Lỗi: groq-sdk chưa được cài đặt. Chạy: npm install groq-sdk");
    }
    this.groq = new Groq({ apiKey });
    this.defaultModel = defaultModel;
  }

  /**
   * Phân tích nội dung (ảnh và/hoặc prompt) với Groq.
   * Lưu ý: Groq không hỗ trợ vision, nếu có imageFile sẽ chỉ dùng prompt
   * @param {object | null} imageFile - Đối tượng file (sẽ bị bỏ qua)
   * @param {string} prompt - Prompt hướng dẫn AI
   * @param {string} [model] - Ghi đè mô hình mặc định
   * @returns {string} - Chuỗi JSON kết quả phân tích
   */
  async analyze(imageFile, prompt, model = this.defaultModel) {
    // Groq không hỗ trợ vision, nếu có imageFile thì thêm note vào prompt
    let finalPrompt = prompt;
    if (imageFile) {
      finalPrompt = `[Lưu ý: Không có ảnh để phân tích, chỉ dựa vào mô tả] ${prompt}`;
      console.warn("⚠️ Groq không hỗ trợ vision, bỏ qua imageFile");
    }

    try {
      console.log(`🤖 [Groq] Đang gọi API với model: ${model}`);
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Bạn là một chuyên gia AI. BẠN PHẢI trả về kết quả dưới dạng JSON hợp lệ, không có markdown code block. Nếu prompt yêu cầu trường 'servings', bạn BẮT BUỘC phải bao gồm trường đó trong JSON response. Không được bỏ qua bất kỳ trường nào được yêu cầu trong prompt."
          },
          {
            role: "user",
            content: finalPrompt
          }
        ],
        model: model,
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const resultText = completion.choices[0]?.message?.content || "";
      console.log(`✅ [Groq] Thành công với model: ${model}`);
      // Làm sạch kết quả
      return resultText.replace(/```json|```/g, '').trim();
    } catch (error) {
      console.error(`❌ [Groq] Lỗi với model ${model}:`, error.message);
      
      // Tạo đối tượng lỗi rõ ràng
      const errorObject = {
        foodName: "Lỗi API/Không xác định",
        errorMessage: error.message || "Lỗi không xác định khi gọi Groq API",
        statusCode: error.status || 500
      };

      return JSON.stringify(errorObject);
    }
  }
}

module.exports = {
  GroqService
};

