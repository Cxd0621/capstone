const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Invalid MongoDB id (e.g. /api/projects/123)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose schema validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((detail) => detail.message)
      .join(', ');
  }

  // Duplicate key (unique: true on username / email)
  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate value for ${Object.keys(err.keyValue || {}).join(', ')}`;
  }

  // express.json(): the body did not parse, or it was over the 32 KB limit
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Send valid JSON.';
  }

  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'The request body is too large.';
  }

  if (statusCode >= 500) {
    console.error(`[server error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = errorHandler;
