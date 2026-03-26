const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const HealthHistory = require('./src/models/HealthHistory');

const testHealthHistory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ayur_health');
    console.log('Connected to MongoDB');

    // Get a user
    const user = await User.findOne({ role: 'patient' }).limit(1);
    if (!user) {
      console.log('No patient users found. Please create one first.');
      process.exit(0);
    }

    console.log(`Testing with user: ${user.name} (${user._id})`);

    // Create a health entry
    const healthEntry = new HealthHistory({
      userId: user._id,
      weight: 70,
      activityLevel: 'moderate',
      sleepQuality: 7,
      chronicConditions: ['Test Condition'],
      notes: 'Test entry',
      date: new Date(),
    });

    const saved = await healthEntry.save();
    console.log('✅ Health entry saved:', saved);

    // Fetch all health entries for this user
    const entries = await HealthHistory.find({ userId: user._id }).sort({ date: -1 });
    console.log(`\n✅ Found ${entries.length} health entries for this user:`);
    entries.forEach((entry, idx) => {
      console.log(`  ${idx + 1}. ${entry.date.toISOString()} - Weight: ${entry.weight}kg, Sleep: ${entry.sleepQuality}/10`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testHealthHistory();
