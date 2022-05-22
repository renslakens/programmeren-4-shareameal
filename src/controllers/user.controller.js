const assert = require('assert');
const pool = require('../../dbconnection');
const logger = require('../config/config').logger;
const jwt = require('jsonwebtoken');
const jwtSecretKey = require('../config/config').jwtSecretKey

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
            assert(typeof password === 'string', 'The password must a string');

            assert(emailAdress.match(/^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/), 'emailAdress is invalid');
            //8 karakters, 1 letter, 1 nummer en 1 speciaal teken
            assert(password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/), 'password is invalid');

            if (phoneNumber != undefined) {
                assert(typeof phoneNumber === 'string', 'The phoneNumber must be a string');
                assert(
                    phoneNumber.match(
                        /(06)(\s|\-|)\d{8}|31(\s6|\-6|6)\d{8}/
                    ),
                    'invalid phoneNumber'
                )
            }

            next();
        } catch (err) {
            logger.debug(err.message);
            const error = {
                status: 400,
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
            logger.debug(req.body);
            const error = {
                status: 400,
                message: err.message,
            };

            logger.debug(error);
            next(error);
        }
    },
    addUser: (req, res, next) => {
        const user = req.body;
        pool.query('INSERT INTO user SET ?', user, (dbError, result) => {
            if (dbError) {
                logger.debug(dbError.message);
                const error = {
                    status: 409,
                    message: 'User has not been added',
                    result: 'User is niet toegevoegd in database',
                };
                next(error);
            } else {
                logger.debug('InsertId is: ', result.insertId);
                user.userId = result.insertId;
                res.status(201).json({
                    status: 201,
                    message: 'User is toegevoegd in database',
                    result: { id: result.insertId, ...user },
                });
            }
        });
    },
    getAllUsers: (req, res) => {
        const queryParams = req.query;
        logger.debug(queryParams);

        let { firstName, isActive } = queryParams;
        let queryString = 'SELECT * FROM user';
        if (firstName || isActive) {
            queryString += ' WHERE ';
            if (firstName) {
                queryString += `firstName LIKE '${firstName}%'`;
            }
            if (firstName && isActive) {
                queryString += ' AND ';
            }
            if (isActive) {
                queryString += `isActive = ${isActive}`;
            }
        }
        queryString += ';';
        logger.debug(queryString);
        let users = [];

        pool.query(queryString, (error, results, fields) => {
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
                const user = results[0];
                if (err) {
                    const error = {
                        status: 400,
                        message: 'User with provided Id does not exist',
                    };
                    next(error);
                }

                if (user != null) {
                    res.status(200).json({
                        status: 200,
                        result: user,
                    });
                } else {
                    const error = {
                        status: 404,
                        message: 'User with provided Id does not exist',
                    };
                    next(error);
                }
            }
        );
    },
    getUserProfile: (req, res) => {
        if (req.headers && req.headers.authorization) {
            var authorization = req.headers.authorization.split(' ')[1],
                decoded;
            try {
                decoded = jwt.verify(authorization, jwtSecretKey);
            } catch (e) {
                return;
            }
            var userId = decoded.userId;
            pool.query(
                `SELECT * FROM user WHERE id = ${userId};`,
                function(error, results, fields) {
                    if (results.length == 0) {
                        res.status(404).json({
                            status: 404,
                            message: 'User does not exist'
                        });
                        logger.error(error);
                    } else {
                        res.status(200).json({
                            status: 200,
                            result: results,
                        });
                        logger.debug(results);
                    }
                }
            );
        }
    },
    updateUser: (req, res, next) => {
        const userId = req.params.id;
        const token = req.headers.authorization;
        const userIdToken = jwt.decode(token);

        if (userId === userIdToken) {
            const user = req.body;
            pool.query(
                `UPDATE user SET firstName = '${user.firstName}', lastName = '${user.lastName}', street = '${user.street}', city = '${user.city}', emailAdress = '${user.emailAdress}', password = '${user.password}' WHERE id = ${userId}`,
                (err, results) => {
                    const { affectedRows } = results;
                    if (err) throw err;

                    if (affectedRows == 0) {
                        const error = {
                            status: 404,
                            message: 'User with this provided id does not exist',
                        };
                        next(error);
                    } else {
                        res.status(200).json({ status: 200, result: 'Succesful update!' });
                    }
                }
            );
        } else {
            const error = {
                status: 403,
                message: 'You cannot update an account that is not yours!',
            };
            next(error);
        };
    },
    deleteUser: (req, res, next) => {
        const userId = req.params.id;
        const token = req.headers.authorization;
        const userIdToken = jwt.decode(token);

        if (userId === userIdToken) {
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
        } else {
            const error = {
                status: 403,
                message: 'You cannot delete an account that is not yours!',
            };
            next(error);
        };
    },
};

module.exports = controller;