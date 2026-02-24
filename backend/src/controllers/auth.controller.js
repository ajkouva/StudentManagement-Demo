const authService = require('../services/auth.service');

const isProduction = process.env.NODE_ENV === "production";

const cookie = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
}

//register user
async function register(req, res) {
    try {
        // Validation and sanitization is already handled by Zod Middleware
        const { name, email, password, subject } = req.body;

        const token = await authService.registerUser({ name, email, password, subject });

        res.cookie("token", token, cookie);
        return res.status(201).json({ message: "Register successful" });
    } catch (err) {
        console.error(err);
        if (err.message === "User with this email already exists") {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

//login
async function login(req, res) {
    try {
        // Validation and sanitization is already handled by Zod Middleware
        const { email, password } = req.body;

        const { user, token } = await authService.loginUser({ email, password });

        res.cookie("token", token, cookie);
        res.status(200).json({
            message: "Login successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        if (err.message === "Wrong email or password") {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

async function me(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await authService.getUserDetails(req.user.email);

        res.json({
            message: "Details fetched successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        if (err.message === "User not found") {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
}

async function logout(req, res) {
    try {
        res.cookie("token", "", { ...cookie, maxAge: 1 });
        res.json({ message: "Logged out successfully" })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { register, login, me, logout };