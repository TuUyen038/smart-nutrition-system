const mongoose = require("mongoose");

const substituteIngredientSchema = new mongoose.Schema({
  ingre_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient", required: true },
  sub_ingre_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient", required: true },

  reason: { 
    type: String, 
    enum: ["health", "allergy", "availability", "dietary", "taste", "other"], 
    default: "other" 
  },
  note: String,

  health_score_diff: Number, // âm nếu kém hơn, dương nếu tốt hơn
  score: { type: Number, min: 0, max: 1 }, // điểm gợi ý (0–1)

  mutual: { type: Boolean, default: false } // có thể thay hai chiều hay không

}, { timestamps: true });

substituteIngredientSchema.index({ ingre_id: 1, sub_ingre_id: 1 }, { unique: true });

module.exports = mongoose.model("SubstituteIngredient", substituteIngredientSchema);
