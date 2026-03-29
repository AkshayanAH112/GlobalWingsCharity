const express = require('express');
const router = express.Router();
const {
  calculateGradeRankings,
  getGradeRankings,
  getStudentRanking,
  getSubjectRankings,
} = require('../controllers/rankingController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes require authentication
router.use(authenticate);

// Ranking calculation (Admin/Teacher only)
router.post('/grade/:gradeId/calculate', authorize('admin', 'teacher'), calculateGradeRankings);

// Ranking retrieval (all authenticated users)
router.get('/grade/:gradeId', getGradeRankings);
router.get('/student/:studentId', getStudentRanking);
router.get('/grade/:gradeId/subject/:subjectId', getSubjectRankings);

module.exports = router;

