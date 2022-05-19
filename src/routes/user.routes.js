const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

//Add user
router.post('/', userController.validateUser, userController.addUser);

//Get all users
router.get('/', authController.validateToken, userController.getAllUsers);

//Get route for profile
router.get('/profile', authController.validateToken, userController.getUserProfile);

//Get routes for specific users
router.get('/:id', authController.validateToken, userController.validateId, userController.getUserById);

//Put routes for specific users
router.put('/:id', authController.validateToken, userController.validateId, userController.validateUser, userController.updateUser);

//Delete routes for specific users
router.delete('/:id', authController.validateToken, userController.validateId, userController.deleteUser);

module.exports = router;