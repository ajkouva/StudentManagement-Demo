const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require("../db/db");

class AuthService {
    async registerUser({ name, email, password, subject }) {
        const isuserExist = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (isuserExist.rows.length > 0) {
            throw new Error("User with this email already exists");
        }

        const password_hash = await bcrypt.hash(password, 10);
        const role = 'TEACHER';
        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            await client.query('INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4)', [name, email, password_hash, role]);
            await client.query('INSERT INTO teacher(name, email, subject) VALUES($1, $2, $3)', [name, email, subject]);
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            if (e.code === '23505') {
                throw new Error("User with this email already exists");
            }
            throw e;
        } finally {
            client.release();
        }

        return this.generateToken(email, role);
    }

    async loginUser({ email, password }) {
        const isuserExist = await pool.query('SELECT id, name, email, role, password_hash FROM users WHERE email=$1', [email]);

        if (isuserExist.rows.length === 0) {
            throw new Error("Wrong email or password");
        }

        const user = isuserExist.rows[0];
        const ismatch = await bcrypt.compare(password, user.password_hash);

        if (!ismatch) {
            throw new Error("Wrong email or password");
        }

        const token = this.generateToken(user.email, user.role);
        return { user, token };
    }

    async getUserDetails(email) {
        const user = await pool.query('SELECT id, name, email, role FROM users WHERE email=$1', [email]);
        if (user.rows.length === 0) {
            throw new Error("User not found");
        }
        return user.rows[0];
    }

    generateToken(email, role) {
        return jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    }
}

module.exports = new AuthService();
