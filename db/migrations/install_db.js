const mysql = require('mysql2');
require('dotenv').config();

var query, connection;

connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
});

query = `CREATE DATABASE if not exists ${process.env.DATABASE_NAME}`;

connection.query(query, async (err, res) => {

    if (err) { console.error('Erreur: ', err.message); }

    else { console.log('Database created successful'); }
});

connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

query = `CREATE TABLE if not exists users ( id INT NOT NULL AUTO_INCREMENT, username VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(255) NOT NULL, PRIMARY KEY(id) ) ENGINE = InnoDB DEFAULT CHARSET = utf8`;

connection.query(query, async (err, res) => {

    if (err) {
        console.error('Erreur: ', err.message);
    }
    else {
        console.log(`Table users created successful`);
    }
});

query = `CREATE TABLE if not exists files ( id INT NOT NULL AUTO_INCREMENT , filename VARCHAR(255) NOT NULL , path VARCHAR(255) NOT NULL , PRIMARY KEY (id)) ENGINE = InnoDB DEFAULT CHARSET = utf8`;

connection.query(query, async (err, res) => {

    if (err) {
        console.error('Erreur: ', err.message);
    }
    else {
        console.log(`Table files created successful`);
    }
});

query = `CREATE TABLE if not exists memory ( id INT NOT NULL AUTO_INCREMENT , student_name VARCHAR(255) NOT NULL , theme VARCHAR(255) NOT NULL , degree VARCHAR(255) NOT NULL , mention VARCHAR(255) NOT NULL , academic_year VARCHAR(255) NOT NULL , keywords VARCHAR(255) NOT NULL, file INT NOT NULL , PRIMARY KEY (id), FOREIGN KEY (file) REFERENCES files(id)) ENGINE = InnoDB DEFAULT CHARSET = utf8`;

connection.query(query, async (err, res) => {
    if (err) {
        console.error('Erreur: ', err.message);
    }
    else {
        console.log(`Table memory created successful`);
    }
    process.exit(0);
});
