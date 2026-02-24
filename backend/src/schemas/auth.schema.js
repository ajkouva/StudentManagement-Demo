const { z } = require('zod');

const registerSchema = z.object({
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
        .trim()
});

const loginSchema = z.object({
    email: z.string()
        .email("Invalid email format")
        .trim()
        .toLowerCase(),
    password: z.string()
        .min(1, "Password is required")
});

module.exports = {
    registerSchema,
    loginSchema
};
