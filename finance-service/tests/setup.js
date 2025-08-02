// tests/setup.js
const sequelize = require('../src/config/database');

// ✅ Register models
const Transaction = require('../src/models/transaction');

// ✅ Optional: log model names for debug
console.log('Registered models:', Object.keys(sequelize.models));

module.exports = sequelize;