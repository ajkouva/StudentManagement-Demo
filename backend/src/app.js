const express = require('express');
const cors = require('cors');
const cookies = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');
const limiter = require('./middleware/auth.limiter');
const teacherLimiter = require('./middleware/teacher.limiter');

const app = express();
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ["https://yourdomain.com"]
        : ["http://localhost:5173", "http://127.0.0.1:5173"], // Add your frontend dev URLs here
    credentials: true
}));
app.use(express.json({ limit: "50kb" }));
app.use(cookies());

app.get("/", (req, res) => {
    res.send("Hello World!");
});


app.use('/api/auth', limiter, authRoutes);
// Apply limiter to student routes as well
app.use('/api/student', limiter, studentRoutes);
app.use('/api/teacher', teacherLimiter, teacherRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});



module.exports = app;