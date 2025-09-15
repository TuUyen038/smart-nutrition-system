const express = require("express");
const { analyzeRecipe } = require("../controllers/recipe.controller");

const router = express.Router();

router.post("/analyze", analyzeRecipe);

module.exports = router;
