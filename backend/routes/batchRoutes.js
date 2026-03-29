const express = require('express');
const router = express.Router();
const {
  getAllBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchDetails,
  assignSubjects,
  assignStudents,
  removeStudent,
  removeSubject,
  getBatchStatistics,
} = require('../controllers/batchController');
const { getBatchGrades } = require('../controllers/gradeController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.get('/', getAllBatches);
router.post('/', authorize('admin'), createBatch);
router.get('/:id', getBatchDetails);
router.put('/:id', authorize('admin'), updateBatch);
router.delete('/:id', authorize('admin'), deleteBatch);

/**
 * @swagger
 * /api/batches/{batchId}/grades:
 *   get:
 *     summary: Get all grades in a batch
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Batch ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Completed, Archived]
 *         description: Filter by grade status
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *         description: Filter by section (A, B, C, etc.)
 *     responses:
 *       200:
 *         description: List of grades with student counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Batch not found
 */
router.get('/:batchId/grades', getBatchGrades);

/**
 * @swagger
 * /api/batches/{id}/details:
 *   get:
 *     summary: Get batch details with grades
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeGrades
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *           default: 'true'
 *     responses:
 *       200:
 *         description: Batch details retrieved
 *       404:
 *         description: Batch not found
 */
router.get('/:id/details', getBatchDetails);

/**
 * @swagger
 * /api/batches/{id}/statistics:
 *   get:
 *     summary: Get comprehensive batch statistics
 *     tags: [Batches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistics retrieved
 *       404:
 *         description: Batch not found
 */
router.get('/:id/statistics', getBatchStatistics);

// Admin/Teacher only routes
router.post('/:id/assign-subjects', authorize('admin', 'teacher'), assignSubjects);
router.post('/:id/assign-students', authorize('admin', 'teacher'), assignStudents);
router.delete('/:id/remove-student/:studentId', authorize('admin', 'teacher'), removeStudent);
router.delete('/:id/remove-subject/:subjectId', authorize('admin', 'teacher'), removeSubject);

module.exports = router;
