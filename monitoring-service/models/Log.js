const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, required: true },
  action: { type: String, required: true },
  service: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('Log', logSchema);
