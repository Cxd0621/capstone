const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ErrorHandler = require('../utils/ErrorHandler');

// POST /api/users/register
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(new ErrorHandler('Please provide username, email and password', 400));
    }

    const existing = await User.findOne({
      $or: [{ email: String(email).toLowerCase() }, { username }],
    });

    if (existing) {
      return next(new ErrorHandler('A user with that email or username already exists', 400));
    }

    // The pre-save hook hashes the password before it reaches the database
    const user = await User.create({ username, email, password });

    res.status(201).json({
      success: true,
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler('Please provide email and password', 400));
    }

    // password has select:false, so ask for it explicitly
    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return next(new ErrorHandler('Invalid email or password', 401));
    }

    res.status(200).json({
      success: true,
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/me  (protected) - lets the client restore a session
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: { _id: req.user._id, username: req.user.username, email: req.user.email },
  });
};
