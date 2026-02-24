const { z } = require('zod');

// Middleware to validate request body against a Zod schema
const validateSchema = (schema) => {
    return (req, res, next) => {
        try {
            // Parses and strictly validates the request body
            const parsedBody = schema.parse(req.body);
            // Replace the request body with the explicitly sanitized/parsed data
            req.body = parsedBody;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Map Zod errors to a readable format
                const errorMessages = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    message: "Validation failed",
                    errors: errorMessages
                });
            }
            return res.status(400).json({ message: "Invalid request payload" });
        }
    };
};

module.exports = { validateSchema };
