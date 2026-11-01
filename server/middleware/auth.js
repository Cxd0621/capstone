const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorHandler = require('../utils/ErrorHandler');

// Verifies "Authorization: Bearer <token>" and puts the user on req.user.
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorHandler('Not authorized, no token provided', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorHandler('The user of this token no longer exists', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ErrorHandler('Not authorized, token is invalid or expired', 401));
  }
};

// Runs after protect: only the portfolio owner (role = "admin") may read the
// contact inbox or manage content on somebody else's behalf.
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ErrorHandler('Admin access is required', 403));
  }
  next();
};

module.exports = { protect, adminOnly };
