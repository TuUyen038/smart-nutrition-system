// // src/app.js
// const express = require('express');
// const cors = require('cors');
// const morgan = require('morgan'); // log HTTP request
// require('dotenv').config();

// // Kết nối DB
// require('./config/db');

// // Import routes
// const userRoutes = require('./routes/user.routes');

// const app = express();

// // Middleware cơ bản
// app.use(cors());
// app.use(express.json());
// app.use(morgan('dev'));

// // Routes
// app.use('/api/users', userRoutes);

// // Middleware xử lý lỗi (error handler)
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Server Error',
//   });
// });

// module.exports = app;
