/**
 * Async Handler Middleware
 * Wraps async functions to catch errors and pass them to the global error handler.
 * This eliminates the need for repetitive try/catch blocks in routes.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
