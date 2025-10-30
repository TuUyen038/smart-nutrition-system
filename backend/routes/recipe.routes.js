const express = require('express');
const multer = require('multer');
const { analyzeImage } = require('../controllers/recipe.controller');

const router = express.Router();

const upload = multer({ dest: 'uploads/' }); 

// POST /api/food/analyze
// 'foodImage' phải khớp với tên field trong FormData của Frontend
router.post(
    '/analyze', 
    upload.single('foodImage'), 
    analyzeImage 
);

module.exports = router; 
