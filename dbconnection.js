<<<<<<< HEAD
const mysql = require('mysql');
=======
const mysql = require('mysql2');
>>>>>>> feature-testing
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

<<<<<<< HEAD
module.exports = pool;

pool.on('acquire', function(connection) {
    console.log('Connection %d acquired', connection.threadId)
});
=======
// pool.getConnection(function(err, connection) {
//     if (err) throw err;
// });

pool.on('acquire', function(connection) {
    console.log('Connection %d acquired', connection.threadId)
});

module.exports = pool;
>>>>>>> feature-testing
