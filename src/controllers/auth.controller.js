const assert = require('assert');
const pool = require('../../dbconnection');

let controller = {
    login: (req, res, next) => {
        pool.query(queryString, [name, isActive], function(err, connection) {

        });
    },
};

module.exports = controller;