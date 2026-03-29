const express = require('express');
const router = express.Router();
const {
  createGrade,
  getAllGrades,
  getBatchGrades,
  getGradeDetails,
  updateGrade,
  assignSubjects,
  removeSubject,
  assignStudents,
  removeStudent,
  getGradeStatistics
} = require('../controllers/gradeController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     Grade:
 *       type: object
 *       required:
 *         - batch
 *         - gradeName
 *         - gradeCode
 *       properties:
 *         batch:
 *           type: string
 *           description: Batch ID reference
 *         gradeName:
 *           type: string
 *           enum: [Grade-6, Grade-7, Grade-8, Grade-9, Grade-10, Grade-11, Grade-12]
 *         gradeCode:
 *           type: string
 *           description: Unique code like "2024-G10-A"
 *         section:
 *           type: string
 *           default: "A"
 *         subjects:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of subject IDs
 *         classTeacher:
 *           type: string
 *           description: User ID of class teacher
 *         maxStudents:
 *           type: integer
 *           default: 50
 *         status:
 *           type: string
 *           enum: [Active, Completed, Archived]
 *           default: Active
 */

/**
 * @swagger
 * /api/grades:
 *   get:
 *     summary: Get all grades with optional filters
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Completed, Archived]
 *         description: Filter by grade status
 *       - in: query
 *         name: batchId
 *         schema:
 *           type: string
 *         description: Filter by batch ID
 *       - in: query
 *         name: gradeName
 *         schema:
 *           type: string
 *           enum: [Grade-6, Grade-7, Grade-8, Grade-9, Grade-10, Grade-11, Grade-12]
 *         description: Filter by grade name
 *     responses:
 *       200:
 *         description: List of grades with student counts
 *   post:
 *     summary: Create a new grade within a batch
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - batchId
 *               - gradeName
 *               - gradeCode
 *             properties:
 *               batchId:
 *                 type: string
 *               gradeName:
 *                 type: string
 *                 enum: [Grade-6, Grade-7, Grade-8, Grade-9, Grade-10, Grade-11, Grade-12]
 *               gradeCode:
 *                 type: string
 *               section:
 *                 type: string
 *               classTeacher:
 *                 type: string
 *               maxStudents:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Grade created successfully
 *       400:
 *         description: Validation error or duplicate grade
 */
router.get('/', getAllGrades);
router.post('/', authorize('admin'), createGrade);

/**
 * @swagger
 * /api/grades/{id}:
 *   get:
 *     summary: Get grade details with students and subjects
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeStudents
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *           default: 'true'
 *       - in: query
 *         name: includeSubjects
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *           default: 'true'
 *     responses:
 *       200:
 *         description: Grade details retrieved successfully
 *       404:
 *         description: Grade not found
 */
router.get('/:id', getGradeDetails);

/**
 * @swagger
 * /api/grades/{id}:
 *   put:
 *     summary: Update grade information
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               section:
 *                 type: string
 *               classTeacher:
 *                 type: string
 *               maxStudents:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [Active, Completed, Archived]
 *     responses:
 *       200:
 *         description: Grade updated successfully
 */
router.put('/:id', authorize('admin'), updateGrade);

/**
 * @swagger
 * /api/grades/{id}/assign-subjects:
 *   post:
 *     summary: Assign subjects to grade
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectIds
 *             properties:
 *               subjectIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Subjects assigned successfully
 */
router.post('/:id/assign-subjects', authorize('admin'), assignSubjects);

/**
 * @swagger
 * /api/grades/{id}/subjects/{subjectId}:
 *   delete:
 *     summary: Remove subject from grade
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject removed successfully
 *       400:
 *         description: Cannot remove - marks exist
 */
router.delete('/:id/subjects/:subjectId', authorize('admin'), removeSubject);

/**
 * @swagger
 * /api/grades/{id}/assign-students:
 *   post:
 *     summary: Assign students to grade with auto roll numbers
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentIds
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               autoAssignRollNumbers:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Students assigned successfully
 *       400:
 *         description: Capacity exceeded or validation error
 */
router.post('/:id/assign-students', authorize('admin'), assignStudents);

/**
 * @swagger
 * /api/grades/{id}/students/{studentId}:
 *   delete:
 *     summary: Remove student from grade
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: clearMarks
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Student removed successfully
 *       400:
 *         description: Student has marks - set clearMarks=true
 */
router.delete('/:id/students/:studentId', authorize('admin'), removeStudent);

/**
 * @swagger
 * /api/grades/{id}/statistics:
 *   get:
 *     summary: Get comprehensive grade statistics
 *     tags: [Grades]
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
 *         description: Statistics retrieved successfully
 */
router.get('/:id/statistics', getGradeStatistics);

module.exports = router;
