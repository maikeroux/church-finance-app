const express = require('express');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();

app.use(express.json());

app.get('/health', (_, res) => {
  res.status(200).json({status: 'UP',service: 'user-service',timestamp: new Date()});
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (_, res) => res.send('User Service Running'));

module.exports = app;
