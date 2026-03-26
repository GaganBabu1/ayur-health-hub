const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ayur-health');
    console.log('Connected to MongoDB\n');

    const Symptom = require('./src/models/Symptom');
    const Disease = require('./src/models/Disease');

    // Load datasets
    const symptomsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/datasets/symptoms.json'), 'utf8'));
    const diseasesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/datasets/diseases.json'), 'utf8'));

    // Clear existing data
    console.log('Clearing existing data...');
    await Symptom.deleteMany({});
    await Disease.deleteMany({});
    console.log('✓ Cleared old data\n');

    // Insert symptoms (remove _id field to let MongoDB generate ObjectIds)
    console.log('Loading symptoms...');
    const symptomsToInsert = symptomsData.map(s => {
      const { _id, ...rest } = s;
      return rest;
    });
    const insertedSymptoms = await Symptom.insertMany(symptomsToInsert);
    console.log(`✓ Inserted ${insertedSymptoms.length} symptoms\n`);

    // Insert diseases (remove _id field and map symptoms to ObjectIds)
    console.log('Loading diseases...');
    const diseasesToInsert = diseasesData.map(d => {
      const { _id, symptoms, ...rest } = d;
      // Map symptom names to actual symptom ObjectIds from inserted symptoms
      const mappedSymptoms = symptoms ? symptoms.map((symptom) => {
        // Handle both string and object symptom formats
        const symptomName = typeof symptom === 'string' ? symptom : (symptom.name || symptom);
        const foundSymptom = insertedSymptoms.find(s => s.name.toLowerCase() === String(symptomName).toLowerCase());
        return foundSymptom ? foundSymptom._id : null;
      }).filter(Boolean) : [];
      return { ...rest, symptoms: mappedSymptoms };
    });
    const insertedDiseases = await Disease.insertMany(diseasesToInsert);
    console.log(`✓ Inserted ${insertedDiseases.length} diseases\n`);

    // Verify
    const symptomCount = await Symptom.countDocuments();
    const diseaseCount = await Disease.countDocuments();

    console.log('=== FINAL COUNTS ===');
    console.log(`Symptoms: ${symptomCount}`);
    console.log(`Diseases: ${diseaseCount}`);

    await mongoose.disconnect();
    console.log('\n✓ Database seeded successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
