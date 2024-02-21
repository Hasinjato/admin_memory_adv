const express = require("express");
const app = express();
const cors = require("cors");

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

module.exports = app;