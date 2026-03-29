const express = require('express');
const router = express.Router();
const {
  getBatchAnalytics,
  getStudentAnalytics,
  getSubjectAnalytics,
} = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Analytics routes
router.get('/batch/:batchId', getBatchAnalytics);
router.get('/student/:studentId', getStudentAnalytics);
router.get('/subject/:subjectId', getSubjectAnalytics);

module.exports = router;
