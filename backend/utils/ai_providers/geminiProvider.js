const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

// Đảm bảo khóa API được cấu hình
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("LỖI CẤU HÌNH: Biến môi trường GEMINI_API_KEY không được tìm thấy.");
    // Thay vì crash, có thể ném lỗi hoặc dùng một key rỗng (nhưng API call sẽ thất bại)
    // Tuy nhiên, lỗi hiện tại cho thấy nó crash ngay lúc khởi tạo.
    // Nếu bạn muốn server khởi động mà không cần key ngay lập tức (cho các route khác),
    // bạn có thể khởi tạo GoogleGenAI bên trong analyzeWithGemini.
}

// Khởi tạo GoogleGenAI bằng cách truyền đối tượng cấu hình rõ ràng
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); 
const modelName = "gemini-2.5-flash"; 

/**
 * Chuyển đổi dữ liệu file ảnh Multer sang định dạng PartData cho Gemini API
 * @param {object} imageFile - Đối tượng file từ Multer (có path, mimetype, size)
 * @returns {object} - Dữ liệu PartData cho Gemini
 */
function fileToGenerativePart(imageFile) {
  // Lỗi xảy ra ở đây vì imageFile có thể là undefined/null
  if (!imageFile || !imageFile.path || !imageFile.mimetype) {
    throw new Error("Dữ liệu file ảnh bị thiếu hoặc không hợp lệ.");
  }
  
  // KIỂM TRA QUAN TRỌNG: Đảm bảo thuộc tính size tồn tại trước khi dùng
  if (imageFile.size === undefined) {
      console.warn("File object is missing 'size' property. Using fs.statSync.");
      // Nếu Multer không cung cấp size, hãy cố gắng đọc từ FS
      try {
          const stats = fs.statSync(imageFile.path);
          imageFile.size = stats.size;
      } catch (e) {
          throw new Error(`[FS Error] Không thể đọc kích thước file tại đường dẫn: ${imageFile.path}`);
      }
  }

  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(imageFile.path)).toString("base64"),
      mimeType: imageFile.mimetype,
    },
  };
}

/**
 * Phân tích món ăn bằng Gemini API.
 * @param {object} imageFile - Đối tượng file từ Multer
 * @param {string} prompt - Prompt để hướng dẫn AI
 * @returns {string} - Chuỗi JSON kết quả phân tích
 */
const analyzeWithGemini = async (imageFile, prompt) => {
  try {
    const imagePart = fileToGenerativePart(imageFile); // Dòng 30

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        { role: "user", parts: [imagePart, { text: prompt }] },
      ],
      // Cấu hình để yêu cầu JSON
      config: {
          responseMimeType: "application/json",
          // ... (thêm responseSchema nếu cần)
      }
    });

    const resultText = response.text;
    
    // Đảm bảo không có code block Markdown
    return resultText.replace(/```json|```/g, '').trim(); 
    
  } catch (error) {
    console.error("Lỗi trong analyzeWithGemini:", error);
    // Ném lỗi mới để controller xử lý
    throw new Error(`[GEMINI Error] ${error.message || 'Lỗi không xác định khi gọi Gemini API'}`);
  }
};

module.exports = { analyzeWithGemini };
