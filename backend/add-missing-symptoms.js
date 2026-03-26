const mongoose = require('mongoose');
const Symptom = require('./src/models/Symptom');

async function addMissingSymptoms() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ayur-health');
    console.log('Connected to MongoDB\n');

    const missingSymptoms = [
      { name: 'Fatigue and weakness', category: 'General' },
      { name: 'Weight gain', category: 'Metabolic' },
      { name: 'Cold sensitivity', category: 'General' },
      { name: 'Hair loss', category: 'Dermatological' },
      { name: 'Dry skin', category: 'Dermatological' },
    ];

    console.log('Adding missing symptoms...');
    const created = await Symptom.insertMany(missingSymptoms);
    
    console.log(`✓ Added ${created.length} symptoms:\n`);
    created.forEach(s => {
      console.log(`  - ${s.name} (${s.category})`);
    });

    await mongoose.disconnect();
    console.log('\n✓ Complete! You can now add the Hypothyroidism disease.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addMissingSymptoms();
