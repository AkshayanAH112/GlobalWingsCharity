const Batch = require('../models/Batch');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const StudentRanking = require('../models/StudentRanking');

// @desc    Get comprehensive batch analytics
// @route   GET /api/analytics/batch/:batchId
// @access  Private
exports.getBatchAnalytics = async (req, res, next) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId).populate('subjects');
    if (!batch) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BATCH_NOT_FOUND',
          message: 'Batch not found',
        },
      });
    }

    // Get students
    const students = await Student.find({ batchId });
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'active').length;

    // Get marks
    const marks = await Mark.find({ batch: batchId }).populate('subject');
    const totalExams = new Set(marks.map((m) => `${m.examName}_${m.examDate}`)).size;

    // Calculate average percentage
    const averagePercentage = marks.length > 0
      ? marks.reduce((sum, m) => sum + parseFloat(m.percentage), 0) / marks.length
      : 0;

    // Grade distribution
    const gradeDistribution = {
      'A+': 0,
      'A': 0,
      'B+': 0,
      'B': 0,
      'C+': 0,
      'C': 0,
      'D': 0,
      'F': 0,
    };
    marks.forEach((m) => {
      if (gradeDistribution.hasOwnProperty(m.grade)) {
        gradeDistribution[m.grade]++;
      }
    });

    // Subject-wise performance
    const subjectPerformanceMap = new Map();
    marks.forEach((m) => {
      const subjectId = m.subject._id.toString();
      if (!subjectPerformanceMap.has(subjectId)) {
        subjectPerformanceMap.set(subjectId, {
          subject: m.subject.subjectName,
          subjectCode: m.subject.subjectCode,
          marks: [],
        });
      }
      subjectPerformanceMap.get(subjectId).marks.push(parseFloat(m.percentage));
    });

    const subjectWisePerformance = Array.from(subjectPerformanceMap.values()).map((sp) => ({
      subject: sp.subject,
      subjectCode: sp.subjectCode,
      average: (sp.marks.reduce((sum, p) => sum + p, 0) / sp.marks.length).toFixed(2),
      highest: Math.max(...sp.marks).toFixed(2),
      lowest: Math.min(...sp.marks).toFixed(2),
      totalExams: sp.marks.length,
    }));

    // Get top performers (from StudentRanking)
    const topPerformers = await StudentRanking.find({ batch: batchId })
      .sort({ rankInBatch: 1 })
      .limit(5)
      .populate('student', 'studentId firstName lastName');

    // Students needing attention (below 50%)
    const needsAttention = await StudentRanking.find({
      batch: batchId,
      overallPercentage: { $lt: 50 },
    })
      .sort({ overallPercentage: 1 })
      .populate('student', 'studentId firstName lastName');

    // Attendance correlation
    const attendanceRecords = await Attendance.find({ batch: batchId }).populate('student');
    const studentAttendanceMap = new Map();

    attendanceRecords.forEach((record) => {
      const studentId = record.student._id.toString();
      if (!studentAttendanceMap.has(studentId)) {
        studentAttendanceMap.set(studentId, { present: 0, total: 0 });
      }
      const att = studentAttendanceMap.get(studentId);
      att.total++;
      if (record.status === 'present') att.present++;
    });

    const attendanceWithMarks = [];
    for (const [studentId, attData] of studentAttendanceMap) {
      const attendanceRate = (attData.present / attData.total) * 100;
      const studentMarks = marks.filter((m) => m.student.toString() === studentId);
      if (studentMarks.length > 0) {
        const avgMarks = studentMarks.reduce((sum, m) => sum + parseFloat(m.percentage), 0) / studentMarks.length;
        attendanceWithMarks.push({ attendanceRate, avgMarks });
      }
    }

    const highAttendance = attendanceWithMarks.filter((a) => a.attendanceRate >= 75);
    const lowAttendance = attendanceWithMarks.filter((a) => a.attendanceRate < 75);

    const attendanceCorrelation = {
      highAttendance: {
        avgMarks: highAttendance.length > 0
          ? (highAttendance.reduce((sum, a) => sum + a.avgMarks, 0) / highAttendance.length).toFixed(2)
          : 0,
        count: highAttendance.length,
      },
      lowAttendance: {
        avgMarks: lowAttendance.length > 0
          ? (lowAttendance.reduce((sum, a) => sum + a.avgMarks, 0) / lowAttendance.length).toFixed(2)
          : 0,
        count: lowAttendance.length,
      },
    };

    res.json({
      success: true,
      data: {
        batch: {
          _id: batch._id,
          batchName: batch.batchName,
          batchCode: batch.batchCode,
        },
        overview: {
          totalStudents,
          activeStudents,
          totalSubjects: batch.subjects?.length || 0,
          totalExams,
          averagePercentage: averagePercentage.toFixed(2),
        },
        gradeDistribution,
        subjectWisePerformance,
        topPerformers: topPerformers.map((tp) => ({
          rank: tp.rankInBatch,
          student: {
            studentId: tp.student.studentId,
            name: `${tp.student.firstName} ${tp.student.lastName}`,
          },
          percentage: tp.overallPercentage.toFixed(2),
          grade: tp.overallGrade,
        })),
        needsAttention: needsAttention.map((na) => ({
          student: {
            studentId: na.student.studentId,
            name: `${na.student.firstName} ${na.student.lastName}`,
          },
          percentage: na.overallPercentage.toFixed(2),
          grade: na.overallGrade,
        })),
        attendanceCorrelation,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get individual student analytics
// @route   GET /api/analytics/student/:studentId
// @access  Private
exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate('batchId');
    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STUDENT_NOT_FOUND',
          message: 'Student not found',
        },
      });
    }

    // Get marks
    const marks = await Mark.find({ student: studentId }).populate('subject batch');

    // Overall performance
    const totalObtained = marks.reduce((sum, m) => sum + m.obtainedMarks, 0);
    const totalPossible = marks.reduce((sum, m) => sum + m.totalMarks, 0);
    const overallPercentage = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;

    // Subject-wise breakdown
    const subjectMap = new Map();
    marks.forEach((m) => {
      const subjectId = m.subject._id.toString();
      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, {
          subject: m.subject.subjectName,
          subjectCode: m.subject.subjectCode,
          marks: [],
        });
      }
      subjectMap.get(subjectId).marks.push(parseFloat(m.percentage));
    });

    const subjectWiseBreakdown = Array.from(subjectMap.values()).map((sm) => ({
      subject: sm.subject,
      subjectCode: sm.subjectCode,
      average: (sm.marks.reduce((sum, p) => sum + p, 0) / sm.marks.length).toFixed(2),
      highest: Math.max(...sm.marks).toFixed(2),
      lowest: Math.min(...sm.marks).toFixed(2),
      examsCount: sm.marks.length,
    }));

    // Exam type breakdown
    const examTypeMap = new Map();
    marks.forEach((m) => {
      if (!examTypeMap.has(m.examType)) {
        examTypeMap.set(m.examType, []);
      }
      examTypeMap.get(m.examType).push(parseFloat(m.percentage));
    });

    const examTypeBreakdown = Array.from(examTypeMap.entries()).map(([type, percentages]) => ({
      examType: type,
      average: (percentages.reduce((sum, p) => sum + p, 0) / percentages.length).toFixed(2),
      count: percentages.length,
    }));

    // Progress trend (group by month)
    const progressTrend = [];
    const monthMap = new Map();
    marks.forEach((m) => {
      const monthKey = new Date(m.examDate).toISOString().substring(0, 7); // YYYY-MM
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, []);
      }
      monthMap.get(monthKey).push(parseFloat(m.percentage));
    });

    Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, percentages]) => {
        progressTrend.push({
          month,
          average: (percentages.reduce((sum, p) => sum + p, 0) / percentages.length).toFixed(2),
          examsCount: percentages.length,
        });
      });

    // Identify strengths and weaknesses
    const subjectAverages = subjectWiseBreakdown.map((s) => ({
      subject: s.subject,
      average: parseFloat(s.average),
    }));
    subjectAverages.sort((a, b) => b.average - a.average);

    const strengths = subjectAverages.slice(0, Math.min(3, subjectAverages.length)).map((s) => s.subject);
    const weaknesses = subjectAverages.slice(Math.max(0, subjectAverages.length - 3)).map((s) => s.subject);

    // Attendance
    const attendanceRecords = await Attendance.find({ student: studentId });
    const presentCount = attendanceRecords.filter((a) => a.status === 'present').length;
    const attendanceRate = attendanceRecords.length > 0
      ? (presentCount / attendanceRecords.length) * 100
      : 0;

    // Determine attendance trend (comparing recent vs older)
    const recentAttendance = attendanceRecords.slice(-10);
    const recentRate = recentAttendance.length > 0
      ? (recentAttendance.filter((a) => a.status === 'present').length / recentAttendance.length) * 100
      : 0;
    const attendanceTrend = recentRate > attendanceRate ? 'improving' : recentRate < attendanceRate ? 'declining' : 'stable';

    res.json({
      success: true,
      data: {
        student: {
          _id: student._id,
          studentId: student.studentId,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          batch: student.batchId ? student.batchId.batchName : null,
        },
        overallPerformance: {
          totalMarks: totalObtained,
          totalPossible,
          percentage: overallPercentage.toFixed(2),
          totalExams: marks.length,
        },
        subjectWiseBreakdown,
        examTypeBreakdown,
        progressTrend,
        strengths,
        weaknesses,
        attendance: {
          rate: attendanceRate.toFixed(2),
          present: presentCount,
          total: attendanceRecords.length,
          trend: attendanceTrend,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subject analytics across batches
// @route   GET /api/analytics/subject/:subjectId
// @access  Private
exports.getSubjectAnalytics = async (req, res, next) => {
  try {
    const { subjectId } = req.params;

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

    // Get all marks for this subject
    const marks = await Mark.find({ subject: subjectId }).populate('batch student');

    // Group by batch
    const batchMap = new Map();
    marks.forEach((m) => {
      const batchId = m.batch._id.toString();
      if (!batchMap.has(batchId)) {
        batchMap.set(batchId, {
          batch: m.batch.batchName,
          percentages: [],
          students: new Set(),
        });
      }
      const batchData = batchMap.get(batchId);
      batchData.percentages.push(parseFloat(m.percentage));
      batchData.students.add(m.student._id.toString());
    });

    const batchWisePerformance = Array.from(batchMap.values()).map((bm) => ({
      batch: bm.batch,
      average: (bm.percentages.reduce((sum, p) => sum + p, 0) / bm.percentages.length).toFixed(2),
      students: bm.students.size,
      examsCount: bm.percentages.length,
    }));

    // Overall average
    const allPercentages = marks.map((m) => parseFloat(m.percentage));
    const overallAverage = allPercentages.length > 0
      ? (allPercentages.reduce((sum, p) => sum + p, 0) / allPercentages.length).toFixed(2)
      : 0;

    // Grade distribution
    const gradeDistribution = {
      'A+': 0,
      'A': 0,
      'B+': 0,
      'B': 0,
      'C+': 0,
      'C': 0,
      'D': 0,
      'F': 0,
    };
    marks.forEach((m) => {
      if (gradeDistribution.hasOwnProperty(m.grade)) {
        gradeDistribution[m.grade]++;
      }
    });

    res.json({
      success: true,
      data: {
        subject: {
          _id: subject._id,
          subjectName: subject.subjectName,
          subjectCode: subject.subjectCode,
        },
        batchWisePerformance,
        overallAverage,
        gradeDistribution,
        totalExams: marks.length,
        totalStudents: new Set(marks.map((m) => m.student._id.toString())).size,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
