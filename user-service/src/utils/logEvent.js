const jwt = require('jsonwebtoken');
const axios = require('axios');
console.log('JWT_SECRET in test:', process.env.JWT_SECRET);

const logEvent = async ({ userId, action, service = 'user-service', metadata = {} }) => {
  const url = process.env.MONITORING_SERVICE_URL;

  if (process.env.CI === 'true' || process.env.NODE_ENV === 'test' || process.env.SKIP_LOGGING === 'true') {
    console.log(`🛑 Skipping log event in ${process.env.NODE_ENV || 'unknown'} mode`);
    return;
  }

  console.log(`Logging Event -> URL: ${url}`, { userId, action, service, metadata });

  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not defined');
    console.log('📨 Signing internalToken with secret:', process.env.JWT_SECRET);
    const internalToken = jwt.sign({ service }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Internal Token:', internalToken);  // <-- Add this line

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
