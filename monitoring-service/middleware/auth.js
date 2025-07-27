const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', verified);

    if (!verified.userId && !verified.service && !verified.id) {
      return res.status(400).json({ message: 'Invalid Token' });
    }

    req.user = verified;
    next();
  } catch (err) {
    console.error('JWT Verify Error:', err);
    res.status(400).json({ message: 'Invalid Token' });
  }
};
