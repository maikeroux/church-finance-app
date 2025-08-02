const express = require('express');
const app = express();
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');

app.use(express.json());
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use(errorHandler); // must be after all routes

module.exports = app;
