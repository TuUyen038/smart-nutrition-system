const mongoose = require("mongoose");

const substituteIngredientSchema = new mongoose.Schema({
  ingre_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" },
  sub_ingre_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" },
  reason: String,
  health_score_diff: Number,
  score: Number
});

module.exports = mongoose.model("SubstituteIngredient", substituteIngredientSchema);
