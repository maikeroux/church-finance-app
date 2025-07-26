const jwt = require('jsonwebtoken');
const axios = require('axios');

const logEvent = async ({ userId, action, service = 'user-service', metadata = {} }) => {
    console.log('Logging Event:', { userId, action, service, metadata });
    try {
        const internalToken = jwt.sign({ service }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await axios.post('http://monitoring-service:4002/api/logs', {
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
