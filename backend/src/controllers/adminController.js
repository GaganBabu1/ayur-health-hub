const User = require('../models/User');
const Symptom = require('../models/Symptom');
const Disease = require('../models/Disease');
const Treatment = require('../models/Treatment');
const Consultation = require('../models/Consultation');

// ============ USER MANAGEMENT ============

// Get all users (exclude passwords)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select(
      '-password'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============ SYMPTOM CRUD ============

const createSymptom = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const symptom = await Symptom.create({ name, category, description });
    res.status(201).json(symptom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSymptoms = async (req, res) => {
  try {
    const symptoms = await Symptom.find().sort({ createdAt: -1 });
    res.status(200).json(symptoms);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSymptom = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const symptomId = req.params.id;

    const symptom = await Symptom.findByIdAndUpdate(
      symptomId,
      { name, category, description },
      { new: true }
    );

    if (!symptom) {
      return res.status(404).json({ message: 'Symptom not found' });
    }

    res.status(200).json(symptom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSymptom = async (req, res) => {
  try {
    const symptom = await Symptom.findByIdAndDelete(req.params.id);

    if (!symptom) {
      return res.status(404).json({ message: 'Symptom not found' });
    }

    res.status(200).json({ message: 'Symptom deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============ DISEASE CRUD ============

const createDisease = async (req, res) => {
  try {
    const { name, description, symptoms, severityLevel } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // If symptoms are provided as strings, convert them to ObjectIds
    let symptomIds = [];
    if (symptoms && symptoms.length > 0) {
      // Find symptom IDs by name
      const foundSymptoms = await Symptom.find({
        name: { $in: symptoms }
      }).select('_id');
      
      symptomIds = foundSymptoms.map(s => s._id);
      
      // Warn if some symptoms weren't found
      if (foundSymptoms.length < symptoms.length) {
        console.warn(`Warning: ${symptoms.length - foundSymptoms.length} symptoms not found in database`);
      }
    }

    const disease = await Disease.create({
      name,
      description,
      symptoms: symptomIds,
      severityLevel,
    });
    res.status(201).json(disease);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getDiseases = async (req, res) => {
  try {
    const diseases = await Disease.find()
      .populate('symptoms', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(diseases);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDisease = async (req, res) => {
  try {
    const { name, description, symptoms, severityLevel } = req.body;
    const diseaseId = req.params.id;

    // If symptoms are provided as strings, convert them to ObjectIds
    let symptomIds = symptoms;
    if (symptoms && symptoms.length > 0 && typeof symptoms[0] === 'string') {
      // Find symptom IDs by name
      const foundSymptoms = await Symptom.find({
        name: { $in: symptoms }
      }).select('_id');
      
      symptomIds = foundSymptoms.map(s => s._id);
    }

    const disease = await Disease.findByIdAndUpdate(
      diseaseId,
      { name, description, symptoms: symptomIds, severityLevel },
      { new: true }
    ).populate('symptoms', 'name');

    if (!disease) {
      return res.status(404).json({ message: 'Disease not found' });
    }

    res.status(200).json(disease);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteDisease = async (req, res) => {
  try {
    const disease = await Disease.findByIdAndDelete(req.params.id);

    if (!disease) {
      return res.status(404).json({ message: 'Disease not found' });
    }

    res.status(200).json({ message: 'Disease deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============ TREATMENT CRUD ============

const createTreatment = async (req, res) => {
  try {
    const { disease, herbs, dietRecommendations, lifestyleRecommendations, notes } = req.body;

    if (!disease) {
      return res.status(400).json({ message: 'Disease is required' });
    }

    const treatment = await Treatment.create({
      disease,
      herbs,
      dietRecommendations,
      lifestyleRecommendations,
      notes,
    });

    await treatment.populate('disease', 'name');
    res.status(201).json(treatment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.find()
      .populate('disease', 'name description')
      .sort({ createdAt: -1 });
    res.status(200).json(treatments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTreatment = async (req, res) => {
  try {
    const { disease, herbs, dietRecommendations, lifestyleRecommendations, notes } = req.body;
    const treatmentId = req.params.id;

    const treatment = await Treatment.findByIdAndUpdate(
      treatmentId,
      { disease, herbs, dietRecommendations, lifestyleRecommendations, notes },
      { new: true }
    ).populate('disease', 'name');

    if (!treatment) {
      return res.status(404).json({ message: 'Treatment not found' });
    }

    res.status(200).json(treatment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTreatment = async (req, res) => {
  try {
    const treatment = await Treatment.findByIdAndDelete(req.params.id);

    if (!treatment) {
      return res.status(404).json({ message: 'Treatment not found' });
    }

    res.status(200).json({ message: 'Treatment deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============ CONSULTATION MANAGEMENT ============

const getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('user', 'name email')
      .populate('doctor', 'name email')
      .populate('symptoms', 'name category')
      .sort({ createdAt: -1 });

    res.status(200).json(consultations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============ SEED DATA ============

const seedData = async (req, res) => {
  try {
    const sampleSymptoms = [
      { name: 'Fever', category: 'respiratory' },
      { name: 'Cough', category: 'respiratory' },
      { name: 'Cold', category: 'respiratory' },
      { name: 'Sore Throat', category: 'respiratory' },
      { name: 'Acidity', category: 'digestive' },
      { name: 'Bloating', category: 'digestive' },
      { name: 'Gas', category: 'digestive' },
      { name: 'Indigestion', category: 'digestive' },
      { name: 'Headache', category: 'neurological' },
      { name: 'Migraine', category: 'neurological' },
      { name: 'Stress', category: 'mental' },
      { name: 'Anxiety', category: 'mental' },
      { name: 'Insomnia', category: 'mental' },
    ];

    const createdSymptoms = await Symptom.insertMany(sampleSymptoms, { ordered: false }).catch(
      (err) => {
        if (err.code === 11000) {
          return Symptom.find({ name: { $in: sampleSymptoms.map((s) => s.name) } });
        }
        throw err;
      }
    );

    const sampleDiseases = [
      {
        name: 'Upper Respiratory Infection',
        description: 'Common viral infection affecting the respiratory system',
        severityLevel: 'medium',
      },
      {
        name: 'Acidity / Gastritis',
        description: 'Digestive disorder characterized by stomach acidity',
        severityLevel: 'low',
      },
      {
        name: 'Migraine / Headache',
        description: 'Severe headache condition',
        severityLevel: 'medium',
      },
      {
        name: 'Stress-related Disorder',
        description: 'Disorder caused by prolonged stress and anxiety',
        severityLevel: 'medium',
      },
      {
        name: 'General Malaise / Further Evaluation Needed',
        description: 'General condition requiring further evaluation',
        severityLevel: 'low',
      },
    ];

    const createdDiseases = await Disease.insertMany(sampleDiseases, { ordered: false }).catch(
      (err) => {
        if (err.code === 11000) {
          return Disease.find({ name: { $in: sampleDiseases.map((d) => d.name) } });
        }
        throw err;
      }
    );

    res.status(201).json({
      message: 'Sample data seeded successfully',
      symptoms: createdSymptoms,
      diseases: createdDiseases,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
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
};
