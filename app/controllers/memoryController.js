const connection = require("../../config/db.config");

/**
 * @route '/memory/per_mention'
 * @method GET
 * @description get all memory per mention
 */
exports.getMemoryMention = (req, res) => {
    let { id, username, email } = [];
    const userSess = req.session.user;
    if (userSess) {
        ({ id, username, email } = userSess);
    } else {
        ({ id, username, email } = req.cookies['rememberme'].userC);
    }

    const page = req.query.page || 1;
    const mention = req.query.mention || 'Droit';
    const limit = 15;
    const skip = (page - 1) * limit;
    let totalM = 0;
    
    const query1 = `SELECT * FROM memory WHERE mention='${mention}'`;
    connection.query(query1, (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            totalM = result.length;
        }
    });

    const active = 'per_mention';
    let query = `SELECT * FROM memory WHERE mention='${mention}' LIMIT ${limit} OFFSET ${skip}`;
    var memory;
    connection.query(query, (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            memory = result;
            const totalPage = Math.ceil(totalM / limit);
            res.status(200).render('memory/per_mention', { id, username, email, active, memory, mention, totalM, currentPage: page, totalPage });
        }
    });
};