const router = require('express').Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimit } = require('../middleware/limits');

// Tokens and account data must never be kept by a browser or a proxy cache.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// register and login are public on purpose: visitors need them to get a token.
router.post('/register', authLimit, register);
router.post('/login', authLimit, login);
router.get('/me', protect, getMe);

module.exports = router;
