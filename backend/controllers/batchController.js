const Batch = require('../models/Batch');
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');

// @desc    Get all batches
// @route   GET /api/batches
// @access  Private
exports.getAllBatches = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { batchName: { $regex: search, $options: 'i' } },
        { batchCode: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const batches = await Batch.find(query)
      .populate('teacher', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Batch.countDocuments(query);

    res.json({
      success: true,
      data: batches,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a batch
// @route   POST /api/batches
// @access  Private (admin)
exports.createBatch = async (req, res, next) => {
  try {
    const batch = await Batch.create(req.body);
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a batch
// @route   PUT /api/batches/:id
// @access  Private (admin)
exports.updateBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!batch) return res.status(404).json({ success: false, error: { message: 'Batch not found' } });
    res.json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a batch
// @route   DELETE /api/batches/:id
// @access  Private (admin)
exports.deleteBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ success: false, error: { message: 'Batch not found' } });
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get batch details with grades and statistics
// @route   GET /api/batches/:id/details
// @access  Private
exports.getBatchDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { includeGrades = 'true' } = req.query;

    // Get batch with populated fields
    const batch = await Batch.findById(id)
      .populate('subjects', 'subjectName subjectCode credits category teacher')
      .populate('teacher', 'firstName lastName email');

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BATCH_NOT_FOUND',
          message: 'Batch not found',
        },
      });
    }

    const response = {
      batch,
      statistics: {}
    };

    // Include grades if requested
    if (includeGrades === 'true') {
      const grades = await Grade.find({ batch: id })
        .populate('subjects', 'subjectName subjectCode')
        .sort({ gradeName: 1, section: 1 });

      // Get student counts for each grade
      const gradesWithCounts = await Promise.all(grades.map(async (grade) => {
        const studentCount = await Student.countDocuments({ 
          gradeId: grade._id,
          status: 'Active'
        });

        return {
          ...grade.toObject(),
          currentStudents: studentCount,
          availableSlots: grade.maxStudents - studentCount
        };
      }));

      response.grades = gradesWithCounts;
      response.statistics.totalGrades = grades.length;
    }

    // Calculate overall statistics (aggregate across all grades)
    const totalStudents = await Student.countDocuments({ batchId: id, status: 'Active' });
    const totalSubjects = batch.subjects?.length || 0;

    // Get average attendance for this batch
    const attendanceRecords = await Attendance.find({ batch: id });
    const presentCount = attendanceRecords.filter((a) => a.status === 'present').length;
    const averageAttendance = attendanceRecords.length > 0 
      ? ((presentCount / attendanceRecords.length) * 100).toFixed(2)
      : 0;

    response.statistics = {
      ...response.statistics,
      totalStudents,
      totalSubjects,
      averageAttendance: parseFloat(averageAttendance),
      maxStudents: batch.maxStudents,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign subjects to a batch
// @route   POST /api/batches/:id/assign-subjects
// @access  Private (Admin/Teacher)
// @deprecated Use Grade-level subject assignment instead
exports.assignSubjects = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subjectIds } = req.body;

    if (!subjectIds || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Please provide an array of subject IDs',
        },
      });
    }

    // Verify all subjects exist
    const subjects = await Subject.find({ _id: { $in: subjectIds } });
    if (subjects.length !== subjectIds.length) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SUBJECTS',
          message: 'One or more subject IDs are invalid',
        },
      });
    }

    // Update batch with subjects
    const batch = await Batch.findByIdAndUpdate(
      id,
      { $addToSet: { subjects: { $each: subjectIds } } },
      { new: true, runValidators: true }
    ).populate('subjects', 'subjectName subjectCode');

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BATCH_NOT_FOUND',
          message: 'Batch not found',
        },
      });
    }

    res.json({
      success: true,
      message: `${subjectIds.length} subject(s) assigned to batch`,
      data: batch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign students to a batch (DEPRECATED - use Grade endpoints)
// @route   POST /api/batches/:id/assign-students
// @access  Private (Admin/Teacher)
// @deprecated Students should be assigned to Grades, not directly to Batches
exports.assignStudents = async (req, res, next) => {
  return res.status(410).json({
    success: false,
    error: {
      code: 'ENDPOINT_DEPRECATED',
      message: 'This endpoint is deprecated. Please use POST /api/grades/:gradeId/assign-students instead',
      recommendation: 'Create a grade within the batch first, then assign students to that grade'
    },
  });
};

// @desc    Remove student from batch (DEPRECATED - use Grade endpoints)
// @route   DELETE /api/batches/:id/remove-student/:studentId
// @access  Private (Admin/Teacher)
// @deprecated Students should be removed from Grades
exports.removeStudent = async (req, res, next) => {
  return res.status(410).json({
    success: false,
    error: {
      code: 'ENDPOINT_DEPRECATED',
      message: 'This endpoint is deprecated. Please use DELETE /api/grades/:gradeId/students/:studentId instead',
    },
  });
};

// @desc    Remove subject from batch
// @route   DELETE /api/batches/:id/remove-subject/:subjectId
// @access  Private (Admin/Teacher)
exports.removeSubject = async (req, res, next) => {
  try {
    const { id, subjectId } = req.params;

    const batch = await Batch.findByIdAndUpdate(
      id,
      { $pull: { subjects: subjectId } },
      { new: true }
    ).populate('subjects', 'subjectName subjectCode');

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BATCH_NOT_FOUND',
          message: 'Batch not found',
        },
      });
    }

    res.json({
      success: true,
      message: 'Subject removed from batch',
      data: batch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get batch statistics
// @route   GET /api/batches/:id/statistics
// @access  Private
exports.getBatchStatistics = async (req, res, next) => {
  try {
    const { id } = req.params;

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BATCH_NOT_FOUND',
          message: 'Batch not found',
        },
      });
    }

    // Get all grades in this batch
    const grades = await Grade.find({ batch: id, status: 'Active' });
    const gradeIds = grades.map(g => g._id);

    // Get student statistics (aggregated across all grades)
    const totalStudents = await Student.countDocuments({ batchId: id, status: 'Active' });
    const activeStudents = await Student.countDocuments({ 
      batchId: id, 
      status: 'Active' 
    });

    // Get grade-wise student distribution
    const gradeDistribution = await Promise.all(grades.map(async (grade) => {
      const count = await Student.countDocuments({ 
        gradeId: grade._id,
        status: 'Active'
      });
      return {
        grade: grade.gradeName,
        section: grade.section,
        students: count,
        maxStudents: grade.maxStudents,
        occupancy: `${((count / grade.maxStudents) * 100).toFixed(1)}%`
      };
    }));

    // Get subject count (unique subjects across all grades)
    const allSubjectIds = grades.reduce((acc, grade) => {
      grade.subjects.forEach(subjectId => {
        if (!acc.includes(subjectId.toString())) {
          acc.push(subjectId.toString());
        }
      });
      return acc;
    }, []);
    const totalSubjects = allSubjectIds.length;

    // Get all students in this batch for marks/attendance calculations
    const students = await Student.find({ batchId: id, status: 'Active' });
    const studentIds = students.map(s => s._id);

    // Get average marks
    const marks = await Mark.find({ student: { $in: studentIds } });
    const averagePercentage = marks.length > 0
      ? marks.reduce((sum, m) => sum + m.percentage, 0) / marks.length
      : 0;

    // Get attendance rate
    const attendanceRecords = await Attendance.find({ batch: id });
    const presentCount = attendanceRecords.filter((a) => a.status === 'present').length;
    const attendanceRate = attendanceRecords.length > 0
      ? (presentCount / attendanceRecords.length) * 100
      : 0;

    res.json({
      success: true,
      data: {
        batch: {
          _id: batch._id,
          batchName: batch.batchName,
          batchCode: batch.batchCode,
        },
        statistics: {
          grades: {
            total: grades.length,
            distribution: gradeDistribution
          },
          students: {
            total: totalStudents,
            active: activeStudents,
            capacity: batch.maxStudents,
            fillPercentage: ((totalStudents / batch.maxStudents) * 100).toFixed(2),
          },
          subjects: {
            total: totalSubjects,
          },
          performance: {
            averagePercentage: averagePercentage.toFixed(2),
            totalExams: marks.length,
          },
          attendance: {
            rate: attendanceRate.toFixed(2),
            totalRecords: attendanceRecords.length,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
