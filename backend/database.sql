-- Clean slate first
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS teacher CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS attendance_status;

CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'LEAVE');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(20) DEFAULT 'TEACHER' NOT NULL
);

CREATE TABLE student (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE REFERENCES users(email) ON DELETE CASCADE,
	subject varchar(50) NOT NULL,
	roll_num INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teacher (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE REFERENCES users(email) ON DELETE CASCADE,
    -- Bug fix: subject must be NOT NULL; stats and markAttendance use it for filtering
    -- and would silently return 0 results if a teacher has no subject.
    subject VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES student(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance_status NOT NULL,
    UNIQUE(student_id, date)
);

-- Indices for frequently filtered columns
CREATE INDEX idx_student_subject ON student(LOWER(subject));
CREATE INDEX idx_teacher_subject ON teacher(LOWER(subject));
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);

-- Insert Dummy Data (Users first, then specific roles, then attendance)
-- Note: Passwords here are placeholders. In real app, they must be hashed. 
-- Assuming these are just for testing logic or DB constraints.

-- 1. Users
-- Note: All seed users have the password 'password123'
INSERT INTO users (name, email, password_hash, role) VALUES
('Aman Verma', 'aman@gmail.com', '$2a$10$wT.fR.0U/o/Y9Zt0G9s7V.hI2R3wTq0k9p/H/zCqQ8o2L9jQo.', 'STUDENT'),
('Riya Sharma', 'riya@gmail.com', '$2a$10$wT.fR.0U/o/Y9Zt0G9s7V.hI2R3wTq0k9p/H/zCqQ8o2L9jQo.', 'STUDENT'),
('Karan Singh', 'karan@gmail.com', '$2a$10$wT.fR.0U/o/Y9Zt0G9s7V.hI2R3wTq0k9p/H/zCqQ8o2L9jQo.', 'STUDENT'),
('Neha Gupta', 'neha@gmail.com', '$2a$10$wT.fR.0U/o/Y9Zt0G9s7V.hI2R3wTq0k9p/H/zCqQ8o2L9jQo.', 'STUDENT'),
('Arjun Patel', 'arjun@gmail.com', '$2a$10$wT.fR.0U/o/Y9Zt0G9s7V.hI2R3wTq0k9p/H/zCqQ8o2L9jQo.', 'STUDENT'),
('Amit Sir', 'amit@gmail.com', '$2a$10$wT.fR.0U/o/Y9Zt0G9s7V.hI2R3wTq0k9p/H/zCqQ8o2L9jQo.', 'TEACHER');

-- 2. Teacher
INSERT INTO teacher (name, email, subject) VALUES
('Amit Sir', 'amit@gmail.com', 'Computer Science');

-- 3. Students references users(email)
INSERT INTO student (name, email, subject, roll_num) VALUES
('Aman Verma', 'aman@gmail.com', 'Computer Science', 101),
('Riya Sharma', 'riya@gmail.com', 'Mathematics', 102),
('Karan Singh', 'karan@gmail.com', 'Physics', 103),
('Neha Gupta', 'neha@gmail.com', 'Chemistry', 104),
('Arjun Patel', 'arjun@gmail.com', 'Biology', 105);

-- 3. Attendance
-- Note: Using subqueries to get IDs because exact IDs might vary if sequences aren't reset, 
-- but for dummy data script with clean slate, we can assume sequential IDs or use subqueries for robustness.
-- However, for simplicity in this script, assuming IDs 1-5 correspond to the insertion order.

INSERT INTO attendance (student_id, date, status) VALUES
(1, '2026-02-11', 'PRESENT'),
(1, '2026-02-12', 'ABSENT'),
(2, '2026-02-13', 'PRESENT'),
(2, '2026-02-14', 'ABSENT'),
(2, '2026-02-15', 'PRESENT'),
(3, '2026-02-11', 'PRESENT'),
(3, '2026-02-12', 'ABSENT'),
(3, '2026-02-13', 'PRESENT'),
(3, '2026-02-14', 'ABSENT'),
(3, '2026-02-15', 'PRESENT');


-- View data
SELECT * FROM users;
SELECT * FROM student;
SELECT * FROM teacher;
SELECT * FROM attendance;

-- Select specific attendance (using Join now)
SELECT TO_CHAR(a.date, 'YYYY-MM-DD') as date, a.status 
FROM attendance a
JOIN student s ON a.student_id = s.id
WHERE s.email='aman@gmail.com' 
ORDER BY a.date DESC;