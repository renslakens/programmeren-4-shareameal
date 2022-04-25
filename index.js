const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

let database = [];
let id = 0;

app.all("*", (req, res, next) => {
    const method = req.method;

    console.log(`Method ${method} is aangeroepen`);
    next();
});

app.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        result: "Hello World",
    });
});

//Make new user
app.post("/api/user", (req, res) => {
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
            result: `email already in use`,
        });
    } else {
        id++;
        database.push(user);
        console.log("added " + user);
        res.status(201).json({
            status: 201,
            result: database,
        });
    }
});

//Get user profile
app.get("/api/user/profile", (req, res) => {
    res.status(200).json({
        status: 401,
        result: `Unauthorized`,
    });
});

//Get specific user
app.get("/api/user/:userId", (req, res, next) => {
    const userId = req.params.userId;

    console.log(`User met ID ${userId} gezocht`);
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
});

//Edit specific user
app.put("/api/user/:userId", (req, res) => {
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
});

//Delete specific user
app.delete("/api/user/", (req, res, next) => {
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
});

//Get all users
app.get("/api/user", (req, res, next) => {
    res.status(201).json({
        status: 201,
        result: database,
    });
});

app.all("*", (req, res) => {
    res.status(401).json({
        status: 401,
        result: "End-point not found",
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});