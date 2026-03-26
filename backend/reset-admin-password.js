const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ayur_health');
    console.log('Connected to MongoDB\n');

    const email = 'admin@test.com';
    const newPassword = 'admin@123';

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Admin user not found');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('Found admin user:', user.name);
    console.log('Resetting password to: admin@123\n');

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password updated successfully!\n');
    console.log('Admin Login Credentials:');
    console.log('Email: admin@test.com');
    console.log('Password: admin@123');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetAdminPassword();
