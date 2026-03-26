const mongoose = require('mongoose');
const Disease = require('./src/models/Disease');
const Symptom = require('./src/models/Symptom');
require('dotenv').config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Test 1: Count documents
    const diseaseCount = await Disease.countDocuments();
    const symptomCount = await Symptom.countDocuments();
    console.log('✅ Database connected');
    console.log('   Diseases:', diseaseCount);
    console.log('   Symptoms:', symptomCount);
    
    // Test 2: Get a disease with symptoms
    const disease = await Disease.findOne();
    console.log('\n✅ Sample disease structure:');
    console.log('   Name:', disease.name);
    console.log('   Dosha:', disease.dosha);
    console.log('   Symptoms:', disease.symptoms ? disease.symptoms.slice(0, 2).map(s => s.name) : 'none');
    console.log('   Base confidence:', disease.baseConfidence);
    console.log('   Triage level:', disease.triageLevel);
    console.log('   Treatments available:', disease.treatments ? 'yes' : 'no');
    
    // Test 3: Get a symptom
    const symptom = await Symptom.findOne();
    console.log('\n✅ Sample symptom structure:');
    console.log('   Name:', symptom.name);
    console.log('   Category:', symptom.category);
    console.log('   Related diseases count:', symptom.relatedDiseases ? symptom.relatedDiseases.length : 0);
    
    // Test 4: Test AI service
    const { analyzeConsultation } = require('./src/services/aiService');
    const aiResult = await analyzeConsultation({
      symptomNames: ['fever', 'cough', 'sore throat'],
      mentalState: {},
      userProfile: {}
    });
    console.log('\n✅ AI Service test:');
    console.log('   Predicted diseases:', aiResult.predictedDiseases.map(d => d.name));
    console.log('   Triage level:', aiResult.triageLevel);
    console.log('   Data source:', aiResult.dataSource);
    
    await mongoose.disconnect();
    console.log('\n✅ All verification tests passed!');
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error('Stack:', e.stack);
    process.exit(1);
  }
}

test();
