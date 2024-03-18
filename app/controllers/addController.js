const connection = require("../../config/db.config");
const { getUser_info } = require("./homeController");

let msg;
let { id, username, email } = [];

/**
 * @route '/add/memory'
 * @method GET
 * @description get adding form
 */
exports.addForm = (req, res) => {
    const user_session = req.session.user;

    if (user_session) {
        ({ id, username, email } = user_session);
    } else {
        ({ id, username, email } = req.cookies['rememberme'].user_info);
    }

    const sidebar_active = 'add';

    res.status(200).render('memory/add', { id, username, email, active: sidebar_active });
}

/**
 * @route '/add/memory'
 * @method POST
 * @description adding memory post
 */
exports.addMemory = (req, res) => {
    const { student_name, theme, degree, mention, academic_year, keywords } = req.body;
    // const theme_uppercase = theme.slice(0, 1).toUpperCase() + theme.slice(1).toLowerCase();
    const theme_uppercase = capitalizeEachWord(theme);

    const file = req.file;
    const active = 'all';

    if (file.mimetype === 'application/pdf') {
        const query1 = `INSERT INTO files ( filename, path) VALUES (?, ?)`;
        connection.query(query1, [file.filename, file.path], (err, result) => {

            if (err) throw err;

            if (result.affectedRows > 0) {
                const query = `INSERT INTO memory (student_name, theme, degree, mention, academic_year, keywords, file) VALUES (?, ?, ?, ?, ?, ?, ?);`;

                connection.query(query, [student_name, theme_uppercase, degree, mention, academic_year, keywords, result.insertId], (err, result) => {

                    if (err) throw err;

                    if (result.affectedRows > 0) {
                        res.redirect('/memory/all');
                    }
                });
            }
        });
    } else {
        console.log('Le fichier doit être une pdf');
    }

    function capitalizeEachWord(text) {
        const w = text.split(" ");
        const nw = w.map(w => w.slice(0, 1).toUpperCase() + w.slice(1).toLowerCase());
        const nt = nw.join(" ");
        return nt;
    }
}
