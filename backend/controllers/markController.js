const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Grade = require('../models/Grade');
const Batch = require('../models/Batch');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validator');

// @desc    Bulk entry of marks for a grade
// @route   POST /api/marks/bulk-entry
// @access  Private (Admin/Teacher)
exports.bulkEntry = [
  body('gradeId').isMongoId().withMessage('Valid grade ID is required'),
  body('subjectId').isMongoId().withMessage('Valid subject ID is required'),
  body('examType')
    .isIn(['Quiz', 'Assignment', 'Mid-Term', 'Final', 'Project', 'Practical'])
    .withMessage('Invalid exam type'),
  body('examName').notEmpty().withMessage('Exam name is required'),
  body('examDate').isISO8601().withMessage('Valid exam date is required'),
  body('totalMarks')
    .isInt({ min: 1 })
    .withMessage('Total marks must be a positive number'),
  body('marks').isArray({ min: 1 }).withMessage('Marks array is required'),
  body('marks.*.studentId').isMongoId().withMessage('Valid student ID is required'),
  body('marks.*.obtainedMarks')
    .isNumeric({ min: 0 })
    .withMessage('Obtained marks must be a non-negative number'),

  handleValidationErrors,

  async (req, res, next) => {
    try {
      const {
        gradeId,
        subjectId,
        examType,
        examName,
        examDate,
        totalMarks,
        marks,
      } = req.body;

      // Verify grade exists
      const grade = await Grade.findById(gradeId).populate('batch');
      if (!grade) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'GRADE_NOT_FOUND',
            message: 'Grade not found',
          },
        });
      }

      // Verify subject exists and is assigned to this grade
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SUBJECT_NOT_FOUND',
            message: 'Subject not found',
          },
        });
      }

      const subjectAssignedToGrade = grade.subjects.some(
        s => s.toString() === subjectId.toString()
      );
      if (!subjectAssignedToGrade) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'SUBJECT_NOT_IN_GRADE',
            message: 'Subject is not assigned to this grade',
          },
        });
      }

      // Verify all students exist and belong to the grade
      const studentIds = marks.map((m) => m.studentId);
      const students = await Student.find({
        _id: { $in: studentIds },
        gradeId: gradeId,
      });

      if (students.length !== studentIds.length) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STUDENTS',
            message: 'One or more students not found or not in this grade',
          },
        });
      }

      // Create mark entries
      const markEntries = marks.map((m) => ({
        student: m.studentId,
        subject: subjectId,
        batch: grade.batch._id,
        examType,
        examName,
        examDate,
        totalMarks,
        obtainedMarks: m.obtainedMarks,
        remarks: m.remarks || '',
        enteredBy: req.user._id,
      }));

      const createdMarks = await Mark.insertMany(markEntries);

      res.status(201).json({
        success: true,
        message: `Marks entered for ${createdMarks.length} students in ${grade.gradeName} ${grade.section}`,
        data: {
          grade: {
            id: grade._id,
            name: grade.gradeName,
            section: grade.section,
          },
          marksEntered: createdMarks.length,
          marks: createdMarks
        }
      });
    } catch (error) {
      next(error);
    }
  },
];

// @desc    Get marks for a grade
// @route   GET /api/marks/grade/:gradeId
// @access  Private
exports.getGradeMarks = async (req, res, next) => {
  try {
    const { gradeId } = req.params;
    const { subjectId, examType, studentId } = req.query;

    // Verify grade exists
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'GRADE_NOT_FOUND',
          message: 'Grade not found',
        },
      });
    }

    // Get students in this grade
    const students = await Student.find({ gradeId, status: 'Active' });
    const studentIds = students.map(s => s._id);

    // Build query
    const query = { student: { $in: studentIds } };
    if (subjectId) query.subject = subjectId;
    if (examType) query.examType = examType;
    if (studentId) query.student = studentId;

    const marks = await Mark.find(query)
      .populate('student', 'studentId firstName lastName academicInfo.rollNumber')
      .populate('subject', 'subjectName subjectCode')
      .populate('enteredBy', 'firstName lastName')
      .sort({ examDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: marks.length,
      data: marks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get marks grid for grade-subject combination
// @route   GET /api/marks/grade/:gradeId/subject/:subjectId
// @access  Private
exports.getGradeSubjectMarks = async (req, res, next) => {
  try {
    const { gradeId, subjectId } = req.params;

    // Verify grade and subject
    const grade = await Grade.findById(gradeId).populate('batch');
    const subject = await Subject.findById(subjectId);

    if (!grade || !subject) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Grade or subject not found',
        },
      });
    }

    // Get all students in this grade
    const students = await Student.find({ gradeId, status: 'Active' });
    const studentIds = students.map(s => s._id);

    // Get all marks for this grade-subject combination
    const marks = await Mark.find({ 
      student: { $in: studentIds },
      subject: subjectId 
    })
      .populate('student', 'studentId firstName lastName academicInfo')
      .sort({ examDate: 1 });

    // Group marks by exam
    const examsMap = new Map();

    marks.forEach((mark) => {
      const examKey = `${mark.examName}_${mark.examType}_${mark.examDate}`;
      
      if (!examsMap.has(examKey)) {
        examsMap.set(examKey, {
          examName: mark.examName,
          examType: mark.examType,
          examDate: mark.examDate,
          totalMarks: mark.totalMarks,
          students: [],
        });
      }

      const exam = examsMap.get(examKey);
      exam.students.push({
        studentId: mark.student.studentId,
        name: `${mark.student.firstName} ${mark.student.lastName}`,
        rollNumber: mark.student.academicInfo?.rollNumber,
        obtainedMarks: mark.obtainedMarks,
        percentage: mark.percentage,
        grade: mark.grade,
        remarks: mark.remarks,
      });
    });

    const exams = Array.from(examsMap.values());

    // Sort students within each exam by roll number
    exams.forEach((exam) => {
      exam.students.sort((a, b) => (a.rollNumber || 0) - (b.rollNumber || 0));
    });

    res.json({
      success: true,
      data: {
        grade: {
          _id: grade._id,
          gradeName: grade.gradeName,
          section: grade.section,
        },
        batch: {
          _id: grade.batch._id,
          batchName: grade.batch.batchName,
        },
        subject: {
          _id: subject._id,
          subjectName: subject.subjectName,
          subjectCode: subject.subjectCode,
        },
        exams,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
