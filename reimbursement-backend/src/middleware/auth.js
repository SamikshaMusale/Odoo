const { verifyToken } = require('../utils/auth');
const ApiResponse = require('../utils/apiResponse');
const prisma = require('../prisma/client');

/**
 * Authenticate user via Bearer token
 * Attaches user object to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        managerId: true,
      },
    });

    if (!user) {
      return ApiResponse.unauthorized(res, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.unauthorized(res, 'Invalid or expired token');
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Allowed roles (e.g., 'ADMIN', 'MANAGER')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, `Role '${req.user.role}' is not authorized for this action`);
    }

    next();
  };
};

module.exports = { authenticate, authorize };
