require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/monitoring";

console.log('typeof app is:', typeof app); // Debug log

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection failed, continuing without DB:', err.message);
  })
  .finally(() => {
    app.listen(PORT, () => console.log(`Monitoring Service running on port ${PORT}`));
  });
