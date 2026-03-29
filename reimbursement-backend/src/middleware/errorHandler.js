const ApiResponse = require('../utils/apiResponse');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return ApiResponse.badRequest(res, `Duplicate value for field: ${err.meta?.target?.join(', ')}`);
  }

  if (err.code === 'P2025') {
    return ApiResponse.notFound(res, 'Record not found');
  }

  // Validation errors (express-validator)
  if (err.type === 'validation') {
    return ApiResponse.badRequest(res, 'Validation failed', err.errors);
  }

  return ApiResponse.error(res, err.message || 'Internal server error', err.statusCode || 500);
};

module.exports = errorHandler;
