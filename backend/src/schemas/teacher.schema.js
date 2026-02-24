const { z } = require('zod');

const addStudentSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(50, "Name must be less than 50 characters")
        .trim(),
    email: z.string()
        .email("Invalid email format")
        .trim()
        .toLowerCase(),
    password: z.string()
        .min(8, "Password must be at least 8 characters long"),
    subject: z.string()
        .min(1, "Subject is required")
        .max(50, "Subject must be less than 50 characters")
        .trim(),
    roll_num: z.union([z.string(), z.number()])
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val > 0, "Roll number must be a positive integer")
});

const markAttendanceSchema = z.object({
    date: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format or value. Use YYYY-MM-DD")
        .refine(val => !isNaN(new Date(val).getTime()), "Invalid date"),
    records: z.array(z.object({
        id: z.number().optional(),
        student_id: z.number().optional(),
        status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'LEAVE'], {
            errorMap: () => ({ message: "Invalid status value" })
        }).optional()
    })).max(200, "Too many records in one request (limit 200)")
});

module.exports = {
    addStudentSchema,
    markAttendanceSchema
};
