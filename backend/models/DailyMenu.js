const mongoose = require("mongoose");

const dailyMenuSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  date: { type: Date, required: true },

  recipes: [
    {
      recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
      portion: Number,
      note: String,
      status: {
        type: String,
        enum: ["planned", "eaten", "deleted"],
        default: "planned",
      },
    },
  ],

  totalNutrition: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number,
  },

  feedback: String,
}, { timestamps: true });



dailyMenuSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("DailyMenu", dailyMenuSchema);
