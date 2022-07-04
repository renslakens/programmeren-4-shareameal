const assert = require('assert');
const pool = require('../../dbconnection');
const jwt = require('jsonwebtoken');
const { jwtSecretKey } = require('../config/config');
const logger = require('../config/config').logger;

let controller = {
    validateMeal: (req, res, next) => {
        let meal = req.body;
        let { name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, allergenes } = meal;
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
            assert(Array.isArray(allergenes), 'allergenes must an array');

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
        let meal = req.body;
        let cookId = 1;
        if (typeof meal.id != "undefined" && meal.id != null) {
            cookId = meal.id;
        } else {
            const auth = req.headers.authorization;
            const token = auth.substring(7, auth.length);
            const encodedLoad = jwt.decode(token);
            cookId = encodedLoad.userId;
        }
        meal.dateTime = meal.dateTime.replace("T", " ").substring(0, 19);

        meal.allergenes = `${meal.allergenes}`;

        logger.debug("meal " + meal.allergenes);
        logger.debug(meal.dateTime);
        logger.debug("Converted meal data: " + meal);

        pool.query(
            "INSERT INTO meal " +
            "(name, description, isVega, isVegan, isToTakeHome, dateTime, imageUrl, maxAmountOfParticipants, price, allergenes, isActive, cookId) " +
            "VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [
                meal.name,
                meal.description,
                meal.isVega,
                meal.isVegan,
                meal.isToTakeHome,
                meal.dateTime,
                meal.imageUrl,
                meal.maxAmountOfParticipants,
                meal.price,
                meal.allergenes,
                meal.isActive,
                cookId,
            ],
            function(error, results, fields) {
                if (error) {
                    logger.debug("Could not add meal: " + meal[0]);
                    logger.error(error);
                    const err = {
                        status: 409,
                        message: "Could not add meal",
                    };
                    next(err);
                } else {
                    pool.query(
                        `SELECT * FROM meal WHERE id = ${results.insertId};`,
                        function(error, results, fields) {
                            res.status(201).json({
                                status: 201,
                                result: results[0],
                            });
                            logger.warn("time " + results[0].dateTime);
                            logger.info("Added meal: " + results);
                        }
                    );
                }
            }
        );
    },
    getAllMeals: (req, res) => {
        pool.query('SELECT * FROM meal', function(dbError, results, fields) {
            if (dbError) {
                console.log(dbError);
                res.status(500).json({
                    status: 500,
                    result: "Error"
                });
                return;
            }

            res.status(200).json({
                status: 200,
                result: results
            });
        });
    },
    getMealById: (req, res) => {
        const mealId = req.params.id;
        pool.query('SELECT * FROM meal WHERE id = ' + mealId, function(dbError, results, fields) {
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
                    message: "Meal does not exist"
                });
            }
        });
    },
    updateMeal: (req, res, next) => {
        let meal = req.body;
        const currentId = req.params.id;

        if (meal.id != null) {
            cookId = meal.id;
        } else {
            const auth = req.headers.authorization;
            const token = auth.substring(7, auth.length);
            const encodedLoad = jwt.decode(token);
            cookId = encodedLoad.id;
        }

        meal.allergenes = `${meal.allergenes}`;

        logger.info("Converted meal data: " + meal);

        pool.query(
            "UPDATE meal SET name = ? ,description = ?, isActive = ?,isVega = ?,isVegan = ?,isToTakeHome = ?,dateTime = ?,imageUrl = ?,allergenes = ?,maxAmountOfParticipants = ?, price = ? WHERE id = ?;", [
                meal.name,
                meal.description,
                meal.isActive,
                meal.isVega,
                meal.isVegan,
                meal.isToTakeHome,
                meal.dateTime,
                meal.imageUrl,
                meal.allergenes,
                meal.maxAmountOfParticipants,
                meal.price,
                currentId,
            ],
            function(error, result, fields) {
                if (error) {
                    const error = {
                        status: 404,
                        error: "error",
                    };
                    next(error);
                } else if (result.affectedRows) {
                    pool.query(
                        `SELECT * FROM meal WHERE id = ${currentId};`,
                        function(error, results, fields) {
                            res.status(200).json({
                                status: 200,
                                result: results[0],
                            });
                            logger.warn(results[0]);
                        }
                    );
                } else {
                    const error = {
                        status: 404,
                        message: "Meal does not exist"
                    };
                    next(error);
                }
            }
        );
    },
    deleteMeal: (req, res) => {
        const mealId = req.params.id;
        const tokenCookId = req.userId;
        logger.debug("MealId =", mealId);
        logger.debug("TokenUserId =", tokenCookId);

        pool.query('SELECT cookId FROM meal WHERE id = ?', mealId, function(dbSelectError, selectResults, selectFields) {
            if (dbSelectError) {
                logger.error(dbSelectError);
                res.status(500).json({
                    status: 500,
                    result: "Error"
                });
                return;
            }

            if (selectResults.length > 0) {
                logger.debug("Results:", selectResults);
                if (selectResults[0].cookId == tokenCookId) {
                    pool.query('DELETE FROM meal WHERE id = ? AND cookId = ?', [mealId, tokenCookId], function(dbDeleteError, deleteResults, deleteFields) {
                        if (dbDeleteError) {
                            logger.error(dbDeleteError);
                            res.status(500).json({
                                status: 500,
                                result: "Error"
                            });
                            return;
                        }

                        res.status(200).json({
                            status: 200,
                            message: `Succesfully deleted meal ${mealId}`
                        });
                    });
                } else {
                    res.status(403).json({
                        status: 403,
                        message: "Not the creator of the meal"
                    });
                }
            } else {
                res.status(404).json({
                    status: 404,
                    message: "Meal does not exist"
                });
            }
        });
    },
};

module.exports = controller;