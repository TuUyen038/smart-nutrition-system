// models/Analysis.js
const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: false // Tùy chọn, nếu bạn có xác thực người dùng
    },
    modelUsed: {
        type: String,
        required: true,
        default: 'gemini-2.5-flash'
    },
    inputImagePath: {
        type: String,
        required: true,
    },
    analysisResult: {
        type: String, // Lưu kết quả text/JSON từ AI
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Analysis", AnalysisSchema);
