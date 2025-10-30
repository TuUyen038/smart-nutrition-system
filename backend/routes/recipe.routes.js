const express = require('express');
const multer = require('multer');
const { findRecipe, detectImage } = require('../controllers/recipe.controller');

const router = express.Router();

const upload = multer({ dest: 'uploads/' }); 

// POST /api/food/analyze
// 'foodImage' phải khớp với tên field trong FormData của Frontend
router.post(
    '/detect', 
    upload.single('foodImage'), 
    detectImage 
);

module.exports = router; 
