const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
  completeAppointment,
  getAvailableSlots,
} = require('../controllers/appointmentController');

// ============ GET AVAILABLE SLOTS (Public) ============
router.get('/available-slots', getAvailableSlots);

// ============ PATIENT APPOINTMENTS ============
router.post('/', protect, authorizeRoles('patient'), createAppointment);
router.get('/my', protect, authorizeRoles('patient'), getMyAppointments);
router.put('/:id/cancel', protect, authorizeRoles('patient'), cancelAppointment);

// ============ DOCTOR APPOINTMENTS ============
router.get('/doctor/list', protect, authorizeRoles('doctor'), getDoctorAppointments);
router.put('/doctor/:id/complete', protect, authorizeRoles('doctor'), completeAppointment);

module.exports = router;
