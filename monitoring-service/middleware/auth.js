const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const rawAuthHeader = req.get('Authorization') || req.headers['authorization'];
  console.log('🪪 Raw Auth Header:', rawAuthHeader);

  const token = rawAuthHeader?.split(' ')[1];
  console.log('🔑 Token to be verified:', token);
  console.log('With secret:', process.env.JWT_SECRET);

  if (!token) return res.status(401).json({ message: 'Access Denied - No Token' });

  try {
    console.log('JWT_SECRET in auth middleware:', process.env.JWT_SECRET);
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Decoded Token:', verified);

    if (!verified.service) {
      console.log('⛔ Decoded token missing "service" field:', verified);
      return res.status(400).json({ message: 'Invalid Token - Missing service' });
    }

    req.user = verified;
    next();
  } catch (err) {
    console.error('❌ JWT Verify Error:', err.message);
    res.status(400).json({ message: 'Invalid Token - JWT Error' });
  }
};
