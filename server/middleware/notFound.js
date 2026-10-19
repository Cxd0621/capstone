const ErrorHandler = require('../utils/ErrorHandler');

// Any request that reached this point matched no route.
const notFound = (req, res, next) => {
  next(new ErrorHandler(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = notFound;
