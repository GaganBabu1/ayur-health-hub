const mongoose = require('mongoose');

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ayur-health');
    console.log('Connected to MongoDB\n');

    const Symptom = require('./src/models/Symptom');
    const Disease = require('./src/models/Disease');
    const Treatment = require('./src/models/Treatment');
    const User = require('./src/models/User');
    const Consultation = require('./src/models/Consultation');

    const counts = {
      symptoms: await Symptom.countDocuments(),
      diseases: await Disease.countDocuments(),
      treatments: await Treatment.countDocuments(),
      users: await User.countDocuments(),
      consultations: await Consultation.countDocuments(),
    };

    console.log('=== DATABASE CONTENT ===');
    console.log(`Symptoms: ${counts.symptoms}`);
    console.log(`Diseases: ${counts.diseases}`);
    console.log(`Treatments: ${counts.treatments}`);
    console.log(`Users: ${counts.users}`);
    console.log(`Consultations: ${counts.consultations}`);

    // Show sample data
    console.log('\n=== SAMPLE DATA ===');
    const sampleSymptom = await Symptom.findOne();
    console.log('Sample Symptom:', sampleSymptom?.name);

    const sampleDisease = await Disease.findOne();
    console.log('Sample Disease:', sampleDisease?.name);

    const sampleTreatment = await Treatment.findOne();
    console.log('Sample Treatment:', sampleTreatment?._id ? 'Found' : 'None');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
