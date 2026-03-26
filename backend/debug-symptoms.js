const mongoose = require('mongoose');
const Disease = require('./src/models/Disease');
const Symptom = require('./src/models/Symptom');
require('dotenv').config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const disease = await Disease.findOne({ name: 'Common Cold' });
    console.log('\n=== Common Cold ===');
    console.log('Symptoms in disease:', disease.symptoms);
    
    // Check what symptoms exist in the Symptom collection
    const symptoms = await Symptom.find({ name: { $in: ['fever', 'cough', 'sore throat'] } });
    console.log('\n=== Found Symptoms ===');
    symptoms.forEach(s => console.log('- Name:', s.name, '| Category:', s.category));
    
    // Get all unique symptoms from all diseases
    const allDiseases = await Disease.find({});
    const allDiseaseSymptoms = new Set();
    allDiseases.forEach(d => {
      if (d.symptoms) {
        d.symptoms.forEach(s => allDiseaseSymptoms.add(s.name.toLowerCase()));
      }
    });
    
    console.log('\n=== All Disease Symptoms (first 20) ===');
    Array.from(allDiseaseSymptoms).slice(0, 20).forEach(s => console.log('- ' + s));
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
  }
}

test();
