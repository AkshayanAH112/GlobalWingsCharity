const { ROLES } = require('../config/constants');

// Middleware to check user roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role: ${roles.join(' or ')}`,
        },
      });
    }

    next();
  };
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ADMIN_ONLY',
        message: 'This action requires administrator privileges.',
      },
    });
  }
  next();
};

// Check if user is teacher or admin
exports.isTeacherOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== ROLES.TEACHER && req.user.role !== ROLES.ADMIN)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'TEACHER_ADMIN_ONLY',
        message: 'This action requires teacher or administrator privileges.',
      },
    });
  }
  next();
};

// Check if user can access student data
exports.canAccessStudent = (req, res, next) => {
  const { role, studentId } = req.user;
  const requestedStudentId = req.params.id || req.params.studentId;

  // Admin and teachers can access all students
  if (role === ROLES.ADMIN || role === ROLES.TEACHER) {
    return next();
  }

  // Students can only access their own data
  if (role === ROLES.STUDENT && studentId && studentId.toString() === requestedStudentId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: {
      code: 'ACCESS_DENIED',
      message: 'You do not have permission to access this student data.',
    },
  });
};
