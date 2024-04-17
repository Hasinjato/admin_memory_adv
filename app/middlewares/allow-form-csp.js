const express = require('express');
const app = express();

app.use(function (req, res, next) {
    res.header('Content-Security-Policy', "script-src 'self' 'unsafe-inline';");
    next();
})

module.exports = app;