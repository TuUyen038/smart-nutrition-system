// aiInterface.js (Nâng cấp)
const { GeminiService } = require('./geminiProvider.js'); 
// import { analyzeWithOpenAI } from './openaiProvider.js'; 

// Khởi tạo các Service Instance với các API Key khác nhau
// Key cho mục đích chung (food analysis)
const GEMINI_API_KEY_FOOD = process.env.GEMINI_API_KEY; 
// Key cho mục đích khác (ví dụ: gpt-4 analysis, nếu bạn thêm OpenAI)
const GEMINI_API_KEY_OTHER = process.env.GEMINI_API_KEY_OTHER;

// Khởi tạo Service (Lưu ý: sẽ ném lỗi nếu KEY bị thiếu)
const foodGeminiService = new GeminiService(GEMINI_API_KEY_FOOD, 'gemini-2.5-flash');
// const otherGeminiService = GEMINI_API_KEY_OTHER ? new GeminiService(GEMINI_API_KEY_OTHER, 'gemini-2.5-pro') : null;


/**
 * Hàm phân tích chung, chọn mô hình/service phù hợp.
 */
const analyzeFoodImage = async (modelName, imageFile, prompt) => {
    
    // Tách prompt thành 2 loại: có ảnh và không ảnh, để chọn method (chưa cần ở đây)

    switch (modelName.toLowerCase()) {
        case 'gemini-2.5-flash':
        case 'gemini':
            // Sử dụng instance Service đã được cấu hình với key/model
            // Lưu ý: Dùng 'gemini-2.5-flash' hoặc model tương đương
            return foodGeminiService.analyze(imageFile, prompt, 'gemini-2.5-flash');

        // case 'gemini-pro':
        //     if (!otherGeminiService) throw new Error("Service PRO chưa được cấu hình.");
        //     return otherGeminiService.analyze(imageFile, prompt, 'gemini-2.5-pro');

        // case 'openai':
        // case 'gpt-4':
        //     // Tưởng tượng: return openAIService.analyze(imageFile, prompt); 
            
        default:
            throw new Error(`Mô hình AI '${modelName}' không được hỗ trợ.`);
    }
};

// -----------------------------------------------------------------------
//                 CÁC HÀM TÍNH NĂNG MỚI (NEW FEATURES)
// -----------------------------------------------------------------------

/**
 * 1. Nhận dạng tên món ăn từ hình ảnh.
 * @param {object} imageFile - File ảnh món ăn.
 * @returns {Promise<string>} - Chuỗi JSON chứa tên món ăn và mô tả ngắn.
 */
const identifyFoodName = async (imageFile) => {
    const prompt = `
        Bạn là một chuyên gia ẩm thực. 
        Hãy nhận dạng món ăn trong bức ảnh. Chỉ trả về một đối tượng JSON với 
        tên món ăn bằng tiếng Việt, key "foodName" vẫn giữ nguyên tiếng anh.
    `;
    // Chỉ cần gọi hàm analyze với ảnh và prompt
    return analyzeFoodImage('gemini', imageFile, prompt);
    
    /* * Cấu trúc JSON mong muốn:
    * {
    * "foodName": "Bánh Mì Kẹp Thịt Nướng",
    * "error": null 
    * }
    */
};


/**
 * 2. Tìm công thức nấu ăn dựa trên tên món ăn.
 * @param {string} foodName - Tên món ăn cần tìm công thức.
 * @returns {Promise<string>} - Chuỗi JSON chứa danh sách nguyên liệu và các bước.
 */
const getRecipe = async (foodName) => {
    const prompt = `
        Hãy cung cấp công thức nấu ăn chi tiết cho món "${foodName}". 
        Trích xuất danh sách các nguyên liệu (Tên, Lượng ước tính) 
        và danh sách các bước thực hiện.
    `;
    // Gọi hàm analyze mà KHÔNG CÓ ảnh (tham số imageFile là null)
    return foodGeminiService.analyze(null, prompt, 'gemini-2.5-flash');
    
    /* * Cấu trúc JSON mong muốn:
    * {
    * "foodName": "Bánh Mì Kẹp Thịt Nướng",
    * "ingredients": [
    * {"name": "Thịt ba chỉ heo", "quantity": "300g"},
    * {"name": "Nước mắm", "quantity": "2 muỗng canh"},
    * ...
    * ],
    * "steps": [
    * {"stepNumber": 1, "instruction": "Ướp thịt với nước mắm, đường, tiêu..."},
    * {"stepNumber": 2, "instruction": "Nướng thịt đến khi chín vàng..."},
    * ...
    * ],
    * "error": null
    * }
    */
};

/**
 * 3. Tính toán dinh dưỡng (tổng quan) từ công thức/nguyên liệu.
 * @param {string} recipeJsonString - Chuỗi JSON của công thức (từ getRecipe).
 * @returns {Promise<string>} - Chuỗi JSON chứa thông tin dinh dưỡng.
 */
const calculateNutrition = async (recipeJsonString) => {
    const prompt = `
        Dựa trên công thức JSON sau: ${recipeJsonString}. 
        Hãy tính toán tổng lượng Calo, Protein, Chất béo, và Carb (tính bằng gram) và sugar, sodium (mg) đối với một khẩu phần ăn 
    `;
    // Gọi hàm analyze mà KHÔNG CÓ ảnh
    return foodGeminiService.analyze(null, prompt, 'gemini-2.5-flash');
    
    /* * Cấu trúc JSON mong muốn:
    * {
    * "foodName": "Bánh Mì Kẹp Thịt Nướng",
    * "error": null,
    * "totalNutrition": {
    * "calories": 95,
    * "protein": 80,
    * "fat": 45,
    * "carbs": 50,
    * "fiber": 10,
    * "sugar": 10,
    * "sodium": 100
    * }
    *}
    */
};

/**
 * 4. Gợi ý thay thế nguyên liệu và đưa ra cảnh báo.
 * @param {string} foodName - Tên món ăn.
 * @param {string} restrictions - Loại người dùng không phù hợp (ví dụ: "Người ăn chay, Người bị tiểu đường").
 * @returns {Promise<string>} - Chuỗi JSON chứa gợi ý thay thế và cảnh báo.
 */
const getSubstitutionsAndWarnings = async (foodName, restrictions) => {
    const prompt = `
        Món ăn: "${foodName}". 
        Hãy đưa ra các gợi ý thay thế nguyên liệu để phù hợp hơn (ví dụ: thay thế cho người ăn chay, hoặc giảm chất béo/đường). 
        Đồng thời, đưa ra các cảnh báo rõ ràng nếu món ăn KHÔNG PHÙ HỢP với các đối tượng sau: **${restrictions}**.
    `;
    // Gọi hàm analyze mà KHÔNG CÓ ảnh
    return foodGeminiService.analyze(null, prompt, 'gemini-2.5-flash');
    
    /* * Cấu trúc JSON mong muốn:
    * {
    * "foodName": "Bánh Mì Kẹp Thịt Nướng",
    * "substitutions": [
    * {"original": "Thịt ba chỉ heo", "suggestion": "Đậu phụ nướng hoặc nấm cho người ăn chay."},
    * {"original": "Đường", "suggestion": "Mật ong."},
    * ],
    * "warnings": [
    * {"message": "Bánh mì trắng và nước sốt có đường có thể làm tăng đường huyết. Nên thay bằng bánh mì nguyên cám và hạn chế đường."},
    * ],
    * "error": null
    * }
    */
};


// -----------------------------------------------------------------------
//                     EXPORT CÁC HÀM MỚI
// -----------------------------------------------------------------------

module.exports = { 
    analyzeFoodImage, // Hàm gốc
    identifyFoodName, // 1. Nhận dạng
    getRecipe,        // 2. Tìm công thức
    calculateNutrition, // 3. Tính dinh dưỡng
    getSubstitutionsAndWarnings // 4. Gợi ý & Cảnh báo
};