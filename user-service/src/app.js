const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

dotenv.config();
const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Mongo connected'))
  .catch(err => console.error('Mongo failed:', err));

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.get('/', (_, res) => res.send('User Service Running'));

app.listen(process.env.PORT || 3000, () =>
  console.log(`User Service on port ${process.env.PORT || 3000}`)
);
