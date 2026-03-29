const Grade = require('../models/Grade');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Mark = require('../models/Mark');

/**
 * @desc    Create a new grade within a batch
 * @route   POST /api/grades
 * @access  Private (Admin/Teacher)
 */
exports.createGrade = async (req, res, next) => {
  try {
    const { batchId, gradeName, gradeCode, section, classTeacher, maxStudents } = req.body;

    // Validate batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Create grade
    const grade = await Grade.create({
      batch: batchId,
      gradeName,
      gradeCode,
      section: section || 'A',
      classTeacher,
      maxStudents: maxStudents || 50,
      subjects: [],
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: grade
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A grade with this name and section already exists in this batch' 
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all grades (with optional filters)
 * @route   GET /api/grades
 * @access  Private
 */
exports.getAllGrades = async (req, res, next) => {
  try {
    const { status, batchId, gradeName } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (batchId) query.batch = batchId;
    if (gradeName) query.gradeName = gradeName;

    const grades = await Grade.find(query)
      .populate('batch', 'batchName academicYear batchCode')
      .populate('subjects', 'subjectName subjectCode')
      .sort({ 'batch.academicYear': -1, gradeName: 1, section: 1 });

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

    res.json({
      success: true,
      count: gradesWithCounts.length,
      data: gradesWithCounts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all grades in a batch
 * @route   GET /api/batches/:batchId/grades
 * @access  Private
 */
exports.getBatchGrades = async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const { status, section } = req.query;

    // Validate batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Build query
    const query = { batch: batchId };
    if (status) query.status = status;
    if (section) query.section = section;

    const grades = await Grade.find(query)
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

    res.json({
      success: true,
      count: gradesWithCounts.length,
      data: gradesWithCounts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get grade details with students and subjects
 * @route   GET /api/grades/:id
 * @access  Private
 */
exports.getGradeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { includeStudents = 'true', includeSubjects = 'true' } = req.query;

    const grade = await Grade.findById(id)
      .populate('batch', 'batchName academicYear')
      .populate('subjects', 'subjectName subjectCode type credits');

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    const response = { ...grade.toObject() };

    // Include students if requested
    if (includeStudents === 'true') {
      const students = await Student.find({ gradeId: id })
        .select('studentId firstName lastName email phone status academicInfo')
        .sort({ 'academicInfo.rollNumber': 1 });
      
      response.students = students;
      response.currentStudents = students.length;
      response.availableSlots = grade.maxStudents - students.length;
    }

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update grade information
 * @route   PUT /api/grades/:id
 * @access  Private (Admin)
 */
exports.updateGrade = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { section, classTeacher, maxStudents, status } = req.body;

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Validate maxStudents doesn't go below current count
    if (maxStudents) {
      const currentCount = await Student.countDocuments({ 
        gradeId: id,
        status: 'Active'
      });
      
      if (maxStudents < currentCount) {
        return res.status(400).json({ 
          message: `Cannot set max students below current count (${currentCount})` 
        });
      }
    }

    // Update fields
    if (section) grade.section = section;
    if (classTeacher) grade.classTeacher = classTeacher;
    if (maxStudents) grade.maxStudents = maxStudents;
    if (status) grade.status = status;

    await grade.save();

    res.json({
      success: true,
      data: grade
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign subjects to grade
 * @route   POST /api/grades/:id/assign-subjects
 * @access  Private (Admin)
 */
exports.assignSubjects = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subjectIds } = req.body;

    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({ message: 'subjectIds array is required' });
    }

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Validate all subjects exist
    const subjects = await Subject.find({ _id: { $in: subjectIds } });
    if (subjects.length !== subjectIds.length) {
      return res.status(404).json({ message: 'One or more subjects not found' });
    }

    // Add subjects to grade (avoid duplicates)
    const existingSubjectIds = grade.subjects.map(s => s.toString());
    const newSubjects = subjectIds.filter(sid => !existingSubjectIds.includes(sid.toString()));
    
    grade.subjects.push(...newSubjects);
    await grade.save();

    // Populate and return
    await grade.populate('subjects', 'subjectName subjectCode type credits');

    res.json({
      success: true,
      message: `${newSubjects.length} subject(s) assigned to grade`,
      data: grade
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove subject from grade
 * @route   DELETE /api/grades/:id/subjects/:subjectId
 * @access  Private (Admin)
 */
exports.removeSubject = async (req, res, next) => {
  try {
    const { id, subjectId } = req.params;

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Check if there are existing marks for this subject in this grade
    const existingMarks = await Mark.countDocuments({
      subjectId,
      student: { $in: await Student.find({ gradeId: id }).distinct('_id') }
    });

    if (existingMarks > 0) {
      return res.status(400).json({ 
        message: `Cannot remove subject. ${existingMarks} mark entries exist for students in this grade` 
      });
    }

    // Remove subject
    grade.subjects = grade.subjects.filter(s => s.toString() !== subjectId);
    await grade.save();

    res.json({
      success: true,
      message: 'Subject removed from grade'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign students to grade
 * @route   POST /api/grades/:id/assign-students
 * @access  Private (Admin)
 */
exports.assignStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { studentIds, autoAssignRollNumbers = true } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'studentIds array is required' });
    }

    const grade = await Grade.findById(id).populate('batch');
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Check capacity
    const currentCount = await Student.countDocuments({ 
      gradeId: id
    });

    if (currentCount + studentIds.length > grade.maxStudents) {
      return res.status(400).json({ 
        message: `Grade capacity exceeded. Available slots: ${grade.maxStudents - currentCount}` 
      });
    }

    // Validate all students exist
    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res.status(404).json({ message: 'One or more students not found' });
    }

    // Check if students are already assigned to another grade
    const alreadyAssigned = students.filter(s => 
      s.gradeId && s.gradeId.toString() !== id.toString()
    );

    if (alreadyAssigned.length > 0) {
      return res.status(400).json({ 
        message: `${alreadyAssigned.length} student(s) already assigned to another grade`,
        students: alreadyAssigned.map(s => ({ 
          id: s._id, 
          name: `${s.firstName} ${s.lastName}` 
        }))
      });
    }

    // Assign students to grade
    const updates = [];
    let nextRollNumber = currentCount + 1;

    for (const student of students) {
      const updateData = {
        gradeId: id,
        batchId: grade.batch._id
      };

      // Auto-assign roll numbers if requested and not already set
      if (autoAssignRollNumbers && !student.academicInfo?.rollNumber) {
        updateData['academicInfo.rollNumber'] = nextRollNumber++;
      }

      updates.push(
        Student.findByIdAndUpdate(student._id, updateData, { new: true })
      );
    }

    await Promise.all(updates);

    res.json({
      success: true,
      message: `${students.length} student(s) assigned to grade`,
      data: {
        gradeId: id,
        gradeName: grade.gradeName,
        section: grade.section,
        assignedCount: students.length,
        currentTotal: currentCount + students.length,
        availableSlots: grade.maxStudents - (currentCount + students.length)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove student from grade
 * @route   DELETE /api/grades/:id/students/:studentId
 * @access  Private (Admin)
 */
exports.removeStudent = async (req, res, next) => {
  try {
    const { id, studentId } = req.params;
    const { clearMarks = false } = req.query;

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.gradeId?.toString() !== id) {
      return res.status(400).json({ message: 'Student is not in this grade' });
    }

    // Check for existing marks
    const markCount = await Mark.countDocuments({ student: studentId });
    
    if (markCount > 0 && !clearMarks) {
      return res.status(400).json({ 
        message: `Student has ${markCount} mark entries. Set clearMarks=true to remove student and all marks` 
      });
    }

    // Remove student from grade
    student.gradeId = null;
    student.batchId = null;
    student.academicInfo.rollNumber = null;
    await student.save();

    // Clear marks if requested
    if (clearMarks && markCount > 0) {
      await Mark.deleteMany({ student: studentId });
    }

    res.json({
      success: true,
      message: `Student removed from grade${clearMarks ? ' and marks cleared' : ''}`,
      marksCleared: clearMarks ? markCount : 0
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get grade statistics
 * @route   GET /api/grades/:id/statistics
 * @access  Private
 */
exports.getGradeStatistics = async (req, res, next) => {
  try {
    const { id } = req.params;

    const grade = await Grade.findById(id)
      .populate('batch', 'batchName academicYear')
      .populate('subjects', 'subjectName');

    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    // Get student count
    const studentCount = await Student.countDocuments({ 
      gradeId: id,
      status: 'Active'
    });

    // Get students with their marks
    const students = await Student.find({ gradeId: id, status: 'Active' })
      .select('_id');
    const studentIds = students.map(s => s._id);

    // Get marks statistics
    const marks = await Mark.find({ 
      student: { $in: studentIds }
    });

    const totalMarks = marks.length;
    const subjectWiseCount = {};
    
    marks.forEach(mark => {
      const subjectId = mark.subjectId.toString();
      subjectWiseCount[subjectId] = (subjectWiseCount[subjectId] || 0) + 1;
    });

    // Calculate average marks per subject
    const subjectStats = await Promise.all(
      grade.subjects.map(async (subject) => {
        const subjectMarks = await Mark.find({
          student: { $in: studentIds },
          subjectId: subject._id
        });

        if (subjectMarks.length === 0) {
          return {
            subject: subject.subjectName,
            entriesCount: 0,
            averageMarks: 0
          };
        }

        const avgMarks = subjectMarks.reduce((sum, m) => sum + m.marksObtained, 0) / subjectMarks.length;

        return {
          subject: subject.subjectName,
          entriesCount: subjectMarks.length,
          averageMarks: parseFloat(avgMarks.toFixed(2))
        };
      })
    );

    res.json({
      success: true,
      data: {
        grade: {
          id: grade._id,
          name: grade.gradeName,
          section: grade.section,
          batch: grade.batch.batchName,
          academicYear: grade.batch.academicYear
        },
        statistics: {
          totalStudents: studentCount,
          maxStudents: grade.maxStudents,
          availableSlots: grade.maxStudents - studentCount,
          occupancyRate: `${((studentCount / grade.maxStudents) * 100).toFixed(1)}%`,
          totalSubjects: grade.subjects.length,
          totalMarkEntries: totalMarks,
          avgMarksPerStudent: studentCount > 0 ? parseFloat((totalMarks / studentCount).toFixed(2)) : 0
        },
        subjectWiseStatistics: subjectStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
