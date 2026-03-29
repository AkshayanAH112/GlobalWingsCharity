const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');
const { handleValidationErrors } = require('../middleware/validator');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = [
  // Validation middleware
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('role').optional().isIn(['admin', 'teacher', 'student']).withMessage('Invalid role'),

  handleValidationErrors,

  async (req, res, next) => {
    try {
      const { username, email, password, firstName, lastName, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: existingUser.email === email ? 'Email already registered' : 'Username already taken',
          },
        });
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        role: role || 'student',
      });

      // Generate token
      const token = generateToken(user._id, user.role);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
];

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = [
  body('identifier')
    .notEmpty()
    .withMessage('Username, Email or Student ID is required'),
  body('password').notEmpty().withMessage('Password is required'),

  handleValidationErrors,

  async (req, res, next) => {
    try {
      const { identifier, password } = req.body;
      const Student = require('../models/Student');

      let user;
      let studentData = null;

      // Check if identifier is email, username, or student ID
      const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(identifier);
      const isStudentId = /^GWC\d{8}$/.test(identifier.toUpperCase());
      
      if (isEmail) {
        // Login with email
        user = await User.findOne({ email: identifier.toLowerCase() }).select('+password');
      } else if (isStudentId) {
        // Login with student ID
        const studentId = identifier.toUpperCase();
        const student = await Student.findOne({ studentId });
        
        if (student) {
          // Find user linked to this student
          user = await User.findOne({ studentId: student._id }).select('+password');
          studentData = student;
        }
      } else {
        // Login with username (for admin/teacher)
        user = await User.findOne({ username: identifier }).select('+password');
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid credentials',
          },
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Your account has been deactivated. Please contact support.',
          },
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id, user.role);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            role: user.role,
            lastLogin: user.lastLogin,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
];

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('studentId', 'studentId fullName');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          studentId: user.studentId,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // In a real app, you might want to invalidate the token here
    // For JWT, we typically handle this on the client side

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};
