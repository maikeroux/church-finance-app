const logEvent = require('../utils/logEvent');

module.exports = async (err, req, res, next) => {
  console.error(err.stack);

  // 🔍 Only log if not in test mode and it's an actual route
  if (process.env.NODE_ENV !== 'test' && req.user) {
    await logEvent({
      userId: req.user.id,
      action: 'UNHANDLED_ERROR',
      service: 'finance-service',
      metadata: {
        path: req.path,
        method: req.method,
        error: err.message,
        stack: err.stack
      }
    });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error'
  });
};
