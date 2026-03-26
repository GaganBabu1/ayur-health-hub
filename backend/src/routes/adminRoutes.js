const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  updateUserRole,
  createSymptom,
  getSymptoms,
  updateSymptom,
  deleteSymptom,
  createDisease,
  getDiseases,
  updateDisease,
  deleteDisease,
  createTreatment,
  getTreatments,
  updateTreatment,
  deleteTreatment,
  getAllConsultations,
  seedData,
} = require('../controllers/adminController');

// ============ USER MANAGEMENT (Admin only) ============
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorizeRoles('admin'), updateUserRole);

// ============ SYMPTOM CRUD (Read: All users, Write: Admin only) ============
router.post('/symptoms', protect, authorizeRoles('admin'), createSymptom);
router.get('/symptoms', protect, getSymptoms); // Allow all authenticated users to read
router.put('/symptoms/:id', protect, authorizeRoles('admin'), updateSymptom);
router.delete('/symptoms/:id', protect, authorizeRoles('admin'), deleteSymptom);

// ============ DISEASE CRUD (Read: All users, Write: Admin only) ============
router.post('/diseases', protect, authorizeRoles('admin'), createDisease);
router.get('/diseases', protect, getDiseases); // Allow all authenticated users to read
router.put('/diseases/:id', protect, authorizeRoles('admin'), updateDisease);
router.delete('/diseases/:id', protect, authorizeRoles('admin'), deleteDisease);

// ============ TREATMENT CRUD (Read: All users, Write: Admin only) ============
router.post('/treatments', protect, authorizeRoles('admin'), createTreatment);
router.get('/treatments', protect, getTreatments); // Allow all authenticated users to read
router.put('/treatments/:id', protect, authorizeRoles('admin'), updateTreatment);
router.delete('/treatments/:id', protect, authorizeRoles('admin'), deleteTreatment);

// ============ CONSULTATION MANAGEMENT (Admin only) ============
router.get('/consultations', protect, authorizeRoles('admin'), getAllConsultations);

// ============ SEED DATA (No auth for testing) ============
router.post('/seed', seedData);

module.exports = router;

