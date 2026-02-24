const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const protect = require('../middleware/auth.protect');

router.get('/teacherDetails', protect, teacherController.teacherDetails);
router.post('/addStudent', protect, teacherController.addStudent);
router.get('/stats', protect, teacherController.stats);
router.post('/markAttendance', protect, teacherController.markAttendance);
router.get('/attendance75', protect, teacherController.attendance75);
router.get('/attendanceDetails', protect, teacherController.attendanceDetails);
router.delete('/deleteStudent/:id', protect, teacherController.deleteStudent);

module.exports = router;