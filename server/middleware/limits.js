const rateLimit = require('express-rate-limit').rateLimit;

// Account attempts: login and registration share one allowance per IP, so a
// script cannot keep guessing passwords by alternating between the two routes.
exports.authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, status: 429, message: 'Too many attempts. Try again in 15 minutes.' },
});

// Contact form: the public can write, but not flood the inbox.
exports.contactLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, status: 429, message: 'Too many messages. Try again in 15 minutes.' },
});
