const express = require('express');
const router = express.Router();
const {
  bulkEntry,
  getGradeMarks,
  getGradeSubjectMarks,
} = require('../controllers/markController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes require authentication
router.use(authenticate);

// Bulk entry (Admin/Teacher only)
router.post('/bulk-entry', authorize('admin', 'teacher'), bulkEntry);

// Get marks
router.get('/grade/:gradeId', getGradeMarks);
router.get('/grade/:gradeId/subject/:subjectId', getGradeSubjectMarks);

module.exports = router;

