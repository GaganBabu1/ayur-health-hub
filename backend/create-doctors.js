const mongoose = require('mongoose');
const User = require('./src/models/User');

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

async function createDoctors() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ayur-health');
    console.log('Connected to MongoDB');

    // Clear existing doctors
    await User.deleteMany({ role: 'doctor' });
    console.log('Cleared existing doctors');

    // Create new doctors (one by one to trigger pre-save hook for password encryption)
    const created = [];
    for (const doctorData of doctors) {
      const doctor = new User(doctorData);
      await doctor.save();
      created.push(doctor);
      console.log(`  ✓ Created ${doctor.name} (${doctor.email})`);
    }
    console.log(`\nSuccessfully created ${created.length} doctors with encrypted passwords`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createDoctors();
