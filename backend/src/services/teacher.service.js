const pool = require('../db/db');
const bcrypt = require('bcryptjs');

class TeacherService {
    async getTeacherSubject(email) {
        const teacherRes = await pool.query('SELECT subject FROM teacher WHERE email = $1', [email]);
        if (teacherRes.rows.length === 0) {
            throw new Error("Teacher profile not found");
        }
        return teacherRes.rows[0].subject;
    }

    async getTeacherDetails(email) {
        const result = await pool.query('SELECT id, name, email, subject FROM teacher WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            throw new Error("Teacher profile not found");
        }
        return result.rows[0];
    }

    async addStudent({ name, email, password, subject, roll_num }) {
        const password_hash = await bcrypt.hash(password, 10);
        const role = 'STUDENT';
        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            await client.query('INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4)', [name, email, password_hash, role]);
            await client.query("INSERT INTO student (name, email, subject, roll_num) VALUES($1, $2, $3, $4)", [name, email, subject, roll_num]);
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            if (e.code === '23505') {
                if (e.detail.includes('email')) throw new Error("Student with this email already exists");
                if (e.detail.includes('roll_num')) throw new Error("Student with this roll number already exists");
            }
            throw e;
        } finally {
            client.release();
        }
    }

    async getTeacherStats(email) {
        const teacherSubject = await this.getTeacherSubject(email);

        const todayStatsRes = await pool.query(`
            SELECT
                COUNT(DISTINCT s.id)                                                  AS total_student,
                COUNT(a.id) FILTER (WHERE a.status = 'PRESENT')                      AS present,
                COUNT(a.id) FILTER (WHERE a.status = 'ABSENT')                       AS absent,
                COUNT(a.id) FILTER (WHERE a.status = 'LATE')                         AS late,
                COUNT(a.id) FILTER (WHERE a.status = 'LEAVE')                        AS on_leave,
                COUNT(DISTINCT s.id)
                    - COUNT(a.id) FILTER (WHERE a.date = CURRENT_DATE)               AS not_marked
            FROM student s
            LEFT JOIN attendance a
                ON a.student_id = s.id AND a.date = CURRENT_DATE
            WHERE LOWER(s.subject) = LOWER($1)
        `, [teacherSubject]);

        return { subject: teacherSubject, stats: todayStatsRes.rows[0] };
    }

    async getDailyAttendance(email, date) {
        const teacherSubject = await this.getTeacherSubject(email);

        // Fetch all students for this teacher, and LEFT JOIN attendance for the specific date
        // If they have no attendance for that date, status will be null
        const result = await pool.query(`
            SELECT 
                s.id, 
                s.name, 
                s.email, 
                s.roll_num,
                a.status
            FROM student s
            LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $2
            WHERE LOWER(s.subject) = LOWER($1)
            ORDER BY s.roll_num ASC
        `, [teacherSubject, date]);

        return result.rows;
    }

    async markAttendance(email, date, records) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Using query directly on client to stay inside transaction context
            const teacherRes = await client.query('SELECT subject FROM teacher WHERE email = $1', [email]);
            if (teacherRes.rows.length === 0) {
                throw new Error("Teacher profile not found");
            }
            const teacherSubject = teacherRes.rows[0].subject;

            let markedCount = 0;
            let skippedCount = 0;
            const skippedDetails = [];
            const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'];

            const pendingRecords = [];
            for (const [recordIndex, record] of records.entries()) {
                const studentId = record.student_id || record.id;
                const status = record.status ? record.status.toUpperCase() : null;

                if (!studentId || !status || !validStatuses.includes(status)) {
                    skippedCount++;
                    skippedDetails.push({ record, reason: "Missing ID or invalid status" });
                } else {
                    pendingRecords.push({ recordIndex, studentId: parseInt(studentId, 10), status });
                }
            }

            const candidateIds = pendingRecords.map(r => r.studentId);
            let validStudentIds = new Set();
            if (candidateIds.length > 0) {
                const validationRes = await client.query(
                    'SELECT id FROM student WHERE id = ANY($1) AND LOWER(subject) = LOWER($2)',
                    [candidateIds, teacherSubject]
                );
                validStudentIds = new Set(validationRes.rows.map(r => r.id));
            }

            for (const { recordIndex, studentId, status } of pendingRecords) {
                if (!validStudentIds.has(studentId)) {
                    skippedCount++;
                    skippedDetails.push({ recordIndex, reason: "Student ID not found or not in your subject" });
                    continue;
                }

                await client.query(`
                    INSERT INTO attendance(student_id, date, status)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (student_id, date) DO UPDATE
                    SET status = excluded.status
                `, [studentId, date, status]);
                markedCount++;
            }

            await client.query('COMMIT');
            return { total: records.length, marked: markedCount, skipped: skippedCount, skippedDetails };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async deleteStudent(email, studentId) {
        const teacherSubject = await this.getTeacherSubject(email);

        const studentRes = await pool.query(
            'SELECT id, email FROM student WHERE id = $1 AND LOWER(subject) = LOWER($2)',
            [studentId, teacherSubject]
        );

        if (studentRes.rows.length === 0) {
            throw new Error("Student not found or not in your subject");
        }
        const studentEmail = studentRes.rows[0].email;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM attendance WHERE student_id = $1', [studentId]);
            await client.query('DELETE FROM student WHERE id = $1', [studentId]);
            await client.query('DELETE FROM users WHERE email = $1', [studentEmail]);
            await client.query('COMMIT');
            return { id: studentId, email: studentEmail };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = new TeacherService();
