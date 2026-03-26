const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  createConsultation,
  getMyConsultations,
  getConsultationById,
  getAllConsultations,
  addPatientNotes,
  shareWithDoctor,
} = require('../controllers/consultationController');

// POST /api/consultations - Create a new consultation (patient)
router.post('/', protect, createConsultation);

// GET /api/consultations/my - Get all consultations for logged-in user
router.get('/my', protect, getMyConsultations);

// GET /api/consultations/:id - Get a specific consultation
router.get('/:id', protect, getConsultationById);

// PUT /api/consultations/:id/patient-notes - Add/update patient notes
router.put('/:id/patient-notes', protect, addPatientNotes);

// POST /api/consultations/:consultationId/share - Share with a doctor
router.post('/:consultationId/share', protect, shareWithDoctor);

// GET /api/consultations - Get all consultations (admin only)
router.get('/', protect, authorizeRoles('admin'), getAllConsultations);

module.exports = router;
