const connection = require("../../config/db.config");
const sidebar_active = 'home';

/**
 * @route '/home'
 * @method GET
 * @description get homepage
 **/
exports.getHomepage = async (req, res) => {
    let { id, username, email } = [];
    const user_session = req.session.user;

    let all_memory_count = 0;
    let dts_memory_count = 0;
    let licence_memory_count = 0;
    let masteri_memory_count = 0;
    let masterii_memory_count = 0;

    if (user_session) {
        ({ id, username, email } = user_session);
    } else {
        ({ id, username, email } = req.cookies['rememberme'].user_info);
    }

    let query = `SELECT * FROM memory`;
    let query_2 = `SELECT * FROM memory WHERE degree = 'DTS' `;
    let query_3 = `SELECT * FROM memory WHERE degree = 'Licence' `;
    let query_4 = `SELECT * FROM memory WHERE degree = 'Master I' `;
    let query_5 = `SELECT * FROM memory WHERE degree = 'Master II' `;

    connection.execute(query, (err, result) => {
        if (err) throw err;
        all_memory_count = result.length;

        connection.execute(query_2, (err, result) => {
            if (err) throw err;
            dts_memory_count = result.length;

            connection.execute(query_3, (err, result) => {
                if (err) throw err;
                licence_memory_count = result.length;

                connection.execute(query_4, (err, result) => {
                    if (err) throw err;
                    masteri_memory_count = result.length;

                    connection.execute(query_5, (err, result) => {
                        if (err) throw err;
                        masterii_memory_count = result.length;

                        res.status(200).render('home', { id, username, email, active: sidebar_active, all_memory_count, dts_memory_count, licence_memory_count, masteri_memory_count, masterii_memory_count });
                    });
                });
            });
        });
    });
}
