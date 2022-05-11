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
        let { firstName, lastName, emailAdress, password, isActive, phoneNumber, roles, street, city, } = user;
        try {
            assert(typeof firstName === "string", "firstName must be a string");
            assert(typeof lastName === "string", "lastName must be a string");
            assert(typeof emailAdress === "string", "emailAdress must be a string");
            assert(typeof password === "string", "password must be a string");
            assert(typeof isActive === "number", "isActive must be either 0 or 1");
            assert(typeof phoneNumber === "string", "phonenumber must a string");
            assert(typeof roles === "string", "roles must be a string");
            assert(typeof street === "string", "steet must be a string");
            assert(typeof city === "string", "city must be a string");
            assert(firstName.length > 0, "firstName must be atleast one character long");
            assert(lastName.length > 0, "lastName must be atleast one character long");
            assert(emailAdress.length > 0, "emailAdress must be atleast one character long");
            assert(password.length > 0, "password must be atleast one character long");
            assert(isActive == 1 || isActive == 0, "isActive must be a 0 or 1");
            assert(phoneNumber.length > 0, "phonenumber must be atleast one character long");
            assert(roles.includes("editor" || "guest"), "A user must have atleast one role");
            assert(street.length > 0, "street must be atleast one character long");
            assert(city.length > 0, "city must be atleast one character long");

            next();
        } catch (err) {
            console.log("User validation found invalid fields");
            const error = {
                status: 400,
                result: err.message,
                message: err.message,
            };
            next(error);
        }
    },
    validateNumber: (req, res, next) => {
        try {
            assert(Number.isInteger(parseInt(req.params.userId)), "ID must be a number");
            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message,
            };
            next(error);
        }
    },
    addUser: (req, res, next) => {
        let user = req.body;
        const values = [
            user.firstName,
            user.lastName,
            user.isActive,
            user.emailAdress,
            user.password,
            user.phoneNumber,
            user.roles,
            user.street,
            user.city,
        ];

        pool.query(
            "INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city) VALUES (?,?,?,?,?,?,?,?,?)",
            values,
            (err, result) => {
                if (err) {
                    console.log("User has not been inserted!");
                    const error = {
                        status: 409,
                        result: "User is niet toegevoegd in database",
                    };
                    next(error);
                } else {
                    console.log(result.insertId);
                    user.userId = result.insertId;
                    res.status(201).json({
                        status: 201,
                        message: "User is toegevoegd in database",
                        result: user,
                    });
                }
            }
        );
    },
    getAllUsers: (req, res) => {
        let users = [];
        pool.query("SELECT * FROM user", (error, results, fields) => {
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
        const userId = req.params.userId;
        pool.query(
            `SELECT * FROM user WHERE id =${userId}`,
            (err, results, fields) => {
                if (err) throw err;
                if (results.length > 0) {
                    res.status(200).json({
                        status: 200,
                        result: results,
                    });
                } else {
                    const error = {
                        status: 404,
                        message: "User with provided ID does not exist",
                        result: "User with provided ID does not exist",
                    };
                    next(error);
                }
            }
        );
    },
    getUserProfile: (req, res) => {
        res.status(200).json({
            message: "Not implemented yet",
        });
    },
    updateUser: (req, res, next) => {
        const userId = req.params.userId;
        const user = req.body;
        pool.query(
            `UPDATE user SET firstName = '${user.firstName}', lastName = '${user.lastName}', street = '${user.street}', city = '${user.city}', emailAdress = '${user.emailAdress}', password = '${user.password}' WHERE id = ${userId}`,
            (err, results) => {
                const { changedRows } = results;
                if (err) throw err;

                if (changedRows == 0) {
                    const error = {
                        status: 404,
                        message: "User with provided id does not exist",
                        result: "User with provided id does not exist",
                    };
                    next(error);
                } else {
                    res.status(200).json({ status: 200, result: "Succusful update!" });
                }
            }
        );
    },
    deleteUser: (req, res, next) => {
        const userId = req.params.userId;
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