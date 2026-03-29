const Attendance = require('../models/Attendance');

// @desc    Get all attendance records (optionally filtered by date, batch, student)
// @route   GET /api/attendance
const getAllAttendance = async (req, res) => {
  try {
    const { date, batchId, studentId, page = 1, limit = 100 } = req.query;

    const filter = {};

    // Filter by date (full day range)
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    if (batchId) filter.batch = batchId;
    if (studentId) filter.student = studentId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attendance.countDocuments(filter);

    const records = await Attendance.find(filter)
      .populate('student', 'studentId firstName lastName')
      .populate('batch', 'batchName batchCode')
      .populate('subject', 'subjectName subjectCode')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: records,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
const getAttendanceById = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate('student', 'studentId firstName lastName')
      .populate('batch', 'batchName batchCode')
      .populate('subject', 'subjectName subjectCode');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a single attendance record
// @route   POST /api/attendance
const createAttendance = async (req, res) => {
  try {
    const { student, batch, subject, date, status, checkInTime, checkOutTime, remarks } = req.body;

    // Use authenticated user as markedBy, or fall back to a system placeholder
    const markedBy = req.user?._id;
    if (!markedBy) {
      return res.status(401).json({ success: false, message: 'Authentication required to mark attendance' });
    }

    const record = await Attendance.create({
      student,
      batch,
      subject: subject || undefined,
      date: date || new Date(),
      status,
      checkInTime: checkInTime || undefined,
      checkOutTime: checkOutTime || undefined,
      remarks,
      markedBy,
    });

    const populated = await record.populate([
      { path: 'student', select: 'studentId firstName lastName' },
      { path: 'batch', select: 'batchName batchCode' },
      { path: 'subject', select: 'subjectName subjectCode' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this student on this date/subject',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk mark attendance for a batch
// @route   POST /api/attendance/bulk
const markBulkAttendance = async (req, res) => {
  try {
    const records = req.body; // Array of attendance objects
    const markedBy = req.user?._id;

    if (!markedBy) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Records array is required' });
    }

    const withMarkedBy = records.map((r) => ({ ...r, markedBy }));

    // Use insertMany with ordered:false to continue on duplicates
    const result = await Attendance.insertMany(withMarkedBy, { ordered: false });

    res.status(201).json({ success: true, data: result, count: result.length });
  } catch (error) {
    // Partial success – some records may have been inserted
    if (error.name === 'BulkWriteError' || error.code === 11000) {
      return res.status(207).json({
        success: true,
        message: 'Some records were skipped (already marked)',
        insertedCount: error.result?.nInserted || 0,
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an attendance record
// @route   PUT /api/attendance/:id
const updateAttendance = async (req, res) => {
  try {
    const { status, checkInTime, checkOutTime, remarks } = req.body;

    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, checkInTime, checkOutTime, remarks },
      { new: true, runValidators: true }
    )
      .populate('student', 'studentId firstName lastName')
      .populate('batch', 'batchName batchCode')
      .populate('subject', 'subjectName subjectCode');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an attendance record
// @route   DELETE /api/attendance/:id
const deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllAttendance,
  getAttendanceById,
  createAttendance,
  markBulkAttendance,
  updateAttendance,
  deleteAttendance,
};
