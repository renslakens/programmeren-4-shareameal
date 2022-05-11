const assert = require('assert');
const pool = require('../../dbconnection');
let database = [];
let id = 0;

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let { firstName, lastName, street, city, isActive, emailAdress, phoneNumber, password } = user;
        try {
            assert(typeof firstName === 'string', 'The firstname must be a string');
            assert(typeof lastName === 'string', 'The lastName must be a string');
            assert(typeof street === 'string', 'The street must be a string');
            assert(typeof city === 'string', 'The city must be a string');
            assert(typeof isActive === 'number', 'IsActive must be a number');
            assert(typeof emailAdress === 'string', 'The emailAddress must be a string');
            assert(typeof phoneNumber === 'string', 'The phoneNumber must be a string');
            assert(typeof password === 'string', 'The password must a string');

            next();
        } catch (err) {
            console.log(err.message);
            const error = {
                status: 400,
                result: err.message,
                message: err.message,
            };
            next(error);
        }
    },
    validateId: (req, res, next) => {
        const userId = req.params.id;
        try {
            assert(Number.isInteger(parseInt(userId)), 'ID must be a number');
            next();
        } catch (err) {
            console.log(req.body);
            const error = {
                status: 400,
                message: err.message,
            };

            console.log(error);
            next(error);
        }
    },
    addUser: (req, res, next) => {
        const user = req.body;
        pool.query('INSERT INTO user SET ?', user, (dbError, result) => {
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
            `UPDATE user SET ? WHERE id = ?`, [newUserInfo, userId], (err, res, fields) => {
                const { affectedRows } = results;
                if (err) throw err;

                if (res.affectedRows > 0) {
                    res.status(200).json({
                        status: 200,
                        result: res,
                    });
                } else {
                    res.status(404).json({
                        status: 404,
                        message: "User does not exist",
                    });
                }
            });
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