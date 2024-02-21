const express = require('express');
const app = express();
const session = require('express-session');

app.use(
    session({
        secret: 'ab67728928cd976e898d70e89c9797',
        resave: false,
        saveUninitialized: false,
    })
)
module.exports = app;