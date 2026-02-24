const pool = require('../db/db');

class StudentService {
    async getStudentDetails(email) {
        const result = await pool.query('SELECT id, name, email, roll_num, subject FROM student WHERE email=$1', [email]);
        if (result.rows.length === 0) {
            throw new Error("Student profile not found");
        }
        return result.rows[0];
    }

    async getAttendanceCalendar(email, monthStart) {
        const studentRes = await pool.query('SELECT id FROM student WHERE email = $1', [email]);
        if (studentRes.rows.length === 0) {
            throw new Error("Student profile not found");
        }
        const studentId = studentRes.rows[0].id;

        const dateFilter = monthStart
            ? "AND DATE_TRUNC('month', date) = DATE_TRUNC('month', $2::date)"
            : "AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)";
        const params = monthStart ? [studentId, monthStart] : [studentId];

        const attendanceRes = await pool.query(`
            SELECT
                TO_CHAR(date, 'YYYY-MM-DD') AS mapped_date,
                status
            FROM attendance
            WHERE student_id = $1 ${dateFilter}
            ORDER BY date ASC
        `, params);

        return attendanceRes.rows.map(row => ({ date: row.mapped_date, status: row.status }));
    }

    async getAttendanceSummary(email, monthStart) {
        const studentRes = await pool.query('SELECT id FROM student WHERE email = $1', [email]);
        if (studentRes.rows.length === 0) {
            throw new Error("Student profile not found");
        }
        const studentId = studentRes.rows[0].id;

        const dateFilter = monthStart
            ? "DATE_TRUNC('month', a.date) = DATE_TRUNC('month', $2::date)"
            : "DATE_TRUNC('month', a.date) = DATE_TRUNC('month', CURRENT_DATE)";
        const params = monthStart ? [studentId, monthStart] : [studentId];

        const result = await pool.query(`
             SELECT
                COUNT(a.id) AS month_total_classes,
                COUNT(a.id) FILTER (WHERE a.status = 'PRESENT') AS month_present_count,
                ROUND(COUNT(a.id) FILTER (WHERE a.status = 'PRESENT')::numeric / NULLIF(COUNT(a.id), 0) * 100, 2) AS month_percentage
            FROM attendance a
            WHERE a.student_id = $1 AND ${dateFilter}
        `, params);

        return {
            total_classes: parseInt(result.rows[0].month_total_classes, 10),
            present_count: parseInt(result.rows[0].month_present_count, 10),
            attendance_percentage: result.rows[0].month_percentage !== null ? parseFloat(result.rows[0].month_percentage) : 0
        };
    }
}

module.exports = new StudentService();
