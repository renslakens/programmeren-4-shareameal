const assert = require('assert');
<<<<<<< HEAD
const dbconnection = require('../../dbconnection');
=======
const pool = require('../../dbconnection');
>>>>>>> feature-testing
let database = [];
let id = 0;

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let { firstName, lastName, street, city, isActive, emailAdress, phoneNumber, password } = user;
        try {
            assert(typeof firstName === 'string', 'The firstname must be a string');
            assert(typeof lastName === 'string', 'The lastName must be a string');
            assert(typeof street === 'string', 'The street must be a string');
            assert(typeof city === 'string', 'The city must be a string');
            assert(typeof isActive === 'number', 'IsActive must be a number');
            assert(typeof emailAdress === 'string', 'The emailAddress must be a string');
            assert(typeof phoneNumber === 'string', 'The phoneNumber must be a string');
            assert(typeof password === 'string', 'The password must a string');

            next();
        } catch (err) {
            console.log(err.message);
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
            console.log(req.body);
            const error = {
                status: 400,
                message: err.message,
            };

            console.log(error);
            next(error);
        }
    },
    addUser: (req, res, next) => {
        const user = req.body;
        pool.query('INSERT INTO user SET ?', user, (dbError, result) => {
            if (dbError) {
                console.log(dbError.message);
                const error = {
                    status: 409,
                    message: 'User has not been added',
                    result: 'User is niet toegevoegd in database',
                };
                next(error);
            } else {
                console.log(result.insertId);
                user.userId = result.insertId;
                res.status(201).json({
                    status: 201,
                    message: 'User is toegevoegd in database',
                    result: user,
                });
            }
        });
    },
    getAllUsers: (req, res) => {
        let users = [];
        pool.query('SELECT * FROM user', (error, results, fields) => {
            results.forEach((user) => {
                users.push(user);
            });
            res.status(200).json({
                status: 200,
                result: users,
            });
        });
    },
    getUserById: (req, res, next) => {
        const userId = req.params.id;
        pool.query(
            `SELECT * FROM user WHERE id =${userId}`,
            (err, results, fields) => {
                if (err) throw err;

                if (results[0]) {
                    res.status(200).json({
                        status: 200,
                        result: results,
                    });
                } else {
                    const error = {
                        status: 404,
                        message: 'User with provided ID does not exist',
                    };
                    next(error);
                }
            }
        );
    },
    getUserProfile: (req, res) => {
        res.status(200).json({
            message: 'Not implemented yet',
        });
    },
    updateUser: (req, res, next) => {
        const userId = req.params.id;
        const user = req.body;
        pool.query(
            `UPDATE user SET firstName = '${user.firstName}', lastName = '${user.lastName}', street = '${user.street}', city = '${user.city}', emailAdress = '${user.emailAdress}', password = '${user.password}' WHERE id = ${userId}`,
            (err, results) => {
                const { affectedRows } = results;
                if (err) throw err;

                if (affectedRows == 0) {
                    const error = {
                        status: 404,
                        message: 'User with provided ID does not exist',
                        result: 'User with provided ID does not exist',
                    };
                    next(error);
                } else {
                    res.status(200).json({ status: 200, result: 'Succusful update!' });
                }
            }
        );
    },
    deleteUser: (req, res, next) => {
        const userId = req.params.id;
        pool.query(`DELETE FROM user WHERE id=${userId}`, (err, results) => {
            if (err) throw err;
            const { affectedRows } = results;
            if (!affectedRows) {
                const error = {
                    status: 400,
                    result: 'User does not exist',
                };
                next(error);
            } else {
                res.status(200).json({ status: 200, result: 'Succesful deletion' });
            }
        });
    },
<<<<<<< HEAD

    getAllUsers: (req, res, next) => {
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query('SELECT * FROM user', function(error, results, fields) {
                // When done with the connection, release it.
                connection.release();

                // Handle error after the release.
                if (error) throw error;

                // Don't use the connection here, it has been returned to the pool.
                console.log('result = ', results)
                res.status(200).json({
                    statusCode: 200,
                    results: results
                });
            });
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
=======
};
>>>>>>> feature-testing

module.exports = controller;