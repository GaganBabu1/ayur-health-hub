const mongoose = require('mongoose');
const Consultation = require('./src/models/Consultation');
require('dotenv').config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get the latest consultation
    const consultation = await Consultation.findOne().sort({ createdAt: -1 });
    
    if (consultation) {
      console.log('Latest consultation:');
      console.log('Predicted diseases:', JSON.stringify(consultation.predictedDiseases, null, 2));
    } else {
      console.log('No consultations found');
    }
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
