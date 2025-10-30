const fs = require('fs');
// Đảm bảo các module khác cũng đã được chuyển sang CommonJS hoặc là ES Module có đuôi .js
const { analyzeFoodImage } = require('../utils/ai_providers/aiInterface'); 
const Analysis = require('../models/Analysis');

// Hàm chính xử lý logic phân tích
const analyzeImage = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng cung cấp file ảnh.' });
  }

  const imageFile = req.file; // Multer đã gắn file vào đây
  // Lấy provider/model được yêu cầu từ body, hoặc dùng mặc định 'gemini'
  const modelToUse = req.body.model || 'gemini'; 

  // Prompt chi tiết cho AI (đã được định nghĩa sẵn, sẽ được gửi qua analyzeFoodImage)
  // LƯU Ý: Prompt này nên được đặt trong utils/ai_providers/geminiProvider.js 
  // HOẶC được gửi từ controller nếu bạn muốn linh hoạt, như cách bạn đang làm.
  //  2.  **Đưa ra công thức nấu món đó** và nêu rõ khẩu phần, khối lượng từng nguyên liệu.
  // 3.  **Phân tích dinh dưỡng** từ định lượng và nguyên liệu đưa ra trong công thức món ăn, tính toán dinh dưỡng của món đó.
  // 4.  **Đưa ra khuyến nghị, nhắc nhở, cảnh báo** món ăn này chứa quá nhiều đường, hoặc nhiều chất béo, hoặc món ăn này không phù hợp với người ăn chay chẳng hạn.
  // "recipe": "Công thức nấu món ăn (Tiếng Việt)",
  //   "totalNutrition": {
  //     "calories": "Tổng Calo ước tính (ví dụ: 650)",
  //     "protein": "Chất Đạm (g)",
  //     "carbs": "Carbohydrate (g)",
  //     "fat": "Chất Béo (g)",
  //     "fiber": "Chất Xơ (g)",
  //     "sugar": "Đường (mg)",
  //     "sodium": "Natri (mg)"
  //   },
  //   "Recommendation": {
  //     "phuHopVoi": ["Chế độ ăn phù hợp (ví dụ: Nạp năng lượng, Bổ sung đạm)"],
  //     "canCaiThien": "Khuyến nghị cải thiện bữa ăn này (ví dụ: Thêm rau xanh để tăng chất xơ)"
  //   }
  const prompt = `
  Bạn là một chuyên gia dinh dưỡng và ẩm thực. Nhiệm vụ của bạn là:
  1.  **Nhận diện món ăn chính** trong hình ảnh (bằng tiếng Việt).
 
  **QUAN TRỌNG:** Phản hồi của bạn phải là một **đối tượng JSON** duy nhất, không thêm bất kỳ văn bản giải thích nào khác ngoài cấu trúc JSON sau.

  \`\`\`json
  {
    "name": "Tên món ăn đã nhận diện (Tiếng Việt)",
  
  }
  \`\`\`
  `;

  try {
    // 1. Gọi Lớp Trừu tượng hóa AI để nhận diện và phân tích
    const analysisText = await analyzeFoodImage(modelToUse, imageFile, prompt);

    // 2. Lưu vào MongoDB
    const newAnalysis = new Analysis({
      inputImagePath: imageFile.path, 
      modelUsed: modelToUse,
      analysisResult: analysisText, // Lưu chuỗi JSON thô từ AI
      // userId: req.user._id // Nếu có xác thực
    });
    await newAnalysis.save();

    // 3. Trả về kết quả
    res.status(200).json({
      success: true,
      model: modelToUse,
      analysis: analysisText // Trả về chuỗi JSON để FE tự parse
    });

  } catch (error) {
    console.error("Global Error:", error);
    // Chuyển lỗi sang Error Handler Middleware
    next(error);
  } finally {
    // QUAN TRỌNG: Xóa file tạm thời trên server sau khi xử lý xong
    if (imageFile && fs.existsSync(imageFile.path)) {
      // Dùng fs.unlinkSync để xóa file đồng bộ
      fs.unlinkSync(imageFile.path);
    }
  }
};

// Sử dụng module.exports để xuất hàm (chuẩn CommonJS)
module.exports = { analyzeImage };
