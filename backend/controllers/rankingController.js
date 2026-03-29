const StudentRanking = require('../models/StudentRanking');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Grade = require('../models/Grade');
const Mark = require('../models/Mark');

// Helper function to calculate grade
const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
};

// @desc    Calculate rankings for a grade
// @route   POST /api/rankings/grade/:gradeId/calculate
// @access  Private (Admin/Teacher)
exports.calculateGradeRankings = async (req, res, next) => {
  try {
    const { gradeId } = req.params;

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

    // Get all students in grade
    const students = await Student.find({ gradeId, status: 'Active' });
    
    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_STUDENTS',
          message: 'No active students found in this grade',
        },
      });
    }

    // Calculate performance for each student
    const rankings = [];

    for (const student of students) {
      // Get all marks for this student
      const marks = await Mark.find({
        student: student._id,
      }).populate('subject');

      if (marks.length === 0) {
        // Student has no marks yet, skip
        continue;
      }

      // Calculate overall performance
      const totalObtained = marks.reduce((sum, m) => sum + m.obtainedMarks, 0);
      const totalPossible = marks.reduce((sum, m) => sum + m.totalMarks, 0);
      const overallPercentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;
      const overallGrade = calculateGrade(overallPercentage);

      // Calculate subject-wise performance
      const subjectMap = new Map();
      marks.forEach((mark) => {
        const subjectId = mark.subject._id.toString();
        if (!subjectMap.has(subjectId)) {
          subjectMap.set(subjectId, {
            subject: mark.subject._id,
            totalObtained: 0,
            totalPossible: 0,
          });
        }
        const subjectData = subjectMap.get(subjectId);
        subjectData.totalObtained += mark.obtainedMarks;
        subjectData.totalPossible += mark.totalMarks;
      });

      const subjectPerformance = Array.from(subjectMap.values()).map((sp) => ({
        subject: sp.subject,
        totalObtained: sp.totalObtained,
        totalPossible: sp.totalPossible,
        percentage: sp.totalPossible > 0 ? (sp.totalObtained / sp.totalPossible) * 100 : 0,
        grade: calculateGrade(
          sp.totalPossible > 0 ? (sp.totalObtained / sp.totalPossible) * 100 : 0
        ),
      }));

      // Calculate exam type performance
      const examTypeMap = new Map();
      marks.forEach((mark) => {
        if (!examTypeMap.has(mark.examType)) {
          examTypeMap.set(mark.examType, {
            examType: mark.examType,
            totalObtained: 0,
            totalPossible: 0,
          });
        }
        const examData = examTypeMap.get(mark.examType);
        examData.totalObtained += mark.obtainedMarks;
        examData.totalPossible += mark.totalMarks;
      });

      const examTypePerformance = Array.from(examTypeMap.values()).map((ep) => ({
        examType: ep.examType,
        totalObtained: ep.totalObtained,
        totalPossible: ep.totalPossible,
        percentage: ep.totalPossible > 0 ? (ep.totalObtained / ep.totalPossible) * 100 : 0,
      }));

      rankings.push({
        student: student._id,
        batch: grade.batch._id,
        totalMarks: totalObtained,
        totalPossible,
        overallPercentage,
        overallGrade,
        subjectPerformance,
        examTypePerformance,
        calculatedAt: new Date(),
      });
    }

    // Sort by percentage (descending)
    rankings.sort((a, b) => b.overallPercentage - a.overallPercentage);

    // Assign ranks
    rankings.forEach((ranking, index) => {
      ranking.rankInBatch = index + 1;
      ranking.totalStudentsInBatch = rankings.length;
    });

    // Save rankings to database (replace existing for this grade)
    // Delete rankings for students in this grade only
    const studentIds = students.map(s => s._id);
    await StudentRanking.deleteMany({ student: { $in: studentIds } });
    await StudentRanking.insertMany(rankings);

    res.json({
      success: true,
      message: `Rankings calculated for ${rankings.length} students in ${grade.gradeName} ${grade.section}`,
      data: {
        grade: {
          id: grade._id,
          name: grade.gradeName,
          section: grade.section,
          batch: grade.batch.batchName
        },
        studentsProcessed: rankings.length,
        calculatedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get grade rankings
// @route   GET /api/rankings/grade/:gradeId
// @access  Private
exports.getGradeRankings = async (req, res, next) => {
  try {
    const { gradeId } = req.params;
    const { sortBy = 'rankInBatch', limit } = req.query;

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

    // Get all students in this grade
    const students = await Student.find({ gradeId, status: 'Active' });
    const studentIds = students.map(s => s._id);

    // Build query
    let query = StudentRanking.find({ student: { $in: studentIds } })
      .populate('student', 'studentId firstName lastName email academicInfo');

    // Apply sorting
    if (sortBy === 'overallPercentage') {
      query = query.sort({ overallPercentage: -1 });
    } else {
      query = query.sort({ rankInBatch: 1 });
    }

    // Apply limit
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const rankings = await query;

    // Calculate statistics
    let statistics = {
      totalStudents: students.length,
      studentsWithRankings: rankings.length
    };

    if (rankings.length > 0) {
      const percentages = rankings.map((r) => r.overallPercentage);
      statistics = {
        ...statistics,
        averagePercentage: (
          percentages.reduce((sum, p) => sum + p, 0) / percentages.length
        ).toFixed(2),
        highestPercentage: Math.max(...percentages).toFixed(2),
        lowestPercentage: Math.min(...percentages).toFixed(2),
      };

      return res.json({
        success: true,
        data: {
          grade: {
            _id: grade._id,
            gradeName: grade.gradeName,
            section: grade.section,
            batch: grade.batch.batchName
          },
          rankings,
          statistics,
        },
      });
    }

    res.json({
      success: true,
      data: {
        grade: {
          _id: grade._id,
          gradeName: grade.gradeName,
          section: grade.section,
          batch: grade.batch.batchName
        },
        rankings: [],
        statistics: {
          averagePercentage: 0,
          highestPercentage: 0,
          lowestPercentage: 0,
          totalStudents: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student ranking
// @route   GET /api/rankings/student/:studentId
// @access  Private
exports.getStudentRanking = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .populate('gradeId')
      .populate('batchId');
    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STUDENT_NOT_FOUND',
          message: 'Student not found',
        },
      });
    }

    if (!student.gradeId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_GRADE_ASSIGNED',
          message: 'Student is not assigned to any grade',
        },
      });
    }

    const ranking = await StudentRanking.findOne({
      student: studentId,
    }).populate('subjectPerformance.subject', 'subjectName subjectCode');

    if (!ranking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RANKING_NOT_FOUND',
          message: 'Ranking not calculated yet. Please calculate grade rankings first.',
        },
      });
    }

    res.json({
      success: true,
      data: {
        student: {
          _id: student._id,
          studentId: student.studentId,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
        },
        grade: {
          _id: student.gradeId._id,
          gradeName: student.gradeId.gradeName,
          section: student.gradeId.section,
        },
        batch: {
          _id: student.batchId._id,
          batchName: student.batchId.batchName,
          batchCode: student.batchId.batchCode,
        },
        rank: ranking.rankInBatch,
        totalStudents: ranking.totalStudentsInBatch,
        overallPercentage: ranking.overallPercentage,
        overallGrade: ranking.overallGrade,
        totalMarks: ranking.totalMarks,
        totalPossible: ranking.totalPossible,
        subjectWisePerformance: ranking.subjectPerformance,
        examTypePerformance: ranking.examTypePerformance,
        calculatedAt: ranking.calculatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subject-wise rankings for a grade
// @route   GET /api/rankings/grade/:gradeId/subject/:subjectId
// @access  Private
exports.getSubjectRankings = async (req, res, next) => {
  try {
    const { gradeId, subjectId } = req.params;

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

    // Get all students in this grade
    const students = await Student.find({ gradeId, status: 'Active' });
    const studentIds = students.map(s => s._id);

    // Get all rankings for students in this grade
    const rankings = await StudentRanking.find({ student: { $in: studentIds } })
      .populate('student', 'studentId firstName lastName');

    // Filter and sort by subject performance
    const subjectRankings = [];

    rankings.forEach((ranking) => {
      const subjectPerf = ranking.subjectPerformance.find(
        (sp) => sp.subject.toString() === subjectId
      );

      if (subjectPerf) {
        subjectRankings.push({
          student: ranking.student,
          totalObtained: subjectPerf.totalObtained,
          totalPossible: subjectPerf.totalPossible,
          percentage: subjectPerf.percentage,
          grade: subjectPerf.grade,
        });
      }
    });

    // Sort by percentage
    subjectRankings.sort((a, b) => b.percentage - a.percentage);

    // Assign ranks
    subjectRankings.forEach((sr, index) => {
      sr.rank = index + 1;
    });

    const Subject = require('../models/Subject');
    const subject = await Subject.findById(subjectId);

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
        subject: subject
          ? {
              _id: subject._id,
              subjectName: subject.subjectName,
              subjectCode: subject.subjectCode,
            }
          : null,
        rankings: subjectRankings,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;

