const connection = require('../../config/db.config');
const Users = require('../../db/models/Users');
const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * @route 'api/getUsers'
 * @method GET
 * @description get all users 
 */
exports.getUser = async (req, res) => {
    const query = 'SELECT * FROM Users';
    connection.query(query, (err, rows) => {
        if (err) throw err;
        res.status(200).json(rows);
    })
}



