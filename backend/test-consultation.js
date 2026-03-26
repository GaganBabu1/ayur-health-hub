const mongoose = require('mongoose');
const Symptom = require('./src/models/Symptom');
const { analyzeConsultation } = require('./src/services/aiService');
require('dotenv').config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the symptom IDs for fever, cough, sore throat
    const symptoms = await Symptom.find({ name: { $in: ['fever', 'cough', 'sore throat'] } });
    console.log('Found symptoms:', symptoms.map(s => s.name));
    
    // Call AI service with these symptoms
    const result = await analyzeConsultation({
      symptomNames: ['fever', 'cough', 'sore throat'],
      mentalState: {},
      userProfile: {}
    });
    
    console.log('\n=== RESULTS ===');
    console.log('Predicted diseases:');
    result.predictedDiseases.forEach(d => {
      console.log(`- ${d.name}: ${d.confidence}%`);
    });
    console.log('Triage level:', result.triageLevel);
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
  }
}

test();
