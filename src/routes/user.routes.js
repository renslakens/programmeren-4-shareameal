const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')

let database = [];
let id = 0;

router.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        result: "Hello World",
    });
});

//Get user profile
router.get("/api/user/profile", (req, res) => {
    res.status(200).json({
        status: 401,
        result: `Unauthorized`,
    });
});

//Get all users
router.get("/api/user", userController.getAllUsers);

//Make new user
router.post("/api/user", userController.validateUser, userController.addUser);

//Get specific user
router.get("/api/user/:userId", userController.getUserByID);

//Edit specific user
router.put("/api/user/:userId", userController.editUserByID);

//Delete specific user
router.delete("/api/user/", userController.deleteUserByID);

module.exports = router;