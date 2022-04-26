const assert = require('assert');
let database = [];
let id = 0;

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let { firstName, lastName, emailAdress, password } = user;

        try {
            assert(typeof firstName === 'string', 'First Name must be a string');
            assert(typeof lastName === 'string', 'Last Name must be a string');
            assert(typeof emailAdress === 'string', 'Email address must be a string');
            assert(typeof password === 'string', 'Password must be a string');
            next();
        } catch (error) {
            console.log(error.message);
            res.status(400).json({
                status: 400,
                result: error.toString()
            })
        }
    },

    addUser: (req, res) => {
        let user = req.body;

        user = {
            id,
            ...user,
        };

        const emailCheck = database.some(element => {
            if (element.email === user.email) {
                return true;
            }
        });

        if (emailCheck) {
            console.log(user.email + " already in use");
            res.status(403).json({
                status: 403,
                result: `Email already in use`,
            });
        } else {
            id++;
            database.push(user);
            console.log("Added " + user);
            res.status(201).json({
                status: 201,
                result: database,
            });
        }
    },

    getAllUsers: (req, res) => {
        res.status(201).json({
            status: 201,
            result: database,
        });
    },

    getUserByID: (req, res) => {
        const userId = req.params.userId;

        console.log(`Looking for user with ID ${userId}`);
        let user = database.filter((item) => item.id == userId);

        if (user.length > 0) {
            console.log(user);
            res.status(201).json({
                status: 201,
                result: user,
            });
        } else {
            res.status(403).json({
                status: 403,
                result: `User with ID ${userId} not found`,
            });
        }
    },

    editUserByID: (req, res) => {
        const userId = req.params.userId;

        let oldUser = database.filter((item) => item.id == userId);
        if (oldUser.length > 0) {

            let newUser = req.body;
            id = parseInt(userId);
            newUser = {
                id,
                ...newUser,
            };
            console.log(newUser);
            database[userId] = newUser;

            res.status(201).json({
                status: 201,
                result: newUser,
            });
            console.log(`Modified user ${userId}`);
        } else {
            res.status(403).json({
                status: 403,
                result: `User with ID ${userId} not found`,
            });
        }
    },

    deleteUserByID: (req, res) => {
        const userId = req.params.userId;

        console.log(`User with ID ${userId} has been deleted`);
        let user = database.filter((item) => item.id == userId);

        if (user.length > 0) {
            console.log(user);
            database.splice(userId, 1);
            res.status(201).json({
                status: 201,
                result: user,
            });
        } else {
            res.status(403).json({
                status: 403,
                result: `User with ID ${userId} not found`,
            });
        }
    }
}

module.exports = controller;