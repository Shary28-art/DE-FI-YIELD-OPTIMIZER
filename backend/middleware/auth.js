const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isInMemoryFallback, inMemoryDB } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'defi-risk-super-secret-jwt-key-2025';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isInMemoryFallback()) {
      const user = inMemoryDB.getCollection('users').get(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User session not found.' });
      }
      req.user = user;
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.',
      error: err.message,
    });
  }
};

// Optional auth for public endpoints that can enrich with user data if logged in
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (isInMemoryFallback()) {
        const user = inMemoryDB.getCollection('users').get(decoded.id);
        if (user) req.user = user;
      } else {
        const user = await User.findById(decoded.id).select('-password');
        if (user) req.user = user;
      }
    }
  } catch (e) {
    // Ignore invalid optional tokens
  }
  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  JWT_SECRET,
};
