const Consultation = require('../models/Consultation');
const Symptom = require('../models/Symptom');
const Disease = require('../models/Disease');
const ConsultationShare = require('../models/ConsultationShare');
const User = require('../models/User');
const { analyzeConsultation } = require('../services/aiService');

// Create a new consultation
const createConsultation = async (req, res) => {
  try {
    const { symptomIds = [], mentalState, diseaseHistory, oldTreatments } = req.body;

    // Validate at least one symptom
    if (!symptomIds || symptomIds.length === 0) {
      return res.status(400).json({ error: 'At least one symptom is required' });
    }

    // Load symptoms and get their names
    const symptoms = await Symptom.find({ _id: { $in: symptomIds } });
    if (symptoms.length === 0) {
      return res.status(400).json({ error: 'No valid symptoms found' });
    }

    const symptomNames = symptoms.map((s) => s.name.toLowerCase());

    // Call AI service (now async - uses database datasets)
    const aiResult = await analyzeConsultation({
      symptomNames,
      mentalState: mentalState || {},
      userProfile: {},
    });

    // Resolve disease names to Disease documents
    const predictedDiseasesWithIds = [];
    for (const predicted of aiResult.predictedDiseases) {
      const diseaseDoc = await Disease.findOne({ name: predicted.name });
      predictedDiseasesWithIds.push({
        disease: diseaseDoc ? diseaseDoc._id : null,
        name: predicted.name,
        confidence: predicted.confidence,
      });
    }

    // Create consultation
    const consultation = await Consultation.create({
      user: req.user._id,
      symptoms: symptomIds,
      mentalState: mentalState || {},
      diseaseHistory: diseaseHistory || '',
      oldTreatments: oldTreatments || '',
      predictedDiseases: predictedDiseasesWithIds,
      recommendedPlan: aiResult.recommendedPlan,
      triageLevel: aiResult.triageLevel,
    });

    // Populate and return
    console.log('Before populate - consultation._id:', consultation._id);
    await consultation.populate('symptoms', 'name category _id');
    console.log('After symptoms populate - consultation._id:', consultation._id);
    await consultation.populate('predictedDiseases.disease', 'name description');
    console.log('After diseases populate - consultation._id:', consultation._id);
    
    try {
      // Convert to plain object to ensure _id is included
      let consultationObj = consultation.toObject();
      
      // Explicitly ensure _id is present and not undefined
      if (!consultationObj._id) {
        console.error('❌ CRITICAL: _id is missing from toObject() result!');
        consultationObj._id = consultation._id;
      }
      
      console.log('✓ Consultation created successfully:', {
        _id: consultationObj._id ? consultationObj._id.toString() : 'MISSING',
        _idType: typeof consultationObj._id,
        userId: consultationObj.user,
        symptomCount: consultationObj.symptoms.length,
        diseaseCount: consultationObj.predictedDiseases.length,
      });
      
      // Ensure response includes all necessary fields
      const responseObj = {
        ...consultationObj,
        _id: consultationObj._id,  // Explicitly set _id
      };
      
      console.log('  Response includes:', {
        hasId: !!responseObj._id,
        idValue: responseObj._id ? responseObj._id.toString() : 'UNDEFINED',
      });
      
      return res.status(201).json(responseObj);
    } catch (convertError) {
      console.error('❌ Error converting consultation to object:', convertError);
      // Fallback - return the Mongoose document directly
      console.log('⚠️  Falling back to direct response:', {
        hasId: !!consultation._id,
        idValue: consultation._id?.toString?.() || 'N/A',
      });
      return res.status(201).json(consultation);
    }
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all consultations for the logged-in user
const getMyConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('symptoms', 'name category _id')
      .populate('predictedDiseases.disease', 'name description');

    return res.status(200).json(consultations);
  } catch (error) {
    console.error('Error fetching user consultations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a specific consultation by ID
const getConsultationById = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('user', 'name email age gender')
      .populate('doctor', 'name email')
      .populate('symptoms', 'name category _id')
      .populate('predictedDiseases.disease', 'name description');

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // Check access
    const isOwner = consultation.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isDoctor = req.user.role === 'doctor';

    if (!isOwner && !isAdmin && !isDoctor) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.status(200).json(consultation);
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all consultations (admin only)
const getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('doctor', 'name email')
      .populate('symptoms', 'name');

    return res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add patient notes to a consultation
const addPatientNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!notes || notes.trim() === '') {
      return res.status(400).json({ error: 'Notes cannot be empty' });
    }

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // Verify ownership
    if (consultation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    consultation.patientNotes = notes;
    await consultation.save();

    await consultation.populate('symptoms', 'name');
    return res.status(200).json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Share consultation with a doctor
const shareWithDoctor = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { doctorId, message } = req.body;
    const patientId = req.user._id;

    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor ID is required' });
    }

    // Validate consultation exists and belongs to patient
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    if (consultation.user.toString() !== patientId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if already shared
    const existingShare = await ConsultationShare.findOne({
      consultation: consultationId,
      sharedWith: doctorId,
    });

    if (existingShare) {
      return res.status(400).json({ error: 'Consultation already shared with this doctor' });
    }

    // Create ConsultationShare record
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

    return res.status(201).json({
      success: true,
      message: 'Consultation shared successfully',
      data: populatedShare,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createConsultation,
  getMyConsultations,
  getConsultationById,
  getAllConsultations,
  addPatientNotes,
  shareWithDoctor,
};
