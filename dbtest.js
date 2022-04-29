const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'share-a-meal'
});

connection.connect();

connection.query('SELECT * from user', function(error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results);
});

connection.end();