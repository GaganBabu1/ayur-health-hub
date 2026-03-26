const Consultation = require('../models/Consultation');
const ConsultationShare = require('../models/ConsultationShare');
const User = require('../models/User');

// Get consultations for doctor (triage "doctor" or "urgent", or explicitly assigned)
const getConsultationsForDoctor = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Find consultations with triage level "doctor" or "urgent"
    // OR explicitly assigned to this doctor
    const consultations = await Consultation.find({
      $or: [
        { triageLevel: { $in: ['doctor', 'urgent'] } },
        { doctor: doctorId },
      ],
    })
      .populate('user', 'name email age gender')
      .populate('symptoms', 'name category')
      .populate('doctor', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add doctor feedback/notes to a consultation
const addDoctorFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorNotes, followUpRecommendation, status } = req.body;
    const doctorId = req.user._id;

    // Validate input
    if (!doctorNotes) {
      return res.status(400).json({ error: 'Doctor notes are required' });
    }

    // Find consultation
    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // Update consultation with doctor feedback
    consultation.doctor = doctorId;
    consultation.doctorNotes = doctorNotes;
    consultation.followUpRecommendation = followUpRecommendation || '';
    consultation.status = status || 'completed'; // "review_pending" or "completed"

    await consultation.save();

    // Also create/update a ConsultationShare record to track the doctor's response
    // Find existing share from patient to this doctor
    const existingShare = await ConsultationShare.findOne({
      consultation: id,
      sharedWith: doctorId,
    });

    if (existingShare) {
      // Update existing share with doctor's feedback
      existingShare.message = doctorNotes;
      existingShare.status = 'accepted';
      await existingShare.save();
    } else {
      // Create new share if patient shared with this doctor
      await ConsultationShare.create({
        consultation: id,
        sharedBy: consultation.user,
        sharedWith: doctorId,
        message: doctorNotes,
        status: 'accepted',
      });
    }

    // Populate before returning
    await consultation.populate('user', 'name email age gender');
    await consultation.populate('symptoms', 'name category');
    await consultation.populate('doctor', 'name email');

    return res.status(200).json({
      message: 'Doctor feedback added successfully',
      consultation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign consultation to a doctor (admin only)
const assignConsultationToDoctor = async (req, res) => {
  try {
    const { consultationId, doctorId } = req.body;

    // Validate input
    if (!consultationId || !doctorId) {
      return res
        .status(400)
        .json({ error: 'consultationId and doctorId are required' });
    }

    // Find consultation
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // Verify doctor exists and has doctor role
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    if (doctor.role !== 'doctor') {
      return res
        .status(400)
        .json({ error: 'User is not assigned as a doctor' });
    }

    // Assign consultation to doctor
    consultation.doctor = doctorId;
    await consultation.save();

    // Populate before returning
    await consultation.populate('user', 'name email age gender');
    await consultation.populate('symptoms', 'name category');
    await consultation.populate('doctor', 'name email');

    return res.status(200).json({
      message: 'Consultation assigned to doctor successfully',
      consultation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctor profile and statistics
const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const doctor = await User.findById(doctorId).select('-password');
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Get consultation statistics
    const totalConsultations = await Consultation.countDocuments({
      doctor: doctorId,
    });
    const completedConsultations = await Consultation.countDocuments({
      doctor: doctorId,
      status: 'completed',
    });
    const pendingConsultations = await Consultation.countDocuments({
      doctor: doctorId,
      status: 'review_pending',
    });

    return res.status(200).json({
      doctor,
      statistics: {
        totalConsultations,
        completedConsultations,
        pendingConsultations,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all doctors (for appointment booking, consultation sharing, etc.)
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('_id name email specialization experience rating').limit(50);
    return res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getConsultationsForDoctor,
  addDoctorFeedback,
  assignConsultationToDoctor,
  getDoctorProfile,
  getAllDoctors,
};
