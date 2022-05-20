const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');
const authController = require('../controllers/auth.controller');

//Get all meals
router.get('/', mealController.getAllMeals);

//Get specific meal
router.get('/:id', mealController.validateId, mealController.getMealById);

//Register meal
router.post('/', authController.validateToken, mealController.addMeal);

// //Edit specific meal
// router.post('/:id', authController.validateToken, mealController.validateId, mealController.updateMeal);

// //Delete specific meal
// router.delete('/:id', authController.validateToken, mealController.validateId, mealController.deleteMeal);

// Voor extra punten
// //Register user to meal
// router.post('/:id/signup', authController.validateToken, mealController.validateId, mealController.register);

// //Get list of participants
// router.get('/:id/participants', authController.validateToken, mealController.validateId, mealController.getAllParticipants);

// //Get specific participant
// router.get('/:id/participants/:id', authController.validateToken, mealController.validateId, mealController.getParticipantById);

module.exports = router;