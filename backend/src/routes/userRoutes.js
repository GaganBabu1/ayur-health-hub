const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, getHealthHistory, addHealthEntry, changePassword, updatePreferences, deleteAccount } = require('../controllers/userController');

// GET /api/user/profile - Get user profile
router.get('/profile', protect, getProfile);

// PUT /api/user/profile - Update user profile
router.put('/profile', protect, updateProfile);

// GET /api/user/health-history - Get health history
router.get('/health-history', protect, getHealthHistory);

// POST /api/user/health-history - Add health history entry
router.post('/health-history', protect, addHealthEntry);

// PATCH /api/user/settings/password - Change password
router.patch('/settings/password', protect, changePassword);

// PATCH /api/user/settings/preferences - Update preferences
router.patch('/settings/preferences', protect, updatePreferences);

// DELETE /api/user/account - Delete account
router.delete('/account', protect, deleteAccount);

module.exports = router;
