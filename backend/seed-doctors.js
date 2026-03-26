const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ayur_health');
    console.log('Connected to MongoDB');

    // Clear existing doctors
    await User.deleteMany({ role: 'doctor' });
    console.log('Cleared existing doctors');

    // Seed new doctors
    const doctors = [
      {
        name: 'Dr. Sharma',
        email: 'sharma@ayurhealth.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'Ayurvedic Physician',
        experience: 15,
        rating: 4.8,
      },
      {
        name: 'Dr. Patel',
        email: 'patel@ayurhealth.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'Holistic Health',
        experience: 12,
        rating: 4.7,
      },
      {
        name: 'Dr. Kumar',
        email: 'kumar@ayurhealth.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'Digestive Health',
        experience: 10,
        rating: 4.9,
      },
      {
        name: 'Dr. Singh',
        email: 'singh@ayurhealth.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'Mental Wellness',
        experience: 8,
        rating: 4.6,
      },
      {
        name: 'Dr. Gupta',
        email: 'gupta@ayurhealth.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'General Practice',
        experience: 20,
        rating: 4.5,
      },
    ];

    const createdDoctors = await User.insertMany(doctors);
    console.log(`Seeded ${createdDoctors.length} doctors successfully`);
    createdDoctors.forEach(doc => {
      console.log(`- ${doc.name} (${doc.specialization})`);
    });

    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
};

seedDoctors();
