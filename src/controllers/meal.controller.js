const assert = require('assert');
const pool = require('../../dbconnection');

let controller = {
    addMeal: (req, res, next) => {
        const user = req.body;
        pool.query('INSERT INTO meal SET ?', user, (dbError, result) => {
            if (dbError) {
                console.log(dbError.message);
                const error = {
                    status: 409,
                    message: 'User has not been added',
                    result: 'User is niet toegevoegd in database',
                };
                next(error);
            } else {
                console.log(result.insertId);
                user.userId = result.insertId;
                res.status(201).json({
                    status: 201,
                    message: 'User is toegevoegd in database',
                    result: user,
                });
            }
        });
    },
    getAllUsers: (req, res) => {
        let users = [];
        const queryParams = req.query
        console.log(`queryParams = ${queryParams}`);
        pool.query('SELECT * FROM user', (error, results, fields) => {
            results.forEach((user) => {
                users.push(user);
            });
            res.status(200).json({
                status: 200,
                result: users,
            });
        });
    },
    getUserById: (req, res, next) => {
        const userId = req.params.id;
        pool.query(
            `SELECT * FROM user WHERE id =${userId}`,
            (err, results, fields) => {
                if (err) throw err;

                if (results[0]) {
                    res.status(200).json({
                        status: 200,
                        result: results,
                    });
                } else {
                    const error = {
                        status: 404,
                        message: 'User with provided ID does not exist',
                    };
                    next(error);
                }
            }
        );
    },
    getUserProfile: (req, res) => {
        res.status(200).json({
            message: 'Not implemented yet',
        });
    },
    updateUser: (req, res, next) => {
        const userId = req.params.id;
        const user = req.body;
        pool.query(
            `UPDATE user SET firstName = '${user.firstName}', lastName = '${user.lastName}', street = '${user.street}', city = '${user.city}', emailAdress = '${user.emailAdress}', password = '${user.password}' WHERE id = ${userId}`,
            (err, results) => {
                const { affectedRows } = results;
                if (err) throw err;

                if (affectedRows == 0) {
                    const error = {
                        status: 404,
                        message: 'User with provided ID does not exist',
                        result: 'User with provided ID does not exist',
                    };
                    next(error);
                } else {
                    res.status(200).json({ status: 200, result: 'Succusful update!' });
                }
            }
        );
    },
    deleteUser: (req, res, next) => {
        const userId = req.params.id;
        pool.query(`DELETE FROM user WHERE id=${userId}`, (err, results) => {
            if (err) throw err;
            const { affectedRows } = results;
            if (!affectedRows) {
                const error = {
                    status: 400,
                    result: 'User does not exist',
                };
                next(error);
            } else {
                res.status(200).json({ status: 200, result: 'Succesful deletion' });
            }
        });
    },
};

module.exports = controller;