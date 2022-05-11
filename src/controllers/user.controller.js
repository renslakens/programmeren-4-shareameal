const assert = require('assert');
const pool = require('../../dbconnection');
let database = [];
let id = 0;

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let {
            firstName,
            lastName,
            emailAdress,
            password,
            isActive,
            phoneNumber,
            roles,
            street,
            city,
        } = user;
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
            assert(
                firstName.length > 0,
                "firstName must be atleast one character long"
            );
            assert(
                lastName.length > 0,
                "lastName must be atleast one character long"
            );
            assert(
                emailAdress.length > 0,
                "emailAdress must be atleast one character long"
            );
            assert(
                password.length > 0,
                "password must be atleast one character long"
            );
            assert(isActive == 1 || isActive == 0, "isActive must be a 0 or 1");
            assert(
                phoneNumber.length > 0,
                "phonenumber must be atleast one character long"
            );
            assert(
                roles.includes("editor" || "guest"),
                "A user must have atleast one role"
            );
            assert(street.length > 0, "street must be atleast one character long");
            assert(city.length > 0, "City must be atleast one character long");

            next();
        } catch (err) {
            console.log("User validation found invalid fields!");
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
            assert(
                Number.isInteger(parseInt(req.params.userId)),
                "Id must be a number"
            );
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
                        message: "User with provided Id does not exist",
                        result: "User with provided Id does not exist",
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
};

module.exports = controller;