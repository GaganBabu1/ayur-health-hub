const ConsultationShare = require('../models/ConsultationShare');
const Consultation = require('../models/Consultation');
const User = require('../models/User');

/**
 * Share a consultation with a doctor
 */
exports.shareConsultation = async (req, res) => {
  try {
    const { consultationId, doctorId, message } = req.body;
    const patientId = req.user._id;

    // Validate consultation exists and belongs to patient
    const consultation = await Consultation.findById(consultationId);
    if (!consultation || consultation.patient.toString() !== patientId.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found or you do not have permission to share it',
      });
    }

    // Validate doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Check if already shared
    const existingShare = await ConsultationShare.findOne({
      consultation: consultationId,
      sharedWith: doctorId,
    });

    if (existingShare) {
      return res.status(400).json({
        success: false,
        message: 'Consultation already shared with this doctor',
      });
    }

    // Create share record
    const share = await ConsultationShare.create({
      consultation: consultationId,
      sharedBy: patientId,
      sharedWith: doctorId,
      message: message || '',
    });

    const populatedShare = await share.populate([
      { path: 'consultation', select: 'symptoms predictedDiseases' },
      { path: 'sharedBy', select: 'name email' },
      { path: 'sharedWith', select: 'name email' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Consultation shared successfully',
      data: populatedShare,
    });
  } catch (error) {
    console.error('Error sharing consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share consultation',
    });
  }
};

/**
 * Get consultations shared with me (for doctors)
 */
exports.getSharedWithMe = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const shares = await ConsultationShare.find({ sharedWith: doctorId })
      .populate({
        path: 'consultation',
        populate: [
          { path: 'patient', select: 'name email age gender' },
          { path: 'symptoms', select: 'name category' },
        ],
      })
      .populate('sharedBy', 'name email')
      .sort({ createdAt: -1 });

    // Mark as viewed
    await ConsultationShare.updateMany(
      { sharedWith: doctorId, viewedAt: null },
      { viewedAt: new Date() }
    );

    res.status(200).json({
      success: true,
      count: shares.length,
      data: shares,
    });
  } catch (error) {
    console.error('Error fetching shared consultations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared consultations',
    });
  }
};

/**
 * Get consultations I've shared (for patients)
 */
exports.getMyShares = async (req, res) => {
  try {
    const patientId = req.user._id;

    const shares = await ConsultationShare.find({ sharedBy: patientId })
      .populate({
        path: 'consultation',
        select: 'symptoms predictedDiseases createdAt',
      })
      .populate('sharedWith', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shares.length,
      data: shares,
    });
  } catch (error) {
    console.error('Error fetching my shares:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared consultations',
    });
  }
};

/**
 * Get feedback from doctors (for patients - shares where they are sharedBy and doctor sent feedback)
 */
exports.getFeedbackFromDoctors = async (req, res) => {
  try {
    const patientId = req.user._id;

    const shares = await ConsultationShare.find({ sharedBy: patientId })
      .populate({
        path: 'consultation',
        populate: [
          { path: 'symptoms', select: 'name category' },
          { path: 'predictedDiseases.disease', select: 'name' },
        ],
      })
      .populate('sharedWith', 'name email specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shares.length,
      data: shares,
    });
  } catch (error) {
    console.error('Error fetching feedback from doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback from doctors',
    });
  }
};

/**
 * Accept share (doctor accepting the consultation)
 */
exports.acceptShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const doctorId = req.user._id;

    const share = await ConsultationShare.findById(shareId);
    if (!share || share.sharedWith.toString() !== doctorId.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Share not found or you do not have permission',
      });
    }

    share.status = 'accepted';
    await share.save();

    const updatedShare = await share.populate([
      { path: 'consultation' },
      { path: 'sharedBy', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Consultation accepted',
      data: updatedShare,
    });
  } catch (error) {
    console.error('Error accepting share:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept consultation',
    });
  }
};

/**
 * Reject share (doctor rejecting the consultation)
 */
exports.rejectShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const doctorId = req.user._id;

    const share = await ConsultationShare.findById(shareId);
    if (!share || share.sharedWith.toString() !== doctorId.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Share not found or you do not have permission',
      });
    }

    share.status = 'rejected';
    await share.save();

    res.status(200).json({
      success: true,
      message: 'Consultation rejected',
    });
  } catch (error) {
    console.error('Error rejecting share:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject consultation',
    });
  }
};

/**
 * Revoke share (patient revoking access)
 */
exports.revokeShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const patientId = req.user._id;

    const share = await ConsultationShare.findById(shareId);
    if (!share || share.sharedBy.toString() !== patientId.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Share not found or you do not have permission',
      });
    }

    await ConsultationShare.findByIdAndDelete(shareId);

    res.status(200).json({
      success: true,
      message: 'Share revoked successfully',
    });
  } catch (error) {
    console.error('Error revoking share:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke share',
    });
  }
};

/**
 * Share feedback back to patient (doctor sharing review)
 */
exports.shareFeedbackWithPatient = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { message } = req.body;
    const doctorId = req.user._id;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Feedback message is required',
      });
    }

    const share = await ConsultationShare.findById(shareId);
    if (!share || share.sharedWith.toString() !== doctorId.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Share not found or you do not have permission',
      });
    }

    // Update the message with doctor's feedback
    share.message = message;
    share.status = 'accepted'; // Mark as accepted when doctor provides feedback
    await share.save();

    const updatedShare = await share.populate([
      { path: 'consultation' },
      { path: 'sharedBy', select: 'name email' },
      { path: 'sharedWith', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Feedback shared with patient successfully',
      data: updatedShare,
    });
  } catch (error) {
    console.error('Error sharing feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share feedback',
    });
  }
};

