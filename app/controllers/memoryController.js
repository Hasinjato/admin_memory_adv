const { query } = require("express");
const connection = require("../../config/db.config");
const fs = require('fs');

let sidebar_active = 'per_mention';

let { id, username, email } = [];

let page;
let mention;
let totalPage;
let limit = 10;
let total_memories = 0;
let memory;

/**
 * @route '/memory/per_mention'
 * @method GET
 * @description get all memory per mention
 */
exports.getMemoryPerMention = (req, res) => {
    get_user_info(req)

    const skip = get_skip_page(req);

    mention = req.query.mention || 'Droit';

    let query = `SELECT * FROM memory WHERE mention='${mention}'`;

    connection.query(query, (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            total_memories = result.length;
        } else {
            total_memories = 0;
        }
    });

    query = `SELECT * FROM memory WHERE mention='${mention}' ORDER BY academic_year DESC LIMIT ${limit} OFFSET ${skip}`;

    connection.query(query, (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            memory = result;
            totalPage = Math.ceil(total_memories / limit);
            sidebar_active = 'per_mention';

            return_to_view();
        } else {
            return_to_view();
        }

        function return_to_view() {
            res.status(200).render('memory/per_mention', { id, username, email, active: sidebar_active, memory, mention, totalM: total_memories, currentPage: page, totalPage });
        }
    });
};

/**
 * @route '/memory/per_diploma'
 * @method GET
 * @description get all memory per diploma, mention, 
 */
exports.getMemoryPerDiploma = (req, res) => {
    get_user_info(req);

    const diploma = req.query.diploma;
    const { mention } = req.query;
    const mention_list = ['Droit', 'Gestion', 'Informatique', 'Tourisme'];

    const skip = get_skip_page(req);

    sidebar_active = 'per_diploma';

    if (mention && diploma) {

        let query = `SELECT * FROM memory WHERE degree='${diploma}' AND mention='${mention}'`;
        connection.query(query, (err, result) => {
            if (err) throw err;

            if (result.length > 0) {
                total_memories = result.length;
            } else {
                total_memories = 0;
            }
        });

        query = `SELECT * FROM memory WHERE degree='${diploma}' AND mention='${mention}' ORDER BY academic_year DESC LIMIT ${limit} OFFSET ${skip}`;
        connection.query(query, (err, result) => {
            if (err) throw err;

            if (result.length > 0) {

                memory = result;

                totalPage = Math.ceil(total_memories / limit);

                return_to_view();
            }
            else {
                return_to_view();
            }

        });
    } else {
        return_to_view();
    }

    function return_to_view() {
        res.status(200).render('memory/per_diploma', { id, username, email, diploma, mention, memory, total_memories, currentPage: page, totalPage, mention_list, active: sidebar_active });
    }
}

/**
 * @route '/memory/getMemoryPerTheme'
 * @method GET
 * @description get all memory per search
 */
exports.getMemoryPerThemeForm = (req, res) => {
    get_user_info(req);

    const skip = get_skip_page(req);

    let theme_search = req.query.search;
    let filter_search = req.query.filter;
    const filter_search_en = filter_search;
    sidebar_active = 'per_theme';

    if (theme_search) {

        theme_search = normalize_search_string(theme_search);

        let query = `SELECT * FROM memory WHERE ${filter_search} LIKE '%${theme_search}%'`;

        connection.query(query, (err, result) => {
            if (err) throw err;

            if (result.length > 0) {
                total_memories = result.length;
            } else {
                total_memories = 0;
            }
        });


        query = `SELECT * FROM memory WHERE ${filter_search} LIKE '%${theme_search}%' ORDER BY academic_year DESC LIMIT ${limit} OFFSET ${skip}`;

        connection.query(query, (err, result) => {
            if (err) throw err;

            if (result.length > 0) {
                memory = result;

                totalPage = Math.ceil(total_memories / limit);

                res.status(200).render('memory/per_theme', { id, username, email, memory, filter_search, filter_search_en, total_memories, currentPage: page, totalPage, search: theme_search, active: sidebar_active });
            } else {

                res.status(200).render('memory/per_theme', { id, username, email, memory, filter_search, filter_search_en, total_memories, currentPage: page, totalPage, search: theme_search, active: sidebar_active });
            }
        });
    } else {
        let query = `SELECT * FROM memory ORDER BY theme ASC`;

        connection.query(query, (err, result) => {
            if (err) throw err;

            if (result.length > 0) {
                memory = result;
                total_memories = result.length;
            } else {
                total_memories = 0;
            }
        });

        res.status(200).render('memory/per_theme', { id, username, email, memory, filter_search, filter_search_en, total_memories, currentPage: page, totalPage, search: theme_search, active: sidebar_active });
    }
}

/**
 * @route '/memory/all'
 * @method GET
 * @description get all memory
 */
exports.getAllMemory = (req, res) => {
    get_user_info(req);

    const skip = get_skip_page(req);

    let query = `SELECT * FROM memory`;

    connection.query(query, (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            total_memories = result.length;
        }
    });

    query = `SELECT * FROM memory ORDER BY academic_year, id DESC LIMIT ${limit} OFFSET ${skip}`;

    connection.query(query, (err, result) => {
        if (err) throw err;

        if (result.length > 0) {

            memory = result;
            totalPage = Math.ceil(total_memories / limit);
            sidebar_active = 'all';

            res.status(200).render('memory/all', { id, username, email, active: sidebar_active, memory, totalM: total_memories, currentPage: page, totalPage });
        }
    });
};

/**
 * @route '/memory/:id_m/:id_f'
 * @method DELETE
 * @param id_m,id_f
 * @description delete memory
 */
exports.deleteMemory = (req, res) => {
    const { id_m, id_f } = req.params;

    let query = `SELECT * FROM files WHERE id = ${id_f}`;

    connection.query(query, (err, result) => {
        result.map((file) => {
            const file_path = file.path;
            fs.unlink(file_path, (err) => {
                if (err) throw err;
                console.log('file deleted successful')
            })
        })
    });

    query = `DELETE FROM memory WHERE id = ${id_m}`;

    connection.execute(query, (err, result) => {
        if (err) throw err;

        if (result.length > 0) {

            query = `DELETE FROM files WHERE id = ${id_f}`;

            connection.execute(query, (err, result) => {

                if (err) throw err;
            })
        }
    })
}

/**
 * @route '/memory/:id'
 * @method GET
 * @param id
 * @description get memory detail
 */
exports.updateMemoryForm = (req, res) => {
    get_user_info(req);

    const memo_id = req.params.id;

    let query = `SELECT * FROM memory WHERE id = ${memo_id} LIMIT 1`;

    connection.query(query, (err, result) => {
        if (err) throw err;

        if (result.length > 0) {

            memory = result;

            memory.map((memory) => {
                sidebar_active = 'all';
                res.status(200).render('memory/update', { id, username, email, active: sidebar_active, memory });
            });
        }
    });
}

/**
 * @route '/memory/:id'
 * @method PUT
 * @param id
 * @description update memory info
 */
exports.updateMemory = (req, res) => {
    const { student_name, theme, degree, mention, academic_year, keywords } = req.body;
    const memory_id = req.params.id;
    const theme_uppercase = capitalizeEachWord(theme);

    let query = `UPDATE memory SET 
                                    student_name = '${student_name}',
                                    theme = '${theme_uppercase}',
                                    degree = '${degree}',
                                    mention = '${mention}',
                                    academic_year = '${academic_year}',
                                    keywords = '${keywords}'
                                WHERE memory.id = ${memory_id}`;

    connection.query(query, (err, result) => {
        if (err) throw err;

        if (result.affectedRows > 0) {
            res.redirect(`/memory?id=${memory_id}`);
        }
    });
}

/**
 * @route '/memory/:id'
 * @method GET
 * @param id
 * @description get memory detail
 */
exports.getMemoryDetail = (req, res) => {
    get_user_info(req);

    const memory_id = req.query.id;

    let query = `SELECT * FROM memory WHERE id = ${memory_id} LIMIT 1`;

    connection.query(query, (err, result) => {
        if (err) throw err;

        if (result.length > 0) {

            memory = result;
            sidebar_active = 'all';

            memory.map((memory) => {

                query = `SELECT * FROM files WHERE id = ${memory.file}`;

                connection.query(query, (err, result) => {
                    result.map((file) => {
                        const file_path = (file.path).replace('public', ' ');

                        res.status(200).render('memory/detail', { id, username, email, active: sidebar_active, memory, file_path, file });
                    })
                })
            })
        } else {
            memory = null;
            res.status(404).render('404');
        }
    });
}

/**
 * Fonction pour avoir la page à ignorer pour la pagination
 */
function get_skip_page(req) {
    page = req.query.page || 1;
    const skip = (page - 1) * limit;
    return skip;
}

/**
 * Fonction pour avoir les informations de l'utilisateur 
 */
function get_user_info(req) {
    const userSess = req.session.user;
    if (userSess) {
        ({ id, username, email } = userSess);
    } else {
        ({ id, username, email } = req.cookies['rememberme'].user_info);
    }
}

/**
 * Fonction pour normaliser les textes de recherches
 */
function normalize_search_string(string_to_normalize) {
    string_to_normalize = string_to_normalize.replace(/[^a-zA-Z0-9\s-]/g, ' ');
    return string_to_normalize;
}

/**
 * Fonction pour mettre un texte en majuscule le début d'une phrase
 */
function capitalizeEachWord(text) {
    const w = text.split(" ");
    const nw = w.map(w => w.slice(0, 1).toUpperCase() + w.slice(1).toLowerCase());
    const nt = nw.join(" ");
    return nt;
}