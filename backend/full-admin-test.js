const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const fullTest = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ayur_health');
    console.log('Connected to MongoDB\n');

    // Step 1: Get the user as it exists in DB
    const user = await User.findOne({ email: 'admin@test.com' });
    console.log('Step 1: User found');
    console.log('  Password hash in DB:', user.password.substring(0, 30) + '...');

    // Step 2: Test direct bcrypt compare
    const testPassword = 'admin@123';
    const directCompare = await bcrypt.compare(testPassword, user.password);
    console.log('\nStep 2: Direct bcrypt.compare result:', directCompare);

    // Step 3: Test using the schema method
    const methodCompare = await user.matchPassword(testPassword);
    console.log('Step 3: Using matchPassword method:', methodCompare);

    // Step 4: Check if pre-save hook is the issue - try saving
    console.log('\nStep 4: Checking if password gets hashed on save...');
    console.log('  Current password (first 30 chars):', user.password.substring(0, 30) + '...');
    
    if (directCompare) {
      console.log('\n✅ SUCCESS! Password is correct and can be compared.');
      console.log('\nYou can now login with:');
      console.log('  Email: admin@test.com');
      console.log('  Password: admin@123');
    } else {
      console.log('\n❌ Password comparison failed. The password hash may be corrupted.');
      console.log('\nTrying to delete and recreate the user...');
      
      await User.deleteOne({ email: 'admin@test.com' });
      
      const newAdmin = new User({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'admin@123', // Will be hashed by pre-save hook
        role: 'admin',
      });
      
      await newAdmin.save();
      console.log('✅ Admin user recreated!');
      
      // Verify the new user
      const recreatedUser = await User.findOne({ email: 'admin@test.com' });
      const verify = await recreatedUser.matchPassword('admin@123');
      console.log('✅ New password verification:', verify);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

fullTest();
