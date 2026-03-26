const mongoose = require('mongoose');
const Symptom = require('./src/models/Symptom');

async function checkSymptoms() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ayur-health');
    
    const symptoms = await Symptom.find({}).select('name');
    const names = symptoms.map(s => s.name.toLowerCase());
    
    const needed = [
      'fatigue and weakness',
      'weight gain',
      'cold sensitivity',
      'hair loss',
      'dry skin',
      'constipation'
    ];
    
    console.log('Checking symptom availability:\n');
    const missing = [];
    needed.forEach(n => {
      const exists = names.includes(n.toLowerCase());
      console.log(`  ${exists ? '✓' : '✗'} ${n}`);
      if (!exists) missing.push(n);
    });
    
    if (missing.length > 0) {
      console.log('\nMissing symptoms that need to be added:');
      missing.forEach(m => console.log(`  - ${m}`));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSymptoms();
