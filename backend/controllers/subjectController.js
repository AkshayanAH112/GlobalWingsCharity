const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
exports.getAllSubjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, isActive } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { subjectName: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [subjects, total] = await Promise.all([
      Subject.find(query)
        .sort({ subjectName: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Subject.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: subjects,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
exports.getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).lean();
    if (!subject) return res.status(404).json({ success: false, error: { message: 'Subject not found' } });
    res.json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

// @desc    Create subject
// @route   POST /api/subjects
exports.createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!subject) return res.status(404).json({ success: false, error: { message: 'Subject not found' } });
    res.json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ success: false, error: { message: 'Subject not found' } });
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
