const connection = require("../../config/db.config");
const fs = require('fs');
const PDF = require('pdf-parse');

let sidebar_active = 'per_mention';

let { id, username, email } = [];

let page;
let mention;
let totalPage;
let limit = 10;
let total_memories = 0;
let memory;

let msg;

/**
 * Fonction communes
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

// default render callback
function render_page(pageData) {
    //check documents https://mozilla.github.io/pdf.js/
    let render_options = {
        //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
        normalizeWhitespace: true,
        //do not attempt to combine same line TextItem's. The default value is `false`.
        disableCombineTextItems: true
    }

    return pageData.getTextContent(render_options)
        .then((textContent) => {
            let lastY, text = '';
            for (let item of textContent.items) {
                if (lastY == item.transform[5] || !lastY) {
                    text += item.str;
                }
                else {
                    text += '\n' + item.str;
                }
                lastY = item.transform[5];
            }
            return text;
        });
}

// Fonction pour calculer la similarité de Jaccard entre deux ensembles
function jaccardSimilarity(set1, set2) {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
}

// Fonction pour diviser le texte en phrases
function splitTextIntoSentences(text) {
    return text.split(/[.!?]/).filter(sentence => sentence.trim() !== '');
}

function cleanText(text) {
    // Remplacer les doubles espaces par un seul espace
    let cleanedText = text.replace(/\s{2,}/g, ' ');
    // Remplacer les sauts de ligne par un seul espace
    cleanedText = cleanedText.replace(/\n+/g, ' ');
    // Retourner le texte nettoyé
    return cleanedText;
}

function normalizePath(path) {
    path = 'public' + path.replace(/\\/g, '/');
    path = JSON.stringify(path);
    path = path.replace(/\"/g, '');
    path = path.replace(/\s/g, '');
    return path;
}

/**
 * Fin du fonction de commun
 */

/**
 * @route '/memory/per_mention'
 * @method GET
 * @description get all memory per mention
 */
exports.getMemoryPerMention = (req, res) => {
    get_user_info(req)

    const skip = get_skip_page(req);

    mention = req.query.mention || 'Droit';

    const memory_compare = req.cookies['memory_compare'];

    if (memory_compare) {
        msg = 'Veuillez rechercher le mémoire à comparer';
    }

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
            res.status(200).render('memory/per_mention', { id, username, email, msg, active: sidebar_active, memory, mention, totalM: total_memories, currentPage: page, totalPage });
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

    const memory_compare = req.cookies['memory_compare'];

    if (memory_compare) {
        msg = 'Veuillez rechercher le mémoire à comparer';
    }

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
        res.status(200).render('memory/per_diploma', { id, username, email, msg, diploma, mention, memory, total_memories, currentPage: page, totalPage, mention_list, active: sidebar_active });
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

    const memory_compare = req.cookies['memory_compare'];

    if (memory_compare) {
        msg = 'Veuillez rechercher le mémoire à comparer';
    }

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

                res.status(200).render('memory/per_theme', { id, username, email, memory, filter_search, filter_search_en, total_memories, currentPage: page, totalPage, search: theme_search, active: sidebar_active, msg });
            } else {

                res.status(200).render('memory/per_theme', { id, username, email, memory, filter_search, filter_search_en, total_memories, currentPage: page, totalPage, search: theme_search, active: sidebar_active, msg });
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

        res.status(200).render('memory/per_theme', { id, username, email, memory, filter_search, filter_search_en, total_memories, currentPage: page, totalPage, search: theme_search, active: sidebar_active, msg });
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

    const memory_compare = req.cookies['memory_compare'];

    if (memory_compare) {
        msg = 'Veuillez rechercher le mémoire à comparer';
    }
    connection.query(query, (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            total_memories = result.length;
        }
    });

    query = `SELECT * FROM memory ORDER BY id DESC LIMIT ${limit} OFFSET ${skip}`;

    connection.query(query, (err, result) => {
        if (err) throw err;

        if (result.length > 0) {

            memory = result;
            totalPage = Math.ceil(total_memories / limit);
            sidebar_active = 'all';

            res.status(200).render('memory/all', { id, username, email, msg, active: sidebar_active, memory, totalM: total_memories, currentPage: page, totalPage });
        }
    });
};

/**
 * @route '/memory'
 * @method DELETE
 * @param id_m
 * @param id_f
 * @description delete memory
 */
exports.deleteMemory = (req, res) => {
    const { id_m, id_f } = req.query;

    let query = `SELECT * FROM files WHERE id = ${id_f}`;

    connection.query(query, (err, result) => {
        if (err) throw err;

        if (result.length > 0) {

            result.map((file) => {

                const file_path = file.path;

                fs.unlink(file_path, (err) => {

                    if (err) throw err;

                    // console.log('file deleted successful')

                    let query2 = `DELETE FROM memory WHERE id = ${id_m}`;

                    connection.execute(query2, (err, result) => {
                        if (err) throw err;

                        if (result.affectedRows > 0) {
                            let query3 = `DELETE FROM files WHERE id = ${id_f}`;

                            connection.execute(query3, (err, result) => {

                                if (err) throw err;

                                if (result.affectedRows > 0) {

                                    res.status(200).render('memory/all', { id, username, email, active: sidebar_active, msg: '', memory, totalM: total_memories, currentPage: page, totalPage });
                                }

                            });
                        }
                    });
                });
            })
        }
    });
}

/**
 * @route '/memory'
 * @method GET
 * @param id
 * @description update memory info
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
 * @route '/memory'
 * @method POST
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
 * @route '/memory'
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
                    });
                });
            });
        } else {
            memory = null;
            res.status(404).render('404');
        }
    });
}

/**
 * @route '/memory/compare'
 * @method GET
 * @param id_m
 * @description to compare 2 pdf
 */
exports.getFormCompare = (req, res) => {
    let isResult;

    if (req.cookies['memory_compare']) {
        const memory_compare = req.cookies['memory_compare'].id_m;

        const to_compare = req.query.id_m;

        res.cookie('to_compare', { to_compare });

        // ---------------------- 1----------
        let query = `SELECT * FROM memory WHERE id = ${memory_compare} LIMIT 1`;

        connection.query(query, (err, result) => {
            if (err) throw err;

            if (result.length > 0) {

                memory = result;
                memory.map((memory) => {

                    query = `SELECT * FROM files WHERE id = ${memory.file}`;

                    connection.query(query, (err, result) => {
                        result.map((file) => {
                            const file_path = (file.path).replace('public', ' ');
                            const memory_1 = memory;
                            const file_1 = file_path;

                            // ---------------------- 2----------
                            query = `SELECT * FROM memory WHERE id = ${to_compare} LIMIT 1`;

                            connection.query(query, (err, result2) => {
                                if (err) throw err;

                                if (result2.length > 0) {

                                    const memory2 = result2;

                                    memory2.map((memory) => {

                                        query = `SELECT * FROM files WHERE id = ${memory.file}`;

                                        connection.query(query, (err, result) => {
                                            result.map((file) => {
                                                const file_path2 = (file.path).replace('public', ' ');
                                                const memory_2 = memory;
                                                const file_2 = file_path2;

                                                isResult = false;

                                                res.render('memory/compare/compare', { id, username, email, isResult, memory_compare, to_compare, memory_1, memory_2, file_1, file_2, active: sidebar_active })

                                            });
                                        });
                                    });
                                }
                            });
                        });
                    });
                });
            }
        });
    } else {
        const { id_m } = req.query;

        if (id_m) {

            res.cookie('memory_compare', { id_m }, { httpOnly: true });
        }

        res.redirect('/memory/all');
    }
}

/**
 * @route '/memory/compare'
 * @method POST
 * @description to compare 2 pdf
 */
exports.compareMemory = (req, res) => {
    let path_pdf_1 = req.body.memory_1;
    let path_pdf_2 = req.body.memory_2;

    let to_compare = (req.cookies['to_compare'].to_compare);
    let memory_compare = (req.cookies['memory_compare'].id_m);

    let identiquePhrases = [];
    let identiquePerc;

    let isResult;

    path_pdf_1 = normalizePath(path_pdf_1);
    path_pdf_2 = normalizePath(path_pdf_2);

    let dataBuffer = fs.readFileSync(path_pdf_1);
    let dataBuffer2 = fs.readFileSync(path_pdf_2);

    let options = {
        pagerender: render_page,
        max: 100
    }

    let text1 = '';
    let text2 = '';

    PDF(dataBuffer, options).then((data) => {
        text1 = data.text;

        PDF(dataBuffer2, options).then((data2) => {
            text2 = data2.text;

            text1 = cleanText(text1);
            text2 = cleanText(text2);

            // Diviser les textes en phrases
            const sentences1 = splitTextIntoSentences(text1);
            const sentences2 = splitTextIntoSentences(text2);

            const set1 = new Set(sentences1);
            const set2 = new Set(sentences2);

            // Calculer la similarité de Jaccard
            const similarity = jaccardSimilarity(set1, set2);

            let similarityFixed2 = (similarity * 100).toFixed(2);
            // Afficher le résultat
            identiquePerc = similarityFixed2;
            // console.log(`La Similarity entre\n\n\n\n\n\n  \net \n\n\n \n : ${similarityFixed2} %\n et sans ${similarity}`);
            // displayIdenticalPhrases(set1, set2);

            set1.forEach(phrase => {
                if (set2.has(phrase)) {
                    identiquePhrases += ('\n' + phrase + ' \n');
                }
                // console.log(identiquePhrases)
            });






            // ---------------------- 1----------
            let query = `SELECT * FROM memory WHERE id = ${memory_compare} LIMIT 1`;

            connection.query(query, (err, result) => {
                if (err) throw err;

                if (result.length > 0) {

                    memory = result;
                    memory.map((memory) => {

                        query = `SELECT * FROM files WHERE id = ${memory.file}`;

                        connection.query(query, (err, result) => {
                            result.map((file) => {
                                const file_path = (file.path).replace('public', ' ');
                                const memory_1 = memory;
                                const file_1 = file_path;

                                // ---------------------- 2----------
                                query = `SELECT * FROM memory WHERE id = ${to_compare} LIMIT 1`;

                                connection.query(query, (err, result2) => {
                                    if (err) throw err;

                                    if (result2.length > 0) {

                                        const memory2 = result2;

                                        memory2.map((memory) => {

                                            query = `SELECT * FROM files WHERE id = ${memory.file}`;

                                            connection.query(query, (err, result) => {
                                                result.map((file) => {
                                                    const file_path2 = (file.path).replace('public', ' ');
                                                    const memory_2 = memory;
                                                    const file_2 = file_path2;
                                                    // console.log(identiquePhrases.trim())
                                                    isResult = true;

                                                    res.clearCookie('memory_compare');
                                                    res.clearCookie('to_compare');

                                                    res.render('memory/compare/compare', { id, username, email, isResult, identiquePerc, identiquePhrases, memory_compare, to_compare, memory_1, memory_2, file_1, file_2, active: sidebar_active })

                                                });
                                            });
                                        });
                                    }
                                });
                            });
                        });
                    });
                }
            });
        })
            .catch((error) => {
                console.error('Erreur ', error)
            });
    })
        .catch((error) => {
            console.error('Erreur ', error)
        });
}

/**
 * @route '/compare_to_all'
 * @method POST
 * @description to compare pdf
 */
exports.compareMemoryToAll = (req, res) => {
    let { memory_file_path, memory_mention_m } = req.body;
    let { student_name, theme, degree, mention, academic_year, keywords, memory_path, is_added } = req.body;

    let memory_cookie;
    // let query1 = `SELECT * FROM files WHERE id = ${memory_file_path}`;

    // connection.query(`SELECT * FROM files WHERE id = ${memory_file_path}`, (err, result) => {
    //     console.log(query, result)
    //     result.map((file) => {
    //         const file_path = (file.path).replace('public', ' ');
    if (req.body.student_name) {
        let file_path = (memory_path).replace('public', ' ');
        const mmm = {
            student_name,
            theme,
            degree,
            mention,
            academic_year,
            keywords,
            memory_path,
            file_path
        }
        res.cookie('memory_temp_info', { memory: mmm }, { httpOnly: true });
        console.log(mmm)
        memory_cookie = mmm;
    }
    //     });
    // });

    if (memory_path) {
        memory_file_path = memory_path;
    }

    let files = [];
    let memories_match = [];
    let similarityRes = [];
    let identiquePhrase = [];
    let paths = [];

    // Fetch all file path in memory mention
    let query = `SELECT * FROM memory WHERE mention = '${memory_mention_m}' ORDER BY academic_year DESC `;
console.log(query)
    connection.query(query, (err, result) => {
        if (err) throw err;

        let in_compare = true;
        if (result.length > 0) {

            result.forEach(res => {
                files.push(res.file);
                memories_match.push(res);
            });

            for (let i = 0; i < files.length; i++) {

                query = `SELECT (path) FROM files WHERE id = ${files[i]}`;

                connection.query(query, (err, result) => {

                    if (err) throw err;

                    result.forEach(res => paths.push(res.path));

                    const path1 = memory_file_path;
                    const path2 = paths[i];

                    let dataBuffer = fs.readFileSync(path1);
                    let dataBuffer2 = fs.readFileSync(path2);

                    let similarityFixed2;
                    let identiquePhrases = [];


                    let options = {
                        pagerender: render_page,
                        max: 100
                    };

                    let text1 = '';
                    let text2 = '';

                    PDF(dataBuffer, options).then(function (data) {
                        text1 = data.text;

                        PDF(dataBuffer2, options).then(function (data2) {
                            text2 = data2.text;

                            text1 = cleanText(text1);
                            text2 = cleanText(text2);

                            // Diviser les textes en phrases
                            const sentences1 = splitTextIntoSentences(text1);
                            const sentences2 = splitTextIntoSentences(text2);

                            const set1 = new Set(sentences1);
                            const set2 = new Set(sentences2);

                            // Calculer la similarité de Jaccard
                            const similarity = jaccardSimilarity(set1, set2);
                            similarityFixed2 = (similarity * 100).toFixed(2);

                            similarityRes.push(similarityFixed2);

                            if ((similarityRes[i] == 100.00)) {
                                similarityRes[i] = 100;
                            }

                            set1.forEach(phrase => {
                                if (set2.has(phrase)) {
                                    identiquePhrases += ('\n' + phrase + ' \n');
                                }
                            });

                            identiquePhrase.push(identiquePhrases);

                            if (is_added === 'true') {
                                is_added = 'true';
                            } else {
                                is_added = 'false';
                                    memory_cookie = req.cookies['memory_temp_info'].memory;
                            }

                            if (i === (memories_match.length - 1)) {
                                let active = 'add';
                                res.status(200).render('memory/compare/res_for_all', { id, username, email, memory: memory_cookie, memories_match, similarityRes, identiquePhrase, is_added, active });
                            }
                        });
                    });
                });
            };
        } else {
            let active = 'add';
            memory = req.cookies['memory_temp_info'].memory;
            res.status(200).render('memory/compare/before_add', { id, username, email, memory, memories_match, similarityRes, identiquePhrase, in_compare, active });
        }
    });
}

/**
 * @route '/memory/compare_or_add'
 * @method POST
 * @description before compare pdf
 */
exports.before_add_compare = (req, res) => {
    const { student_name, theme, degree, mention, academic_year, keywords } = req.body;
    // const theme_uppercase = theme.slice(0, 1).toUpperCase() + theme.slice(1).toLowerCase();
    const theme_uppercase = capitalizeEachWord(theme);

    const file = req.file;

    let file_path = (file.path).replace('public', ' ');

    const memory = {
        student_name,
        theme,
        degree,
        mention,
        academic_year,
        keywords,
        file,
        file_path
    }

    // Sending to cookie memory's infos
    res.cookie('memory_temp_info', { memory }, { httpOnly: true });

    let active = 'all';
    let in_compare = false;
    let memories_match, similarityRes, identiquePhrase;

    res.status(200).render('memory/compare/before_add', { id, username, email, memory, memories_match, similarityRes, identiquePhrase, in_compare, active });
}
