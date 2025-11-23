/**
 * Error Handling Middleware
 * 
 * Centralized error handler for all requests.
 * Catches and formats errors for consistent API responses.
 */

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Validation errors
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details?.map(d => d.message) || [err.message],
    })
  }

  // Database errors
  if (err.code === 'UNIQUE_VIOLATION' || err.code === '23505') {
    return res.status(409).json({
      error: 'Resource already exists',
    })
  }

  if (err.code === 'FOREIGN_KEY_VIOLATION' || err.code === '23503') {
    return res.status(400).json({
      error: 'Invalid reference to related resource',
    })
  }

  // Default error response
  const status = err.status || 500
  const message = err.message || 'Internal server error'

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
