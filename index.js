const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
require("helmet");

const user_routes = require('./app/routes/userRoutes');
const home_routes = require('./app/routes/homeRoutes');
const memory_routes = require('./app/routes/memoryRoutes');
const connection = require("./config/db.config");

const cors_mid = require('./app/middlewares/cors');
const all_mid = require('./app/middlewares/config');
const helmet_mid = require('./app/middlewares/helmet');
const serve_static = require("./app/middlewares/serve_static");
const session = require("./app/middlewares/session");
const cookie_parser = require('cookie-parser');
const { logged } = require("./app/middlewares/logged");


connection.connect((err) => {
    if (err) console.error(err.message);
    console.log('MySQL db is connected: ', connection.threadId);
});

// middlewares
app.use(all_mid);
app.use(cors_mid);
app.use(helmet_mid);
// app.use(serve_static);
app.use(session);
app.use(cookie_parser());

app.set('views', './app/views');
app.set('view engine', 'ejs');


app.use(express.static('public/'));

// Route principale
app.use('/',
    user_routes,
    home_routes,
    memory_routes
);

app.use(function (req, res) {
    res.status(404).render('404');
});

app.listen(PORT, (req, res) => {
    console.log(`Server is running on localhost: ${PORT}`);
});