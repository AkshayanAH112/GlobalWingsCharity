const { body } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');
const { handleValidationErrors } = require('../middleware/validator');

// @desc    Create a new student with auto-generated credentials
// @route   POST /api/students
// @access  Private (Admin, Teacher)
exports.createStudent = [
  // Validation
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('phone').optional().matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),

  handleValidationErrors,

  async (req, res, next) => {
    try {
      const { firstName, lastName, email, phone, dateOfBirth, gender, address, parentContact, batchId } = req.body;

      // Check if email already exists
      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already registered',
          },
        });
      }

      // Create student record (studentId will be auto-generated)
      const student = await Student.create({
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        parentContact,
        batchId,
      });

      // Generate username from student ID (e.g., GWC20250001 -> gwc20250001)
      const username = student.studentId.toLowerCase();
      
      // Default password is student ID (user should change on first login)
      const defaultPassword = student.studentId;

      // Create user account for the student
      const user = await User.create({
        username,
        email,
        password: defaultPassword,
        firstName,
        lastName,
        role: 'student',
        studentId: student._id,
      });

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: {
          student: {
            id: student._id,
            studentId: student.studentId,
            firstName: student.firstName,
            lastName: student.lastName,
            fullName: student.fullName,
            email: student.email,
            phone: student.phone,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            status: student.status,
          },
          loginCredentials: {
            username: username,
            studentId: student.studentId,
            password: defaultPassword,
            note: 'Student can login using either Student ID or email with this password. Please change password on first login.',
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
];

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Teacher)
exports.getAllStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, batchId } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { studentId: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;
    if (batchId) query.batchId = batchId;

    const students = await Student.find(query)
      .populate('batchId', 'batchName batchCode')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private (Admin, Teacher, Own Student)
exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('batchId', 'batchName batchCode startDate endDate');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STUDENT_NOT_FOUND',
          message: 'Student not found',
        },
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin, Teacher)
exports.updateStudent = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, address, parentContact, batchId, status } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STUDENT_NOT_FOUND',
          message: 'Student not found',
        },
      });
    }

    // Update fields
    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (email) student.email = email;
    if (phone) student.phone = phone;
    if (address) student.address = address;
    if (parentContact) student.parentContact = parentContact;
    if (batchId) student.batchId = batchId;
    if (status) student.status = status;

    await student.save();

    // Update linked user account if email changed
    if (email) {
      await User.findOneAndUpdate(
        { studentId: student._id },
        { email, firstName, lastName }
      );
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STUDENT_NOT_FOUND',
          message: 'Student not found',
        },
      });
    }

    // Delete linked user account
    await User.findOneAndDelete({ studentId: student._id });

    // Delete student
    await student.deleteOne();

    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
