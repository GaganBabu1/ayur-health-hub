const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getConsultationsForDoctor,
  addDoctorFeedback,
  assignConsultationToDoctor,
  getDoctorProfile,
  getAllDoctors,
} = require('../controllers/doctorController');

// ============ GET ALL DOCTORS (Public) ============
router.get('/list', getAllDoctors);
router.get('/all', getAllDoctors);

// ============ DOCTOR CONSULTATIONS (Doctor only) ============
router.get('/consultations', protect, authorizeRoles('doctor'), getConsultationsForDoctor);
router.put('/consultations/:id/feedback', protect, authorizeRoles('doctor'), addDoctorFeedback);

// ============ DOCTOR PROFILE (Doctor only) ============
router.get('/profile', protect, authorizeRoles('doctor'), getDoctorProfile);

// ============ ASSIGN CONSULTATION (Admin only) ============
router.post('/assign-consultation', protect, authorizeRoles('admin'), assignConsultationToDoctor);

module.exports = router;
