const rateLimit = require('express-rate-limit');

const reqLimiter = rateLimit({
    windowMs: 60 * 2000,
    max: 125, // 125 requettes, et réesaye dans 2min
    message: 'Beaucoup de requette'
});

module.exports = reqLimiter;