const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Create a new appointment
const createAppointment = async (req, res) => {
  try {
    const { doctor, date, timeSlot, reason } = req.body;

    // Validate required fields
    if (!doctor || !date || !timeSlot) {
      return res.status(400).json({
        error: 'doctor, date, and timeSlot are required',
      });
    }

    // Validate date is in future
    const appointmentDate = new Date(date);
    if (appointmentDate < new Date()) {
      return res.status(400).json({
        error: 'Appointment date must be in the future',
      });
    }

    // Verify doctor exists and has doctor role
    const doctorUser = await User.findById(doctor);
    if (!doctorUser) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    if (doctorUser.role !== 'doctor') {
      return res.status(400).json({ error: 'User is not a doctor' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      date: appointmentDate,
      timeSlot,
      reason: reason || '',
      status: 'scheduled',
    });

    // Populate doctor and patient info
    await appointment.populate('patient', 'name email');
    await appointment.populate('doctor', 'name email');

    return res.status(201).json({
      message: 'Appointment created successfully',
      appointment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get appointments for logged-in patient (upcoming and past)
const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;

    // Find all patient appointments
    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'name email age gender')
      .populate('patient', 'name email')
      .sort({ date: 1 }); // Sort by date ascending

    // Separate upcoming and past appointments
    const now = new Date();
    const upcoming = [];
    const past = [];

    appointments.forEach((appointment) => {
      if (new Date(appointment.date) >= now) {
        upcoming.push(appointment);
      } else {
        past.push(appointment);
      }
    });

    return res.status(200).json({
      upcoming,
      past,
      totalAppointments: appointments.length,
      upcomingCount: upcoming.length,
      pastCount: past.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel appointment (patient only)
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user._id;

    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify patient is the one who booked it
    if (appointment.patient.toString() !== patientId.toString()) {
      return res.status(403).json({
        error: 'You can only cancel your own appointments',
      });
    }

    // Prevent cancelling already cancelled appointments
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        error: 'Appointment is already cancelled',
      });
    }

    // Prevent cancelling completed appointments
    if (appointment.status === 'completed') {
      return res.status(400).json({
        error: 'Cannot cancel a completed appointment',
      });
    }

    // Update status to cancelled
    appointment.status = 'cancelled';
    await appointment.save();

    // Populate before returning
    await appointment.populate('patient', 'name email');
    await appointment.populate('doctor', 'name email');

    return res.status(200).json({
      message: 'Appointment cancelled successfully',
      appointment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get appointments for doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Find all doctor appointments, sorted with upcoming first
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'name email age gender')
      .populate('doctor', 'name email')
      .sort({ date: 1 }); // Upcoming first (soonest date first)

    // Separate upcoming and past
    const now = new Date();
    const upcoming = [];
    const past = [];

    appointments.forEach((appointment) => {
      if (new Date(appointment.date) >= now && appointment.status !== 'cancelled') {
        upcoming.push(appointment);
      } else if (appointment.status !== 'cancelled') {
        past.push(appointment);
      }
    });

    return res.status(200).json({
      upcoming,
      past,
      totalAppointments: appointments.filter(a => a.status !== 'cancelled').length,
      upcomingCount: upcoming.length,
      pastCount: past.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark appointment as completed (doctor only)
const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user._id;

    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify doctor is assigned to this appointment
    if (appointment.doctor.toString() !== doctorId.toString()) {
      return res.status(403).json({
        error: 'You can only mark your own appointments as complete',
      });
    }

    // Prevent completing already completed appointments
    if (appointment.status === 'completed') {
      return res.status(400).json({
        error: 'Appointment is already completed',
      });
    }

    // Prevent completing cancelled appointments
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        error: 'Cannot complete a cancelled appointment',
      });
    }

    // Update status to completed
    appointment.status = 'completed';
    await appointment.save();

    // Populate before returning
    await appointment.populate('patient', 'name email');
    await appointment.populate('doctor', 'name email');

    return res.status(200).json({
      message: 'Appointment marked as completed',
      appointment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available time slots for a doctor on a specific date
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ error: 'doctorId and date are required' });
    }

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Find appointments for this doctor on this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' },
    });

    // Define available slots
    const allSlots = [
      { id: '1', time: '09:00 AM' },
      { id: '2', time: '09:30 AM' },
      { id: '3', time: '10:00 AM' },
      { id: '4', time: '10:30 AM' },
      { id: '5', time: '11:00 AM' },
      { id: '6', time: '02:00 PM' },
      { id: '7', time: '02:30 PM' },
      { id: '8', time: '03:00 PM' },
      { id: '9', time: '03:30 PM' },
      { id: '10', time: '04:00 PM' },
    ];

    // Filter out booked slots
    const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);
    const availableSlots = allSlots.map(slot => ({
      ...slot,
      available: !bookedSlots.includes(slot.time),
    }));

    return res.status(200).json(availableSlots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
  completeAppointment,
  getAvailableSlots,
};
