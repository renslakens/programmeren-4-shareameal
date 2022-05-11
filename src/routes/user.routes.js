const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')

router.post('/', userController.validateUser, userController.addUser);

router.get('/', userController.getAllUsers);

//Get route for profile
router.get('/profile', userController.getUserProfile);

//Get routes for specific users
router.get('/:id', userController.validateId, userController.getUserById);

//Put routes for specific users
router.put('/:id', userController.validateId, userController.validateUser, userController.updateUser);

//Delete routes for specific users
router.delete('/:id', userController.validateId, userController.deleteUser);

module.exports = router;