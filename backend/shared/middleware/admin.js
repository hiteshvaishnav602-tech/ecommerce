import ErrorResponse from '../utils/errorResponse.js';

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`Role '${req.user.role}' is not authorized to access this resource`, 403)
      );
    }
    next();
  };
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Admin access required', 403));
  }
  next();
};
