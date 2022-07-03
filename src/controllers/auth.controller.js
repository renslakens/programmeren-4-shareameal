const assert = require('assert');
const pool = require('../../dbconnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../config/config').logger;
const jwtSecretKey = require('../config/config').jwtSecretKey;

let controller = {
    login(req, res, next) {
        let user = req.body;
        logger.debug("User with email: " + user.emailAdress + " is trying to login");
        pool.query('SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?', user.emailAdress, (err, rows, fields) => {
            if (err) {
                logger.debug(err);
                res.status(500).json({
                    status: 500,
                    message: err.toString(),
                })
            }

            if (rows) {
                // Check the password
                if (rows && rows.length === 1 && bcrypt.compareSync(user.password, rows[0].password)) {
                    logger.info('passwords DID match, sending userinfo and valid token');

                    // Extract the password from the userdata
                    const { password, ...userinfo } = rows[0];
                    // Create an object containing the payload
                    const payload = {
                        userId: userinfo.id,
                    }

                    jwt.sign(payload, jwtSecretKey, { expiresIn: '12d' }, function(err, token) {
                        logger.debug('User logged in, sending: ', userinfo);
                        res.status(200).json({
                            status: 200,
                            result: {...userinfo, token },
                        });
                    });
                } else {
                    logger.info('User not found or password invalid');
                    res.status(404).json({
                        status: 404,
                        message: 'User not found or password invalid',
                    })
                }
            }
        })
    },

    validateLogin(req, res, next) {
        let user = req.body;
        logger.debug("Validate login called");
        // Verifies the input
        try {
            assert(typeof user.emailAdress === 'string', 'Email must be a string');
            assert(typeof user.password === 'string', 'Password must be a string');

            next();
        } catch (err) {
            res.status(400).json({
                status: 400,
                message: err.message,
            })
        }
    },

    validateToken(req, res, next) {
        logger.info('validateToken called');
        // The headers should contain the authorization-field with the value 'Bearer [token]'
        const authHeader = req.headers.authorization

        if (!authHeader) {
            logger.warn('Authorization header is missing');
            res.status(401).json({
                status: 401,
                message: 'Authorization header is missing',
                datetime: new Date().toISOString(),
            });
        } else {
            // Removes the word 'Bearer ' from the headervalue
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, jwtSecretKey, (err, payload) => {
                if (err) {
                    logger.warn('Not authorized');
                    res.status(401).json({
                        status: 401,
                        message: 'Not authorized',
                    })
                } else if (payload) {
                    logger.debug('token is valid', payload);
                    // User has access, adds UserId from payload to the request
                    req.userId = payload.userId
                    next()
                }
            })
        }
    },
};

module.exports = controller;