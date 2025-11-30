// backend/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  // if statusCode was already set (e.g. 401/400), keep it, otherwise 500
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Server Error',
    // include a stack trace only in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};