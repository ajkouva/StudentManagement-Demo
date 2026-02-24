const studentService = require('../services/student.service');

async function studentDetails(req, res) {
    try {
        if (!req.user || req.user.role !== "STUDENT") {
            return res.status(403).json({ message: "Access denied" });
        }

        const student = await studentService.getStudentDetails(req.user.email);

        // Use DB-side CURRENT_DATE for consistency based on previous fixes
        const currentMonth = new Date().toISOString().substring(0, 7) + '-01';
        const attendanceSummary = await studentService.getAttendanceSummary(req.user.email, currentMonth);

        res.json({
            profile: {
                name: student.name,
                id_code: student.id,
                email: student.email,
                roll_num: student.roll_num,
                subject: student.subject
            },
            current_month_attendance: attendanceSummary
        });
    } catch (e) {
        console.error('studentDetails err:', e);
        if (e.message === "Student profile not found") return res.status(404).json({ error: e.message });
        res.status(500).json({ error: 'Server error' });
    }
}

async function attendanceCalendar(req, res) {
    try {
        if (!req.user || req.user.role !== "STUDENT") {
            return res.status(403).json({ message: "Access denied" });
        }

        // Validation handled by Zod Middleware
        const { month } = req.body;

        let monthStart;
        if (month) {
            monthStart = month + '-01';
        } else {
            monthStart = null;
        }

        const calendar = await studentService.getAttendanceCalendar(req.user.email, monthStart);

        res.json({
            month: month || "Current Month",
            calendar
        });
    } catch (err) {
        console.error('attendanceCalendar err:', err);
        if (err.message === "Student profile not found") return res.status(404).json({ error: err.message });
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = { studentDetails, attendanceCalendar };