const mongoose = require('mongoose');
const Consultation = require('./src/models/Consultation');
const User = require('./src/models/User');
const Symptom = require('./src/models/Symptom');
const Disease = require('./src/models/Disease');

async function createSampleConsultations() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ayur-health');
    console.log('Connected to MongoDB\n');

    // Get a patient user
    const patient = await User.findOne({ role: 'patient' });
    if (!patient) {
      console.log('No patients found. Creating a test patient...');
      const testPatient = await User.create({
        name: 'John Doe',
        email: 'patient@example.com',
        password: 'password123',
        role: 'patient',
        age: 35,
        gender: 'Male',
      });
      console.log(`Created test patient: ${testPatient.name}`);
    }

    const patientToUse = patient || (await User.findOne({ role: 'patient' }));

    // Get some symptoms
    let symptoms = await Symptom.find({}).limit(3);
    if (symptoms.length === 0) {
      console.log('No symptoms found. Creating test symptoms...');
      const testSymptoms = await Symptom.insertMany([
        { name: 'Headache', category: 'Neurological' },
        { name: 'Fever', category: 'General' },
        { name: 'Cough', category: 'Respiratory' },
      ]);
      symptoms = testSymptoms;
      console.log(`Created ${testSymptoms.length} test symptoms`);
    }

    // Get some diseases
    let diseases = await Disease.find({}).limit(2);
    if (diseases.length === 0) {
      console.log('No diseases found. Creating test diseases...');
      const testDiseases = await Disease.insertMany([
        { name: 'Fever', description: 'Common fever', symptoms: [symptoms[1]._id] },
        { name: 'Cough', description: 'Common cough', symptoms: [symptoms[2]._id] },
      ]);
      diseases = testDiseases;
      console.log(`Created ${testDiseases.length} test diseases`);
    }

    // Create sample consultations with different triage levels
    const consultations = await Consultation.insertMany([
      {
        user: patientToUse._id,
        symptoms: [symptoms[0]._id],
        triageLevel: 'doctor',
        status: 'review_pending',
        predictedDiseases: [
          { name: 'Migraine', confidence: 0.85 },
          { name: 'Tension Headache', confidence: 0.65 },
        ],
        diseaseHistory: 'No previous history',
        recommendedPlan: {
          herbs: ['Brahmi', 'Ashwagandha'],
          diet: ['Light diet', 'Avoid spicy food'],
          lifestyle: ['Rest', 'Stay hydrated'],
        },
      },
      {
        user: patientToUse._id,
        symptoms: [symptoms[1]._id, symptoms[2]._id],
        triageLevel: 'urgent',
        status: 'review_pending',
        predictedDiseases: [
          { name: 'Cold', confidence: 0.75 },
          { name: 'Flu', confidence: 0.60 },
        ],
        diseaseHistory: 'Seasonal allergies',
        recommendedPlan: {
          herbs: ['Tulsi', 'Ginger'],
          diet: ['Warm liquids', 'Vitamin C rich foods'],
          lifestyle: ['Complete rest', 'Avoid cold air'],
        },
      },
      {
        user: patientToUse._id,
        symptoms: [symptoms[0]._id],
        triageLevel: 'doctor',
        status: 'review_pending',
        predictedDiseases: [
          { name: 'Headache', confidence: 0.70 },
        ],
        diseaseHistory: 'None',
        recommendedPlan: {
          herbs: ['Brahmi'],
          diet: ['Normal diet'],
          lifestyle: ['Light exercise'],
        },
      },
      {
        user: patientToUse._id,
        symptoms: [symptoms[2]._id],
        triageLevel: 'normal',
        status: 'review_pending',
        predictedDiseases: [
          { name: 'Dry cough', confidence: 0.65 },
        ],
        diseaseHistory: 'None',
        recommendedPlan: {
          herbs: ['Turmeric milk'],
          diet: ['Honey', 'Warm water'],
          lifestyle: ['Voice rest'],
        },
      },
      {
        user: patientToUse._id,
        symptoms: [symptoms[1]._id],
        triageLevel: 'urgent',
        status: 'review_pending',
        predictedDiseases: [
          { name: 'High Fever', confidence: 0.90 },
        ],
        diseaseHistory: 'Recent travel',
        recommendedPlan: {
          herbs: ['Neem', 'Tulsi'],
          diet: ['Liquid diet', 'Coconut water'],
          lifestyle: ['Bed rest', 'Keep cool'],
        },
      },
    ]);

    console.log(`\n✓ Created ${consultations.length} sample consultations:`);
    consultations.forEach((c, i) => {
      console.log(`  ${i + 1}. Triage: ${c.triageLevel}, Status: ${c.status}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createSampleConsultations();
