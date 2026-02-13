const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "uploads/" });

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

const { authenticate, authorize } = require("../middlewares/auth");

router.get("/search-by-ingredient", searchByIngredientName);
router.get("/stats", getRecipeStats);
router.get("/check-duplicate", checkDuplicateName);
router.get("/", getAllRecipe);
router.get("/:foodName", findRecipeByName);


/* =====================================================
   AUTHENTICATED ROUTES (Require Login)
===================================================== */

router.use(authenticate);

router.post("/search-by-image", upload.single("foodImage"), searchByImage);
router.post("/ingredients", findIngredientsByAi);
router.post("/detect", upload.single("foodImage"), detectImage);
router.post("/substitutions", getIngredientSubstitutions);
router.get("/id/:id", getRecipeById);
router.get("/rcm/:foodName", findIngrAndInstrByAi);
router.post("/back-up-nutrition", getBackUpNutrition);


/* =====================================================
   ADMIN ONLY ROUTES
===================================================== */

router.post("/", authorize("ADMIN"), createNewRecipe);
router.put("/:id", authorize("ADMIN"), updateRecipe);
router.delete("/:id", authorize("ADMIN"), deleteRecipe);

module.exports = router;