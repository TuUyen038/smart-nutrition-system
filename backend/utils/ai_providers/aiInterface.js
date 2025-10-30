const { analyzeWithGemini } = require('./geminiProvider.js'); 
// import { analyzeWithOpenAI } from './openaiProvider.js'; // Để mở rộng sau này

const analyzeFoodImage = async (modelName, imageFile, prompt) => {
    switch (modelName.toLowerCase()) {
        case 'gemini-2.5-flash':
        case 'gemini':
            return analyzeWithGemini(imageFile, prompt);

        // case 'openai':
        // case 'gpt-4':
        //     return analyzeWithOpenAI(imageFile, prompt); 
            
        default:
            throw new Error(`Mô hình AI '${modelName}' không được hỗ trợ.`);
    }
};
module.exports = { analyzeFoodImage };