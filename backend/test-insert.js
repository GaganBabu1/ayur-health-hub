const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const Disease = require('./src/models/Disease');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayur-health-hub';

async function test() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing
    await Disease.deleteMany({});
    console.log('Cleared diseases');
    
    // Load first disease from dataset
    const diseasesData = JSON.parse(fs.readFileSync('./src/datasets/diseases.json'));
    const testDisease = diseasesData[0];
    
    console.log('\nAttempting to insert dataset disease:', JSON.stringify(testDisease).substring(0, 200));
    console.log('Document has _id field?', '_id' in testDisease);
    
    const result = await Disease.insertMany([testDisease]);
    console.log('Insert result length:', result.length);
    if (result.length > 0) {
      console.log('Insert result ID:', result[0]._id);
    }
    
    const count = await Disease.countDocuments();
    console.log('Count after insert:', count);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

test();

