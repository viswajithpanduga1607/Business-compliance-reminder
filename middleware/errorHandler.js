const { validationResult } = require('express-validator');

/**
 * Validation extractor middleware.
 * Must be used AFTER express-validator check() chains on a route.
 * Aborts with a 422 Unprocessable Entity if any field fails validation.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted fields.',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
        value: e.value,
      })),
    });
  }
  next();
};

/**
 * Global 404 handler — must be registered AFTER all routes.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global error handler — must be the LAST middleware registered.
 * Catches any error passed via next(err) or thrown in async handlers.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  // Mongoose CastError (malformed ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID format supplied.',
      error: err.message,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `Duplicate value detected for '${field}'. Please use a unique value.`,
      error: err.message,
    });
  }

  // Mongoose validation error (schema-level)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      message: 'Database schema validation failed.',
      errors: messages,
    });
  }

  // Generic fallback
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { validate, notFound, errorHandler };

