exports.logged = (req, res, next) => {
    console.log('User logged et '+req.url);
    next();
}