const assert = require('assert');
const pool = require('../../dbconnection');
const jwt = require('jsonwebtoken');
const logger = require('../config/config').logger;

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
        const mealId = req.params.id;
        try {
            assert(Number.isInteger(parseInt(mealId)), 'ID must be a number');
            next();
        } catch (err) {
            logger.debug(req.body);
            const error = {
                status: 400,
                message: err.message,
            };

            logger.error(error);
            next(error);
        }
    },
    addMeal: (req, res, next) => {
        const meal = req.body;
        pool.query('INSERT INTO meal SET ?', meal, (dbError, result) => {
            if (dbError) {
                logger.debug(dbError.message);
                const error = {
                    status: 409,
                    message: 'Meal has not been added',
                    result: 'Meal is niet toegevoegd in database',
                };
                next(error);
            } else {
                logger.debug(result.insertId);
                meal.mealId = result.insertId;
                res.status(201).json({
                    status: 201,
                    message: 'Meal is toegevoegd in database',
                    result: { id: result.insertId, ...meal },
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
                meals.push(meal);
            });
            res.status(200).json({
                status: 200,
                result: meals,
            });

        });
    },
    getMealById: (req, res, next) => {
        const mealId = req.params.id;
        pool.query(
            `SELECT * FROM meal WHERE id =${mealId}`,
            (err, results, fields) => {
                const user = results[0];
                if (err) {
                    const meal = {
                        status: 404,
                        message: "Meal with provided Id does not exist",
                    };
                    logger.error(meal.message);
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
                        message: "Meal with provided Id does not exist",
                    };
                    logger.error(error.message);
                    next(error);
                }
            }
        );
    },
    updateMeal: (req, res, next) => {
        const mealId = req.params.id;
        const token = req.headers.authorization;
        const cookIdToken = jwt.decode(token);

        if (mealId === cookIdToken) {
            const meal = req.body;
            pool.query(
                `UPDATE meal SET name = '${meal.name}', description = '${meal.description}', isActive = '${meal.isActive}', isVega = '${meal.isVega}', isVegan = '${meal.isVegan}', isToTakeHome = '${meal.isToTakeHome}, dateTime = '${meal.dateTime}, imageUrl = '${meal.imageUrl}, allergenes = '${meal.allergenes}, maxAmountOfParticipants = '${meal.maxAmountOfParticipants}, price = '${meal.price}' WHERE id = ${mealId}`,
                (err, results) => {
                    const { affectedRows } = results;
                    if (err) throw err;

                    if (affectedRows == 0) {
                        const error = {
                            status: 404,
                            message: "Meal with provided Id does not exist",
                        };
                        logger.error("Meal with provided Id does not exist");
                        next(error);
                    } else {
                        logger.debug("Succesful update!");
                        res.status(200).json({ status: 200, result: "Succusful update!" });
                    }
                }
            );
        } else {
            const error = {
                status: 403,
                message: "You cannot update a meal that is not yours!",
            };
            logger.error(error.message);
            next(error);
        };
    },
    deleteMeal: (req, res, next) => {
        const mealId = req.params.id;
        const token = req.headers.authorization;
        const cookIdToken = jwt.decode(token);

        if (mealId === cookIdToken) {
            pool.query(`DELETE FROM meal WHERE id=${mealId}`, (err, results) => {
                if (err) throw err;
                const { affectedRows } = results;
                if (!affectedRows) {
                    const error = {
                        status: 400,
                        result: "Meal does not exist",
                    };
                    next(error);
                } else {
                    res.status(200).json({ status: 200, result: "Succesful deletion" });
                }
            });
        } else {
            const error = {
                status: 403,
                message: "You cannot delete a meal that is not yours!",
            };
            next(error);
        };
    },
};

module.exports = controller;