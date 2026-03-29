const express = require('express');
const router = express.Router();
const {
  getAllAttendance,
  getAttendanceById,
  createAttendance,
  markBulkAttendance,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');

router.get('/', getAllAttendance);
router.get('/:id', getAttendanceById);
router.post('/bulk', markBulkAttendance);
router.post('/', createAttendance);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);

module.exports = router;
