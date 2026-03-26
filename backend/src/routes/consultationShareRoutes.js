const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  shareConsultation,
  getSharedWithMe,
  getMyShares,
  getFeedbackFromDoctors,
  acceptShare,
  rejectShare,
  revokeShare,
  shareFeedbackWithPatient,
} = require('../controllers/consultationShareController');

// Share a consultation (Patient)
router.post('/share', protect, authorizeRoles('patient'), shareConsultation);

// Get consultations shared with me (Doctor)
router.get('/shared-with-me', protect, authorizeRoles('doctor'), getSharedWithMe);

// Get consultations I've shared (Patient)
router.get('/my-shares', protect, authorizeRoles('patient'), getMyShares);

// Get feedback from doctors (Patient)
router.get('/feedback-from-doctors', protect, authorizeRoles('patient'), getFeedbackFromDoctors);

// Accept share (Doctor)
router.put('/:shareId/accept', protect, authorizeRoles('doctor'), acceptShare);

// Reject share (Doctor)
router.put('/:shareId/reject', protect, authorizeRoles('doctor'), rejectShare);

// Share feedback with patient (Doctor sharing review back)
router.put('/:shareId/feedback', protect, authorizeRoles('doctor'), shareFeedbackWithPatient);

// Revoke share (Patient)
router.delete('/:shareId/revoke', protect, authorizeRoles('patient'), revokeShare);

module.exports = router;
