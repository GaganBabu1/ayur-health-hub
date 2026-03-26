const mongoose = require('mongoose');
const User = require('./src/models/User');

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ayur-health');
    console.log('Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('Admin account already exists');
      await mongoose.disconnect();
      return;
    }

    // Create admin account
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin@123',
      role: 'admin',
    });

    console.log('✓ Admin account created successfully');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Name: ${admin.name}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
