const express = require('express');
const app = express();
const PORT = 3000;

// Middleware để xử lý JSON
app.use(express.json());

// Route cơ bản
app.get('/', (req, res) => {
  res.send('Hello Express!');
});

// Chạy server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
