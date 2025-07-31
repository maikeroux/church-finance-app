const Log = require('../models/Log');

exports.createLog = async (req, res) => {
  try {
    const { userId, action, service, metadata } = req.body;

    const log = new Log({
      userId: userId || req.user?.id || 'unknown',
      action,
      service,
      metadata,
    });

    await log.save();
    res.status(201).json(log);
  } catch (err) {
    console.error('❌ Error saving log:', err.message);
    res.status(500).json({ message: 'Error saving log', error: err.message });
  }
};

// Get all logs (or with filters later)
exports.getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }); // newest first
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching logs', error: err.message });
  }
};
