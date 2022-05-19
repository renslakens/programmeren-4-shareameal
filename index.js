const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/user.routes');
const authRoutes = require('./src/routes/auth.routes');
const mealRoutes = require('./src/routes/meal.routes');

app.use(bodyParser.json());

app.all('*', (req, res, next) => {
    const method = req.method;

    console.log(`Method ${method} is aangeroepen`);
    next();
});

app.use('/api/user', userRoutes);
app.use('/api', authRoutes);
app.use('api/meal', mealRoutes);

app.all('*', (req, res) => {
    res.status(401).json({
        status: 401,
        result: 'End-point not found',
    });
});

//Error handler
app.use((err, req, res, next) => {
    res.status(err.status).json(err);
});

app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});

module.exports = app;