const express = require('express');
const router = express.Router();
const { register, login, demoLogin, getMe, updatePreferences } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', authMiddleware, getMe);
router.patch('/preferences', authMiddleware, updatePreferences);

module.exports = router;
