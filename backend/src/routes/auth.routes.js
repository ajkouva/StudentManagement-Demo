const express = require('express');
const protect = require('../middleware/auth.protect');
const { validateSchema } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', validateSchema(registerSchema), authController.register);
router.post('/login', validateSchema(loginSchema), authController.login);
router.get('/me', protect, authController.me);
router.post('/logout', authController.logout);

module.exports = router;