const express = require("express");
const router = express.Router();
const ingredientController = require("../controllers/ingredient.controller");

// Public routes
router.get("/search", ingredientController.searchIngredients);
router.get("/stats", ingredientController.getIngredientStats);
router.get("/check-duplicate", ingredientController.checkDuplicateName);

// CRUD routes (có thể thêm authentication middleware sau)
router.get("/", ingredientController.getAllIngredients);
router.get("/:id", ingredientController.getIngredientById);
router.post("/", ingredientController.createIngredient);
router.put("/:id", ingredientController.updateIngredient);
router.delete("/:id", ingredientController.deleteIngredient);

module.exports = router;
