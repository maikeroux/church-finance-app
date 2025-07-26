const Log = require('../models/Log');

exports.createLog = async (req, res) => {
  try {
    const { userId, action, service, metadata } = req.body;

    const log = new Log({ userId, action, service, metadata });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Error saving log', error: err.message });
  }
};
