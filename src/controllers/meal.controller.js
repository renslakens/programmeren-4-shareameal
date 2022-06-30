const assert = require('assert');
const pool = require('../../dbconnection');
const jwt = require('jsonwebtoken');
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
    addMeal: (req, res) => {
        let meal = req.body;
        const cookId = req.userId
        meal.cookId = cookId;

        //Insert the user object into the database
        pool.query(`INSERT INTO meal SET ?`, meal, function(dbError, result, fields) {
            if (dbError) {
                logger.error(dbError);
                res.status(500).json({
                    status: 500,
                    result: "Error"
                });
            }

            res.status(201).json({
                status: 201,
                result: {
                    id: result.insertId,
                    cookId: cookId,
                    ...meal
                }
            });
        });
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
    updateMeal: (req, res) => {
        const mealInfo = req.body;
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
                    pool.query('UPDATE meal SET ? WHERE id = ? AND cookId = ?', [mealInfo, mealId, tokenCookId], function(dbUpdateError, updateResults, updateFields) {
                        if (dbUpdateError) {
                            logger.error(dbUpdateError);
                            res.status(500).json({
                                status: 500,
                                result: "Error"
                            });
                            return;
                        }

                        res.status(200).json({
                            status: 200,
                            message: `${mealId} successfully updated`,
                            result: {
                                id: mealId,
                                ...mealInfo
                            }
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