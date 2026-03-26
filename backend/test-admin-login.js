const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const testAdminLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ayur_health');
    console.log('Connected to MongoDB\n');

    const email = 'admin@test.com';
    const password = 'admin@123';

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('✅ User found:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password hash: ${user.password.substring(0, 20)}...\n`);

    // Test password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`Password verification result: ${isPasswordValid}`);
    
    if (isPasswordValid) {
      console.log('✅ Password is CORRECT\n');
    } else {
      console.log('❌ Password is INCORRECT\n');
      console.log('Trying to hash the password again to verify...');
      const testHash = await bcrypt.hash(password, 10);
      console.log(`Test hash: ${testHash}`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testAdminLogin();
