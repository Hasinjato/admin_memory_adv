const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require('express-session');

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'your-secret-key',
    key: 'cookieName',
    cookie: { secure: true, httpOnly: true, path: '/user', sameSite: true},
    resave: false,
    saveUninitialized: false
}));

module.exports = app;