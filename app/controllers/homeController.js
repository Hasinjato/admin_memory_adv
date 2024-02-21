
/**
 * @route '/home'
 * @method GET
 * @description get homepage
 **/
exports.getHomepage = (req, res) => {
    let { id, username, email } = [];
    const userSess = req.session.user;
    if (userSess) {
        ({ id, username, email } = userSess);
    } else {
        ({ id, username, email } = req.cookies['rememberme'].userC);
    }
    const active = 'home';
    res.status(200).render('home', { id, username, email, active });
}