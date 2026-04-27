/**
 * Global Error Handler Middleware
 * Standardizes all API error responses and provides structured logging.
 */
const errorHandler = (err, req, res, next) => {
    // Log the error for the developer (Structured Log)
    console.error(`[ERROR] ${req.method} ${req.url}`);
    console.error(`Message: ${err.message}`);
    if (err.stack) {
        // Only print first few lines of stack trace to keep logs clean
        console.error(`Stack: ${err.stack.split('\n').slice(0, 3).join('\n')}`);
    }

    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle Mongoose Validation Errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    // Handle Mongoose Cast Errors (Invalid IDs)
    if (err.name === 'CastError') {
        statusCode = 404;
        message = `Resource not found with id of ${err.value}`;
    }

    // Handle JWT Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please login again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Your token has expired. Please login again.';
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        // Include stack trace only in development mode
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;
