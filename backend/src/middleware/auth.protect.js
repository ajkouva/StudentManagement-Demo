const jwt = require('jsonwebtoken');
const pool = require('../db/db');
// require('dotenv').config();

const auth = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Security: Ensure user still exists so revoked/deleted users can't use valid tokens
        const userCheck = await pool.query('SELECT 1 FROM users WHERE email = $1', [decoded.email]);
        if (userCheck.rows.length === 0) {
            return res.status(401).json({ message: "User account no longer exists" });
        }

        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ message: "invalid token " });
    }
}

module.exports = auth;