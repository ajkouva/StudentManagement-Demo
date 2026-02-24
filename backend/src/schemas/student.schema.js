const { z } = require('zod');

const attendanceCalendarSchema = z.object({
    month: z.string().optional().refine(val => {
        if (!val) return true;
        const parsed = new Date(val + '-01');
        return !isNaN(parsed.getTime());
    }, "Invalid month format. Use YYYY-MM")
});

module.exports = {
    attendanceCalendarSchema
};
