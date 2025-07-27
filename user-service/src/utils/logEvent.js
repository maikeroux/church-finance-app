const jwt = require('jsonwebtoken');
const axios = require('axios');

const logEvent = async ({ userId, action, service = 'user-service', metadata = {} }) => {
  const url = process.env.MONITORING_SERVICE_URL;

  // ✅ Skip logging in test/CI environments
  if (process.env.NODE_ENV === 'test' || process.env.SKIP_LOGGING === 'true') {
    console.log(`Skipping log event in ${process.env.NODE_ENV} mode`);
    return;
  }

  console.log(`Logging Event -> URL: ${url}`, { userId, action, service, metadata });

  if (!url) {
    console.warn('MONITORING_SERVICE_URL not set, skipping log');
    return;
  }

  try {
    const internalToken = jwt.sign({ service }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await axios.post(url, {
      userId: userId || 'missing_userId',
      action,
      service,
      metadata,
    }, {
      headers: {
        Authorization: `Bearer ${internalToken}`,
      },
    });

  } catch (err) {
    console.error('Failed to log event:', err.response?.data || err.message);
  }
};

module.exports = logEvent;
