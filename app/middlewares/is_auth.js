require('dotenv').config();

exports.is_auth = async (req, res, next) => {
    
    if (req.cookies['rememberme']) {
        next();
    } else if (req.session.token) {
        next();
    } else {
        res.redirect('/login');
    }
}