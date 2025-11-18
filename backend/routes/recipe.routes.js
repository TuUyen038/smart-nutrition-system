const express = require('express');
const multer = require('multer');
const { getAllRecipe, findRecipeByName, detectImage, findIngrAndInstrByAi, getBackUpNutrition, createNewRecipe, getRecipeById, findIngredientsByAi } = require('../controllers/recipe.controller');

const router = express.Router();

const upload = multer({ dest: 'uploads/' }); 

// POST /api/food/analyze
// 'foodImage' phải khớp với tên field trong FormData của Frontend
router.post('/', createNewRecipe);
router.post('/ingredients', findIngredientsByAi);
router.post('/detect', upload.single('foodImage'), detectImage );
router.get('/rcm/:foodName', findIngrAndInstrByAi);
router.get('/id/:id', getRecipeById); // chỉ match ObjectId 24 ký tự
router.get('/:foodName', findRecipeByName);
router.get('/', getAllRecipe);
router.post('/back-up-nutrition', getBackUpNutrition);

module.exports = router;
