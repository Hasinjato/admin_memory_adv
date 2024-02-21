const connection = require('../../config/db.config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const saltRounds = 10;
let msg;

/**
 * @route '/register'
 * @method GET
 * @description create user form
 */
exports.registerForm = (req, res) => {
    res.status(200).render('auth/register', { msg });
}

/**
 * @route '/register'
 * @method POST
 * @description add new user
 */
exports.register = async function (req, res) {
    const { username, email, password } = req.body;
    const pass_crypt = bcrypt.hashSync(password, saltRounds);
    const role = 'user'
    const query1 = 'SELECT `email` FROM Users WHERE email = ?';
    connection.query(query1, [email], async (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            res.status(400).render('auth/register', { success: false, msg: 'Cette email est déjà utilisée' });
        } else {

            const query = 'INSERT INTO `Users` (username,email, password, role) VALUES (?,?,?,?)';
            connection.query(query, [username, email, pass_crypt, role], function (err, result) {
                if (err) throw err;
                res.status(200).render('auth/register', { success: true, msg: 'new user added ' + result.insertId });
            });
            // connection.end();
            // OU --------------------
            // const query2 = 'INSERT INTO `Users` (username, password, role) VALUES (:username, :password, :role)';
            // const params = {
            //     username: username,
            //     password: pass_crypt,
            //     role: role
            // }
            // connection.query(query2, params, function (err, result) {
            //     if (err) throw err;
            //     res.status(200).render('auth/register',{ ok: true, msg: 'new user added ' + result.insertId });
            // });
            // connection.end();
        }
    });

}

/**
 * @route '/login'
 * @method GET
 * @description authenticate user form
 */
exports.loginForm = async function (req, res) {
    const rememberme = req.cookies['rememberme'];
    let msg;
    if (rememberme || (req.session.token)) {
        msg = 'Vous êtes déjà connecter!';
    }
    res.status(200).render('auth/login', { msg });
}

/**
 * @route '/login'
 * @method POST
 * @description authenticate user
 */
exports.login = async function (req, res) {
    const { email, password, remember } = req.body;
    const query = 'SELECT * FROM `Users` WHERE `email` = ? LIMIT 1';
    const params = [email]
    connection.query(query, params, async function (err, result) {
        if (err) throw err;

        if (result.length > 0) {
            result.map((user) => {
                bcrypt.compare(password, user.password, async function (err, result) {
                    if (err) throw err;

                    if (!result) {
                        res.status(401).render('auth/login', { msg: 'Identifiant incorrect' });
                    } else {
                        // Create JWT Payload
                        const payload = {
                            id: user.id,
                            name: user.username
                        };

                        // Sign token
                        const token = jwt.sign({
                            payload
                        },
                            process.env.JWT_KEY,
                            {
                                expiresIn: '3h'
                            },
                            { algorithm: 'RS256' }
                        );
                        const userC = { id: user.id, username: user.username, email: user.email };
                        req.session.user = userC;
                        req.session.token = token;
                        if (remember) {
                            res.cookie('rememberme', { userC, token }, { httpOnly: true });
                        }
                        res.redirect('/home');
                    }
                })
            });
        } else {
            res.render('auth/login', { msg: 'Identifiant incorrect' });
        }
    });
}

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.clearCookie('rememberme');
        res.redirect('/login')
    });
}