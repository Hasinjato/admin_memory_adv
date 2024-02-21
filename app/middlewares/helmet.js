const express = require("express");
const app = express();

const { default: helmet } = require("helmet");

app.use(helmet.strictTransportSecurity())

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.frameguard('deny'));
app.use(helmet.ieNoOpen());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'", "https:", "http:"],
        scriptSrc: ["'self'", "https:", "http:"],
        styleSrc: ["'self'", "https:", "http:"],
        imgSrc: ["'self'", "https:", "http:"],
        fontSrc: ["'self'", "https:", "http:"],
        connectSrc: ["'self'", "https:", "http:"],
        formAction: ["'self'", "https:", "http:"],
        frameAncestors: ["'self'", "https:", "http:"],
        baseURI: ["'self'", "https:", "http:"],
        manifestSrc: ["'self'", "https:", "http:"],
        workerSrc: ["'self'", "https:", "http:"],
        styleSheetSrc: ["'self'", "https:", "http:"],
        objectSrc: ["'self'", "https:", "http:"],
        pluginTypes: ["'self'", "https:", "http:"],
        scriptSrcAttr: ["'unsafe-eval'", "'unsafe-inline'", "'safe-eval'", "'safe-inline'"]
    }
}));


module.exports = app;