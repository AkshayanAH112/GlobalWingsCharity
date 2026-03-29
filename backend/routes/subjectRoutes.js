const express = require('express');
const router = express.Router();
const { getAllSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.route('/').get(getAllSubjects).post(createSubject);
router.route('/:id').get(getSubjectById).put(updateSubject).delete(deleteSubject);

module.exports = router;
