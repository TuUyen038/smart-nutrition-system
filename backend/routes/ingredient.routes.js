const express = require("express");
const router = express.Router();
const ingredientController = require("../controllers/ingredient.controller");
const { authenticate, authorize } = require("../middlewares/auth");

// Public routes
router.get("/search", ingredientController.searchIngredients);
router.get("/check-duplicate", ingredientController.checkDuplicateName);

// Public GET routes
router.get("/", ingredientController.getAllIngredients);
router.get("/:id", ingredientController.getIngredientById);

// Protected CRUD routes - Only ADMIN can create/update/delete
router.post("/", authenticate, authorize("ADMIN"), ingredientController.createIngredient);
router.put("/:id", authenticate, authorize("ADMIN"), ingredientController.updateIngredient);
router.delete("/:id", authenticate, authorize("ADMIN"), ingredientController.deleteIngredient);
router.get("/stats", authenticate, authorize("ADMIN"), ingredientController.getIngredientStats);

module.exports = router;
