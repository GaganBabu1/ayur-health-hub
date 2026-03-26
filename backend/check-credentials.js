const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const checkCredentials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ayur_health');
    console.log('Connected to MongoDB\n');

    // Get all admins
    const admins = await User.find({ role: 'admin' }).select('name email role');
    console.log('=== ADMIN CREDENTIALS ===');
    if (admins.length > 0) {
      admins.forEach((admin, idx) => {
        console.log(`${idx + 1}. Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Note: Use password "admin@123" or the one you set\n`);
      });
    } else {
      console.log('No admin users found. Creating default admin...\n');
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin@123', salt);
      
      const defaultAdmin = new User({
        name: 'Admin User',
        email: 'admin@ayurhealth.com',
        password: hashedPassword,
        role: 'admin',
      });
      
      await defaultAdmin.save();
      console.log('✅ Created default admin:');
      console.log('   Email: admin@ayurhealth.com');
      console.log('   Password: admin@123\n');
    }

    // Get all doctors
    const doctors = await User.find({ role: 'doctor' }).select('name email specialization experience rating role');
    console.log('=== DOCTOR CREDENTIALS ===');
    if (doctors.length > 0) {
      doctors.forEach((doctor, idx) => {
        console.log(`${idx + 1}. Name: ${doctor.name}`);
        console.log(`   Email: ${doctor.email}`);
        console.log(`   Specialization: ${doctor.specialization}`);
        console.log(`   Experience: ${doctor.experience} years`);
        console.log(`   Rating: ${doctor.rating}/5`);
        console.log(`   Note: Password is "password123"\n`);
      });
    } else {
      console.log('No doctor users found.\n');
    }

    // Get all patients
    const patients = await User.find({ role: 'patient' }).select('name email role');
    console.log('=== PATIENT CREDENTIALS ===');
    if (patients.length > 0) {
      console.log(`Total patients: ${patients.length}`);
      patients.forEach((patient, idx) => {
        console.log(`${idx + 1}. Name: ${patient.name}`);
        console.log(`   Email: ${patient.email}`);
      });
    } else {
      console.log('No patient users found.\n');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkCredentials();
