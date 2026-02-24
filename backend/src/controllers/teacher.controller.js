const pool = require('../db/db');
const teacherService = require('../services/teacher.service');

async function teacherDetails(req, res) {
    try {
        if (!req.user || req.user.role !== "TEACHER") {
            return res.status(403).json({ message: "Access denied" });
        }
        const teacher = await teacherService.getTeacherDetails(req.user.email);

        res.json({
            profile: {
                name: teacher.name,
                id_code: teacher.id,
                email: teacher.email,
                subject: teacher.subject
            }
        });
    } catch (e) {
        console.error(e);
        if (e.message === "Teacher profile not found") return res.status(404).json({ error: e.message });
        return res.status(500).json({ message: "Server error" });
    }
}

async function addStudent(req, res) {
    try {
        if (!req.user || req.user.role !== "TEACHER") {
            return res.status(403).json({ message: "Access denied" });
        }
        // Validation handled by Zod
        const { name, email, password, subject, roll_num } = req.body;

        await teacherService.addStudent({ name, email, password, subject, roll_num });

        return res.status(201).json({ message: "Register successful" });
    } catch (e) {
        console.error(e);
        if (e.message.includes("Student with this")) {
            return res.status(400).json({ message: e.message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

async function stats(req, res) {
    try {
        if (!req.user || req.user.role !== "TEACHER") {
            return res.status(403).json({ message: "Access denied" });
        }

        const { subject, stats: row } = await teacherService.getTeacherStats(req.user.email);

        res.status(200).json({
            subject,
            total_student: parseInt(row.total_student, 10),
            today: {
                present: parseInt(row.present, 10),
                absent: parseInt(row.absent, 10),
                late: parseInt(row.late, 10),
                on_leave: parseInt(row.on_leave, 10),
                not_marked: parseInt(row.not_marked, 10)
            }
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        if (err.message === "Teacher profile not found") return res.status(404).json({ error: err.message });
        res.status(500).json({ error: 'Server error' });
    }
}

async function markAttendance(req, res) {
    try {
        if (!req.user || req.user.role !== "TEACHER") {
            return res.status(403).json({ message: "Access denied" });
        }

        // Validation handled by Zod
        const { date, records } = req.body;

        const summary = await teacherService.markAttendance(req.user.email, date, records);

        res.json({
            message: 'Attendance processing completed',
            summary: {
                total: summary.total,
                marked: summary.marked,
                skipped: summary.skipped
            },
            skippedDetails: summary.skipped > 0 ? summary.skippedDetails : undefined
        });
    } catch (err) {
        console.error('Mark attendance error:', err);
        if (err.message === "Teacher profile not found") return res.status(404).json({ error: err.message });
        if (err.code === '23503') return res.status(400).json({ error: 'Foreign key violation: Student ID does not exist', details: err.detail });
        res.status(500).json({ error: 'Server error', details: err.message });
    }
}

// Retaining attendance queries directly in controller for now as they are complex read operations
async function attendance75(req, res) {
    try {
        if (!req.user || req.user.role !== "TEACHER") {
            return res.status(403).json({ message: "Access denied" });
        }

        const teacherSubject = await teacherService.getTeacherSubject(req.user.email);

        const result = await pool.query(`
            SELECT
                s.id, s.name, s.email, s.roll_num,
                COUNT(a.id) AS total_classes,
                COUNT(a.id) FILTER (WHERE a.status = 'PRESENT') AS present_count,
                ROUND(COUNT(a.id) FILTER (WHERE a.status = 'PRESENT')::numeric / NULLIF(COUNT(a.id), 0) * 100, 2) AS attendance_percentage,
                COUNT(a.id) FILTER (WHERE DATE_TRUNC('month', a.date) = DATE_TRUNC('month', CURRENT_DATE)) AS month_total_classes,
                COUNT(a.id) FILTER (WHERE a.status = 'PRESENT' AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', CURRENT_DATE)) AS month_present_count,
                ROUND(COUNT(a.id) FILTER (WHERE a.status = 'PRESENT' AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', CURRENT_DATE))::numeric / NULLIF(COUNT(a.id) FILTER (WHERE DATE_TRUNC('month', a.date) = DATE_TRUNC('month', CURRENT_DATE)), 0) * 100, 2) AS month_percentage
            FROM student s
            LEFT JOIN attendance a ON a.student_id = s.id
            WHERE LOWER(s.subject) = LOWER($1)
            GROUP BY s.id, s.name, s.email, s.roll_num
            HAVING COUNT(a.id) = 0 OR ROUND(COUNT(a.id) FILTER (WHERE a.status = 'PRESENT')::numeric / NULLIF(COUNT(a.id), 0) * 100, 2) < 75
            ORDER BY attendance_percentage ASC NULLS FIRST
        `, [teacherSubject]);

        return res.status(200).json({
            subject: teacherSubject,
            count: result.rows.length,
            students: result.rows.map(row => ({
                id: row.id, name: row.name, email: row.email, roll_num: row.roll_num,
                total_classes: parseInt(row.total_classes, 10),
                present_count: parseInt(row.present_count, 10),
                attendance_percentage: row.attendance_percentage !== null ? parseFloat(row.attendance_percentage) : 0,
                current_month: {
                    total_classes: parseInt(row.month_total_classes, 10),
                    present_count: parseInt(row.month_present_count, 10),
                    attendance_percentage: row.month_percentage !== null ? parseFloat(row.month_percentage) : 0
                }
            }))
        });
    } catch (err) {
        console.error('attendance75 error:', err);
        if (err.message === "Teacher profile not found") return res.status(404).json({ error: err.message });
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
}

async function dailyAttendance(req, res) {
    try {
        if (!req.user || req.user.role !== "TEACHER") {
            return res.status(403).json({ message: "Access denied" });
        }

        const date = req.query.date || new Date().toISOString().split('T')[0];
        const students = await teacherService.getDailyAttendance(req.user.email, date);

        return res.status(200).json({
            date,
            students: students.map(s => ({
                id: s.id,
                name: s.name,
                roll_num: s.roll_num,
                status: s.status // will be null if no record exists for this date
            }))
        });
    } catch (err) {
        console.error('dailyAttendance error:', err);
        if (err.message === "Teacher profile not found") return res.status(404).json({ error: err.message });
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
}

async function attendanceDetails(req, res) {
    try {
        if (!req.user || req.user.role !== "TEACHER") {
            return res.status(403).json({ message: "Access denied" });
        }

        const teacherSubject = await teacherService.getTeacherSubject(req.user.email);

        let monthStart;
        if (req.query.month) {
            const parsed = new Date(req.query.month + '-01');
            if (isNaN(parsed.getTime())) return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
            monthStart = req.query.month + '-01';
        } else {
            monthStart = null;
        }

        const result = await pool.query(`
            SELECT
                s.id, s.name, s.email, s.roll_num,
                COUNT(a.id) FILTER (WHERE DATE_TRUNC('month', a.date) = DATE_TRUNC('month', COALESCE($2::date, CURRENT_DATE))) AS total_classes,
                COUNT(a.id) FILTER (WHERE a.status = 'PRESENT' AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', COALESCE($2::date, CURRENT_DATE))) AS present_count,
                COUNT(a.id) FILTER (WHERE a.status = 'ABSENT' AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', COALESCE($2::date, CURRENT_DATE))) AS absent_count,
                COUNT(a.id) FILTER (WHERE a.status = 'LATE' AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', COALESCE($2::date, CURRENT_DATE))) AS late_count,
                COUNT(a.id) FILTER (WHERE a.status = 'LEAVE' AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', COALESCE($2::date, CURRENT_DATE))) AS leave_count,
                ROUND(COUNT(a.id) FILTER (WHERE a.status = 'PRESENT' AND DATE_TRUNC('month', a.date) = DATE_TRUNC('month', COALESCE($2::date, CURRENT_DATE)))::numeric / NULLIF(COUNT(a.id) FILTER (WHERE DATE_TRUNC('month', a.date) = DATE_TRUNC('month', COALESCE($2::date, CURRENT_DATE))), 0) * 100, 2) AS attendance_percentage
            FROM student s
            LEFT JOIN attendance a ON a.student_id = s.id
            WHERE LOWER(s.subject) = LOWER($1)
            GROUP BY s.id, s.name, s.email, s.roll_num
            ORDER BY s.roll_num ASC
        `, [teacherSubject, monthStart]);

        const labelRes = await pool.query(`SELECT TO_CHAR(COALESCE($1::date, CURRENT_DATE), 'YYYY-MM') AS label`, [monthStart]);

        return res.status(200).json({
            subject: teacherSubject,
            month: labelRes.rows[0].label,
            count: result.rows.length,
            students: result.rows.map(row => ({
                id: row.id, name: row.name, email: row.email, roll_num: row.roll_num,
                total_classes: parseInt(row.total_classes, 10),
                present_count: parseInt(row.present_count, 10),
                absent_count: parseInt(row.absent_count, 10),
                late_count: parseInt(row.late_count, 10),
                leave_count: parseInt(row.leave_count, 10),
                attendance_percentage: row.attendance_percentage !== null ? parseFloat(row.attendance_percentage) : 0
            }))
        });
    } catch (err) {
        console.error('attendanceDetails error:', err);
        if (err.message === "Teacher profile not found") return res.status(404).json({ error: err.message });
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
}

async function deleteStudent(req, res) {
    try {
        if (!req.user || req.user.role !== "TEACHER") {
            return res.status(403).json({ message: "Access denied" });
        }

        const studentId = parseInt(req.params.id, 10);
        if (isNaN(studentId) || studentId <= 0) return res.status(400).json({ error: 'Invalid student ID' });

        const deleted = await teacherService.deleteStudent(req.user.email, studentId);

        return res.status(200).json({
            message: 'Student deleted successfully. Login access revoked.',
            deleted
        });
    } catch (err) {
        console.error('deleteStudent error:', err);
        if (err.message === "Teacher profile not found") return res.status(404).json({ error: err.message });
        if (err.message === "Student not found or not in your subject") return res.status(404).json({ error: err.message });
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
}

module.exports = { teacherDetails, addStudent, stats, markAttendance, attendance75, attendanceDetails, deleteStudent, dailyAttendance };