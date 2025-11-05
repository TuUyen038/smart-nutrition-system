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

const identifyFoodName = async (imageFile) => {
    const prompt = `
        Bạn là một chuyên gia ẩm thực. 
        Hãy nhận dạng món ăn trong bức ảnh. Nếu không tìm ra tên hãy trả về null. Chỉ trả về một đối tượng JSON với 
        tên món ăn bằng tiếng Việt, theo mẫu sau:
        * {
        * "foodName": "Bánh Mì Kẹp Thịt Nướng",
        * }
        `;
    return analyzeFoodImage('gemini', imageFile, prompt);
    
};

const getRecipe = async (foodName) => {
    const prompt = `
        Hãy cung cấp công thức nấu ăn khẩu phần 1 người thật đơn giản và dễ nấu cho món "${foodName}". 
        Không thêm thông tin khác. 
        tên nguyên liệu theo Bảng thành phần thực phẩm Việt Nam (Viện Dinh dưỡng, 2017)
        Tất cả nguyên liệu lấy unit là g, còn nếu chất lỏng thì ml.
        Trả về 1 đối tượng JSON như mẫu sau: 
        * {
        * "ingredients": [
        * {
        * "name": "Thịt heo",
        * "quantity": {
            * "amount": "300", //type: number
            * "unit": { type: String, enum: ['g', 'ml'],
        * },
        * ...
        * ],
        * "instructions": [
        * "Ướp thịt với nước mắm, đường, tiêu...",
        * "Nướng thịt đến khi chín vàng..."},
        * ...
        * ],
        * }
    `;
    return foodGeminiService.analyze(null, prompt, 'gemini-2.5-flash');
};
const getNutritionByAi = async (ingrs) => {
    const prompt = `
        Dựa trên danh sách tên nguyên liệu sau: ${ingrs},
        Hãy trả về danh sách nutrition tính trên 100g nguyên liệu, liệt kê theo thứ tự của danh sách nguyên liệu đó
        sugar và sodium đơn vị là mg, calories là kcal, còn lại là g
        trong đó mỗi object chứa thông tin của 1 nguyên liệu, ưu tiên dữ liệu lấy từ Bảng thành phần thực phẩm Việt Nam (Viện Dinh dưỡng, 2017), không có thì hãy lấy từ nguồn đáng tin cậy.
        Trả về 1 obj theo mẫu:
         * {
            * "Nutrition": [
            * {
            *   "name": "Thịt heo",
            *   "source": "Viện Dinh dưỡng",
            *   "calories": 95,
            *   "protein": 80,
            *   "fat": 45,
            *   "carbs": 50,
            *   "fiber": 10,
            *   "sugar": 10,
            *   "sodium": 100,
            * }, 
            * {
            *   "name": "Thịt chim",
            *   "source": "Viện Dinh dưỡng",
            *   "calories": 205,
            *   "protein": 80,
            *   "fat": 45,
            *   "carbs": 50,
            *   "fiber": 10,
            *   "sugar": 10,
            *   "sodium": 100,
            * }, 
            * ]
        *}
    `;
    return foodGeminiService.analyze(null, prompt, 'gemini-2.5-flash');
};

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

module.exports = { 
    analyzeFoodImage, 
    identifyFoodName, 
    getRecipe,        
    getNutritionByAi, 
    getSubstitutionsAndWarnings 
};