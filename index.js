const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const logger = require('./src/config/config').logger;
require('dotenv').config();

const port = process.env.PORT;

const dbconnection = require('./dbconnection');
const userRoutes = require('./src/routes/user.routes');
const authRoutes = require('./src/routes/auth.routes');
const mealRoutes = require('./src/routes/meal.routes');

app.use(bodyParser.json());

app.all('*', (req, res, next) => {
    const method = req.method;

    logger.debug(`Method ${method} is aangeroepen`);
    next();
});

//Default route
app.get("/", (req, res) => {
    logger.debug('User is on default endpoint');
    res.status(200).json({
        status: 200,
        result: "Share A Meal API",
    });
});

//User route
app.use('/api/user', userRoutes);

//Auth route
app.use('/api/auth', authRoutes);

//Meal route
app.use('/api/meal', mealRoutes);

app.all('*', (req, res) => {
    res.status(401).json({
        status: 401,
        result: 'End-point not found',
    });
});

//Error handler
app.use((err, req, res, next) => {
    logger.debug('Error handler called.');
    res.status(500).json({
        statusCode: 500,
        message: err.toString(),
    });
});

//Welcome message
app.listen(port, () => {
    logger.debug(`API listening on port ${port}`);
});

process.on('SIGINT', () => {
    logger.debug('SIGINT signal received: closing HTTP server');
    dbconnection.end((err) => {
        logger.debug('Database connection closed');
    });
    app.close(() => {
        logger.debug('HTTP server closed');
    });
});

module.exports = app;