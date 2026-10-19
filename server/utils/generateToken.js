const jwt = require('jsonwebtoken');

// Signs a token that contains only the user id (never the password).
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

module.exports = generateToken;
