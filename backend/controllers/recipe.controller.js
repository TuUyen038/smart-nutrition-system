// analyzeController.js (Tối ưu hóa)
const fs = require('fs');
// Sửa import: Lấy tất cả các hàm mới
const { 
  identifyFoodName, 
  getRecipe, 
  calculateNutrition, 
  getSubstitutionsAndWarnings 
} = require('../utils/ai_providers/aiInterface'); 
const Analysis = require('../models/Analysis');

// Hàm chính xử lý logic phân tích
const findRecipe = async (req, res, next) => {
  const imageFile = req.file; 
  const modelToUse = req.body.model || 'gemini-2.5-flash'; // Đặt model mặc định rõ ràng hơn
  
  // Đối tượng JSON kết quả phân tích cuối cùng
  let finalAnalysisResult = {
      foodName: "Không xác định",
      recipe: null,
      nutrition: null,
      suggestions: null,
      warnings: null
  }; 
  
  // Đầu vào tùy chọn cho hàm 4
  const userRestrictions = req.body.restrictions || 'Người ăn kiêng, Người cao huyết áp, Người tiểu đường'; 

  // Hàm Parse an toàn và loại bỏ ký tự không mong muốn (```json)
  const safeParse = (text, defaultVal = {}) => {
      if (typeof text !== 'string') return defaultVal;
      try {
          return JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (e) {
          console.warn(`⚠️ Lỗi Parse JSON: ${e.message}. Trả về giá trị mặc định.`);
          // Trả về một đối tượng chứa chuỗi thô để debug, nếu parse lỗi
          return { error: `Lỗi Parse JSON: ${e.message}`, rawText: text };
      }
  };

  if (!imageFile) {
    return res.status(400).json({ message: 'Vui lòng cung cấp file ảnh.' });
  }

  try {
    // ---------------------------------------------------------------------
    // 🧠 BƯỚC 1: NHẬN DIỆN MÓN ĂN (Tuần tự - SỬ DỤNG HÀM MỚI)
    // ---------------------------------------------------------------------
    console.log('1. Bắt đầu nhận diện món ăn...');
    
    // Sử dụng hàm identifyFoodName từ aiInterface
    const detectionJsonString = await identifyFoodName(imageFile);
    const parsedDetection = safeParse(detectionJsonString);
    
    // Trích xuất Tên món ăn
    let foodName = parsedDetection.foodName || "Không xác định";
    finalAnalysisResult.foodName = foodName;
    
    if (foodName === "Không xác định" || parsedDetection.error) {
        return res.status(400).json({ 
            success: false, 
            message: "Không thể nhận diện món ăn trong hình ảnh.",
            rawDetection: parsedDetection 
        });
    }
    
    console.log(`🍜 Món ăn được nhận diện: **${foodName}**`);
    res.status(200).json({
      success: true,
      foodName: foodName
    });
    // ---------------------------------------------------------------------
    // 🧩 BƯỚC 2: PHÂN TÍCH CHUYÊN SÂU (Song song - SỬ DỤNG CÁC HÀM MỚI)
    // ---------------------------------------------------------------------
    // console.log('2. Bắt đầu phân tích công thức, dinh dưỡng, và lời khuyên (Song song)...');
    
    // const [recipeRes, nutritionRes, adviceRes] = await Promise.allSettled([
    //   getRecipe(foodName), 
    //   calculateNutrition(foodName), // Giả sử hàm 3 được sửa lại để chấp nhận tên món
    //   getSubstitutionsAndWarnings(foodName, userRestrictions), 
    // ]);
    // console.log('Kết quả bước 2:', recipeRes, nutritionRes, adviceRes);
    // // ---------------------------------------------------------------------
    // // 💾 BƯỚC 3: XỬ LÝ VÀ LƯU KẾT QUẢ (Parse và Gán)
    // // ---------------------------------------------------------------------
    
    // // Lấy giá trị chuỗi JSON hoặc chuỗi lỗi
    // const getResultValue = (result) => result.status === 'fulfilled' ? result.value : JSON.stringify({ error: result.reason?.message || 'Không rõ lỗi' });
    
    // // 1. Công thức (recipe)
    // finalAnalysisResult.recipe = safeParse(getResultValue(recipeRes));
    
    // // 2. Dinh dưỡng (totalNutrition)
    // finalAnalysisResult.nutrition = safeParse(getResultValue(nutritionRes));
    
    // // 3. Gợi ý & Cảnh báo (suggestions/warnings)
    // const adviceParsed = safeParse(getResultValue(adviceRes));
    // finalAnalysisResult.suggestions = adviceParsed.substitutions || adviceParsed;
    // finalAnalysisResult.warnings = adviceParsed.warnings || [];

    // // Lưu kết quả HOÀN CHỈNH vào MongoDB
    // const newAnalysis = new Analysis({
    //   inputImagePath: imageFile.path, 
    //   modelUsed: modelToUse,
    //   // Lưu toàn bộ đối tượng đã được parse (chỉ 1 lần stringify cuối cùng)
    //   analysisResult: JSON.stringify(finalAnalysisResult), 
    //   createdAt: new Date(),
    // });
    
    // await newAnalysis.save();
    // console.log(`✅ Lưu phân tích thành công: ${newAnalysis._id}`);

    // // ---------------------------------------------------------------------
    // // ✅ BƯỚC 4: TRẢ VỀ PHẢN HỒI
    // // ---------------------------------------------------------------------
    // res.status(200).json({
    //   success: true,
    //   model: modelToUse,
    //   // Trả về đối tượng JS đã hoàn chỉnh, Frontend chỉ cần parse Response body 1 lần.
    //   analysis: finalAnalysisResult
    // });

  } catch (error) {
    console.error("🚨 Global Error:", error);
    // Nếu có lỗi, luôn dọn dẹp và gọi next() để middleware xử lý lỗi
    next(error); 
  } finally {
    // 🧹 Dọn file tạm
    if (imageFile && fs.existsSync(imageFile.path)) {
      fs.unlink(imageFile.path, (err) => {
          if (err) console.error("Lỗi khi xóa file tạm:", err);
      });
    }
  }
};

const detectImage = async (req, res, next) => {
  const imageFile = req.file; 
  const modelToUse = req.body.model || 'gemini-2.5-flash'; // Đặt model mặc định rõ ràng hơn
  
  let foodName;
  
  // Hàm Parse an toàn và loại bỏ ký tự không mong muốn (```json)
  const safeParse = (text, defaultVal = {}) => {
      if (typeof text !== 'string') return defaultVal;
      try {
          return JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch (e) {
          console.warn(`⚠️ Lỗi Parse JSON: ${e.message}. Trả về giá trị mặc định.`);
          // Trả về một đối tượng chứa chuỗi thô để debug, nếu parse lỗi
          return { error: `Lỗi Parse JSON: ${e.message}`, rawText: text };
      }
  };

  if (!imageFile) {
    return res.status(400).json({ message: 'Vui lòng cung cấp file ảnh.' });
  }

  try {
    console.log('1. Bắt đầu nhận diện món ăn...');
    
    const detectionJsonString = await identifyFoodName(imageFile);
    const parsedDetection = safeParse(detectionJsonString);
    
    // Trích xuất Tên món ăn
    foodName = parsedDetection.foodName || "Không xác định";
    
    if (foodName === "Không xác định" || parsedDetection.error) {
        return res.status(400).json({ 
            message: "Không thể nhận diện món ăn trong hình ảnh.",
            rawDetection: parsedDetection 
        });
    }
    
    console.log(`🍜 Món ăn được nhận diện: **${foodName}**`);
    res.status(200).json({
      foodName: foodName
    });
  } catch (error) {
    console.error("🚨 Global Error:", error);
    // Nếu có lỗi, luôn dọn dẹp và gọi next() để middleware xử lý lỗi
    next(error); 
  } finally {
    // Dọn file tạm
    if (imageFile && fs.existsSync(imageFile.path)) {
      fs.unlink(imageFile.path, (err) => {
          if (err) console.error("Lỗi khi xóa file tạm:", err);
      });
    }
  }
};

module.exports = { findRecipe, detectImage };