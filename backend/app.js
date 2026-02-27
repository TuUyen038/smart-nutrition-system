const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/database");
const indexRoutes = require("./routes/index.routes");

const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

connectDB();

const app = express();

app.use(cors({
origin: ["http://localhost:3000", "http://localhost:3001"],
methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api", indexRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

module.exports = app;
