const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const userRouter = require('./src/routes/user.routes');

app.use(bodyParser.json());

app.all("*", (req, res, next) => {
    const method = req.method;

    console.log(`Method ${method} is aangeroepen`);
    next();
});

app.use(userRouter);

app.all("*", (req, res) => {
    res.status(401).json({
        status: 401,
        result: "End-point not found",
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});