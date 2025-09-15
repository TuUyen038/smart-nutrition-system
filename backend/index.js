const express = require("express");
const bodyParser = require("body-parser");
const recipeRoutes = require("./routes/recipe.routes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON body
app.use(bodyParser.json());

// Mount router
app.use("/api/recipe", recipeRoutes);

// Global error handler (giúp log lỗi rõ hơn)
app.use((err, req, res, next) => {
  console.error("🔥 Uncaught Error:", err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost ${PORT}`);
});
