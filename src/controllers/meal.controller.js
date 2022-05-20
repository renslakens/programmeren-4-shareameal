const assert = require('assert');
const pool = require('../../dbconnection');

let controller = {
    validateMeal: (req, res, next) => {
        let meal = req.body;
        let { name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, allergenes, cook, participants } = meal;
        try {
            assert(typeof name === 'string', 'The name must be a string');
            assert(typeof description === 'string', 'The description must be a string');
            assert(typeof isActive === 'boolean', 'isActive must be a boolean');
            assert(typeof isVega === 'boolean', 'isVega must be a boolean');
            assert(typeof isVegan === 'boolean', 'isVegan must be a boolean');
            assert(typeof isToTakeHome === 'boolean', 'isToTakeHome must be a boolean');
            assert(typeof dateTime === 'string', 'dateTime must be a string');
            assert(typeof maxAmountOfParticipants === 'number', 'The maxAmountOfParticipants must a number');
            assert(typeof price === 'number', 'The price must be a number');
            assert(typeof imageUrl === 'string', 'The imageUrl must be a string');
            assert(typeof allergenes === 'string', 'The allergenes must a string');
            assert(typeof cook === 'string', 'The cook must be a string');
            assert(typeof participants === 'string', 'The participants must a string');

            next();
        } catch (err) {
            logger.debug(err.message);
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
                logger.debug(result.insertId);
                user.userId = result.insertId;
                res.status(201).json({
                    status: 201,
                    message: 'User is toegevoegd in database',
                    result: { id: result.insertId, ...user },
                });
            }
        });
    },
    getAllMeals: (req, res) => {
        const queryParams = req.query;
        logger.debug(queryParams);

        let { name, isActive } = queryParams;
        let queryString = "SELECT * FROM meal";
        if (name || isActive) {
            queryString += " WHERE ";
            if (name) {
                queryString += `name LIKE '${name}%'`;
            }
            if (name && isActive) {
                queryString += " AND ";
            }
            if (isActive) {
                queryString += `isActive = ${isActive}`;
            }
        }
        queryString += ";";
        logger.debug(queryString);
        let meals = [];

        pool.query(queryString, (error, results, fields) => {
            results.forEach((meal) => {
                users.push(meal);
            });
            res.status(200).json({
                status: 200,
                result: meals,
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
                        status: 404,
                        message: "User with provided Id does not exist",
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
                        message: "User with provided Id does not exist",
                    };
                    next(error);
                }
            }
        );
    },
    getUserProfile: (req, res) => {
        const tokenString = req.headers.authorization.split(" ");
        const token = tokenString[1];
        const payload = jwt.decode(token);
        const userId = payload.userId;

        pool.query(
            `SELECT id, firstName, lastName, emailAdress FROM user where id=${userId}`,
            (err, results, fields) => {
                if (!(results.length > 0)) {
                    const error = {
                        status: 404,
                        message: "User does not exist",
                    };
                    next(error);
                } else {
                    res.status(200).json({
                        status: 200,
                        results: results,
                    });
                }
            }
        );
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
                            message: "User with provided id does not exist",
                        };
                        next(error);
                    } else {
                        res.status(200).json({ status: 200, result: "Succusful update!" });
                    }
                }
            );
        } else {
            const error = {
                status: 403,
                message: "You cannot update an account that is not yours!",
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
                        result: "User does not exist",
                    };
                    next(error);
                } else {
                    res.status(200).json({ status: 200, result: "Succesful deletion" });
                }
            });
        } else {
            const error = {
                status: 403,
                message: "You cannot delete an account that is not yours!",
            };
            next(error);
        };
    },
};

module.exports = controller;