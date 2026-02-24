const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const protect = require('../middleware/auth.protect');
const { validateSchema } = require('../middleware/validate');
const { addStudentSchema, markAttendanceSchema } = require('../schemas/teacher.schema');

router.get('/teacherDetails', protect, teacherController.teacherDetails);
router.post('/addStudent', protect, validateSchema(addStudentSchema), teacherController.addStudent);
router.get('/stats', protect, teacherController.stats);
router.post('/markAttendance', protect, validateSchema(markAttendanceSchema), teacherController.markAttendance);
router.get('/attendance75', protect, teacherController.attendance75);
router.get('/attendanceDetails', protect, teacherController.attendanceDetails);
router.get('/dailyAttendance', protect, teacherController.dailyAttendance);
router.delete('/deleteStudent/:id', protect, teacherController.deleteStudent);

module.exports = router;