// controllers/recipe.controller.js
const { runNER } = require("../services/hf.service");

async function analyzeRecipe(req, res) {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text in request body" });
    }

    const result = await runNER(text);

    res.json({ success: true, result });
  } catch (err) {
    console.error("❌ Error analyzing recipe:", err); // log chi tiết trong terminal
    res.status(500).json({
      error: "Failed to analyze recipe",
      detail: err.message, // thêm thông tin gốc
    });
  }
}

module.exports = { analyzeRecipe };
