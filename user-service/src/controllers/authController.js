const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logEvent = require('../utils/logEvent');
// const { hashPassword, comparePassword } = require('../utils/hash');

const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const user = new User({ email, password, role });
    await user.save();

    await logEvent({
      userId: user._id.toString(),
      action: 'user_registered',
      metadata: { email, role }
    });

    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    await logEvent({
      userId: 'unknown',
      action: 'registration_failed',
      metadata: {
        reason: err.message,
        email: req.body?.email || 'unknown'
      }
    });

    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      await logEvent({
        userId: 'unknown',
        action: 'login_failed',
        metadata: { reason: 'email_not_found', email }
      });

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password, user.password);
    if (!isMatch) {
      await logEvent({
        userId: user?._id?.toString() || 'unknown',
        action: 'login_failed',
        metadata: { reason: 'wrong_password', email }
      });

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );

    await logEvent({
      userId: user._id.toString(),
      action: 'user_logged_in',
      metadata: { email }
    });

    res.json({ token });
  } catch (err) {
    await logEvent({
      userId: 'unknown',
      action: 'login_failed',
      metadata: {
        reason: err.message,
        email: req.body?.email || 'unknown'
      }
    });

    res.status(500).json({ error: 'Login failed' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };
