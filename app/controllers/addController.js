const connection = require("../../config/db.config");
const { getUser_info } = require("./homeController");

let msg;

/**
 * @route '/add/memory'
 * @method GET
 * @description get adding form
 */
exports.addForm = (req, res) => {
    let { id, username, email } = [];
    const userSess = req.session.user;
    if (userSess) {
        ({ id, username, email } = userSess);
    } else {
        ({ id, username, email } = req.cookies['rememberme'].userC);
    }
    const active = 'add';
    res.status(200).render('memory/add', { id, username, email, active });
}

/**
 * @route '/add/memory'
 * @method POST
 * @description adding memory post
 */
exports.addMemory = (req, res) => {
    const { student_name, theme, degree, mention, academic_year, keywords } = req.body;
    const file = req.file;
    if (file.mimetype === 'application/pdf') {
        const query1 = `INSERT INTO files ( filename, path) VALUES (?, ?)`;
        connection.query(query1, [file.filename, file.path], (err, result) => {
            if (err) throw err;
            if (result.affectedRows > 0) {
                const query = `INSERT INTO memory (student_name, theme, degree, mention, academic_year, keywords, file) VALUES (?, ?, ?, ?, ?, ?, ?);`;
                connection.query(query, [student_name, theme, degree, mention, academic_year, keywords, result.insertId], (err, result) => {
                    if (err) throw err;
                    if (result.affectedRows > 0) {
                        // const active = 'home';
                        res.redirect('/memory/per_mention');
                    }
                });
            }
        });
    } else {
        console.log('Le fichier doit être une pdf');
    }
}
