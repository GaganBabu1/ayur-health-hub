const express = require('express');
const router = express.Router();
const { registerUser, loginUser, initializeAdmin } = require('../controllers/authController');

// POST /api/auth/register - Register a new user
router.post('/register', registerUser);

// POST /api/auth/login - Login user
router.post('/login', loginUser);

// POST /api/auth/init-admin - Initialize first admin/doctor (no auth required, but only works once for admin)
router.post('/init-admin', initializeAdmin);

module.exports = router;
