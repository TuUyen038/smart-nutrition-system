const express = require("express");
const multer = require("multer");
const {
  searchByIngredientName,
  searchByImage,
  getAllRecipe,
  findRecipeByName,
  detectImage,
  findIngrAndInstrByAi,
  getBackUpNutrition,
  createNewRecipe,
  getRecipeById,
  findIngredientsByAi,
  getRecipeStats,
  checkDuplicateName,
  updateRecipe,
  deleteRecipe,
  getIngredientSubstitutions,
} = require("../controllers/recipe.controller");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// Public routes
router.get("/search-by-ingredient", searchByIngredientName);
router.post("/search-by-image", upload.single("foodImage"), searchByImage); // Hybrid Image→Text→Search
router.get("/stats", getRecipeStats);
router.get("/check-duplicate", checkDuplicateName);
router.post("/ingredients", findIngredientsByAi);
router.post("/detect", upload.single("foodImage"), detectImage);
router.post("/substitutions", getIngredientSubstitutions);
router.get("/rcm/:foodName", findIngrAndInstrByAi);
router.post("/back-up-nutrition", getBackUpNutrition);

// CRUD routes
router.get("/id/:id", getRecipeById); // Phải đặt trước /:foodName
router.get("/:foodName", findRecipeByName); // Match foodName
router.get("/", getAllRecipe); // Phải đặt cuối cùng
router.post("/", createNewRecipe);
router.put("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);

module.exports = router;
