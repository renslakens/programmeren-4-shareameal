const assert = require('assert');
const pool = require('../../dbconnection');
const logger = require('../config/config').logger;
const bcrypt = require('bcrypt');
const saltRounds = 10;
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
    checkUniqueEmail: (req, res, next) => {
        logger.info('checkUniqueEmail called')
        if (req.body.emailAdress != undefined) {
            pool.query(
                'SELECT * FROM user WHERE emailAdress=?;', [req.body.emailAdress],
                (error, results, fields) => {
                    if (error) {
                        logger.error(error.sqlMessage)
                        return next({
                            status: 500,
                            message: error.sqlMessage,
                        })
                    } else {
                        logger.debug(results[0])
                        var user = Object.assign({}, results[0])
                        if (results.length > 0 && user.id != req.params.id) {
                            logger.warn('Email already in use')
                            return next({
                                status: 409,
                                message: `The email address ${req.body.emailAdress} is already in use, please use a different emailaddress.`,
                            })
                        } else {
                            return next()
                        }
                    }
                }
            )
        } else {
            return next()
        }
    },
    addUser: (req, res) => {
        let user = req.body;

        //Hash the password
        //user.password = bcrypt.hashSync(user.password, saltRounds);

        //Insert the user object into the database
        pool.query(`INSERT INTO user SET ?`, user, function(dbError, result, fields) {
            // Handle error after the release.
            if (dbError) {
                logger.debug(dbError);
                if (dbError.errno == 1062) {
                    res.status(409).json({
                        status: 409,
                        message: "Email is already used"
                    });
                } else {
                    logger.error(dbError);
                    res.status(500).json({
                        status: 500,
                        result: "Error"
                    });
                }
            } else {
                res.status(201).json({
                    status: 201,
                    result: {
                        id: result.insertId,
                        ...user
                    }
                });
            }
        });
    },
    getAllUsers: (req, res) => {
        let { id, firstName, lastName, street, city, isActive, emailAdress, phoneNumber } = req.query;

        if (!id) { id = '%' }
        if (!firstName) { firstName = '%' }
        if (!lastName) { lastName = '%' }
        if (!street) { street = '%' }
        if (!city) { city = '%' }
        if (!isActive) { isActive = '%' }
        if (!emailAdress) { emailAdress = '%' }
        if (!phoneNumber) { phoneNumber = '%' }

        pool.query(`SELECT id, firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city 
            FROM user WHERE id LIKE ? AND firstName LIKE ? AND lastName LIKE ? AND street LIKE ? AND city LIKE ? AND isActive LIKE ? AND emailAdress LIKE ? AND phoneNumber LIKE ?`, [id, '%' + firstName + '%', '%' + lastName + '%', '%' + street + '%', '%' + city + '%', isActive, '%' + emailAdress + '%', '%' + phoneNumber + '%'], function(dbError, results, fields) {
            if (dbError) {
                if (dbError.errno === 1064) {
                    res.status(400).json({
                        status: 400,
                        message: "Something went wrong with the filter URL"
                    });
                    return;
                } else {
                    logger.error(dbError);
                    res.status(500).json({
                        status: 500,
                        result: "Error"
                    });
                    return;
                }
            }

            res.status(200).json({
                status: 200,
                result: results
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
        const userId = req.userId;

        logger.debug(`getUserProfile called with userId: ${userId}`);

        pool.query('SELECT * FROM user WHERE id = ' + userId, function(dbError, results, fields) {
            if (dbError) {
                logger.error(dbError);
                res.status(500).json({
                    status: 500,
                    result: "Error"
                });
                return;
            }

            const result = results[0];
            if (result) {
                res.status(200).json({
                    status: 200,
                    result: result
                });
            } else {
                res.status(404).json({
                    status: 404,
                    message: "User does not exist"
                });
            }
        });
    },
    updateUser: (req, res) => {
        const newUserInfo = req.body;
        const userId = req.params.id;

        //Hash the password
        newUserInfo.password = bcrypt.hashSync(newUserInfo.password, saltRounds);

        pool.query('UPDATE user SET ? WHERE id = ?', [newUserInfo, userId], function(dbError, results, fields) {
            if (results.affectedRows > 0) {
                res.status(200).json({
                    status: 200,
                    message: `${userId} successfully updated`,
                    result: {
                        id: userId,
                        ...newUserInfo
                    }
                });
            } else {
                if (dbError == null) {
                    res.status(400).json({
                        status: 400,
                        result: "User does not exist"
                    });
                } else {
                    logger.error(dbError);
                    res.status(500).json({
                        status: 500,
                        result: "Error"
                    });
                }
            }
        });
    },
    deleteUser: (req, res, next) => {
        if (req.headers && req.headers.authorization) {
            var authorization = req.headers.authorization.split(' ')[1],
                decoded;
            try {
                decoded = jwt.verify(authorization, jwtSecretKey);
            } catch (e) {
                return;
            }
            const userId = decoded.userId;
            const id = req.params.id;

            if (userId == id) {
                pool.query(
                    "DELETE FROM user WHERE id = ?",
                    id,
                    function(dbError, results, fields) {
                        if (results.affectedRows > 0) {
                            res.status(200).json({
                                status: 200,
                                message: "User is successfully deleted",
                            });
                        } else {
                            const err = {
                                status: 400,
                                message: "User does not exist"
                            }
                            next(err);
                        }
                    }
                );
            } else {
                const err = {
                    status: 403,
                    message: "You are not authorized to delete this user"
                }
                next(err);
            }
        }
    },
};

module.exports = controller;