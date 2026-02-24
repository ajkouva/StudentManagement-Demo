const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const protect = require('../middleware/auth.protect');
const { validateSchema } = require('../middleware/validate');
const { attendanceCalendarSchema } = require('../schemas/student.schema');

router.get('/studentDetails', protect, studentController.studentDetails);
router.post('/attendanceCalendar', protect, validateSchema(attendanceCalendarSchema), studentController.attendanceCalendar);

module.exports = router;