const mongoose = require('mongoose');
const User = require('./src/models/User');

async function testLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ayur-health');
    console.log('Connected to MongoDB\n');

    // Test with Dr. Sharma
    const email = 'sharma@ayurhealth.com';
    const password = 'password123';

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✓ Found user: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Password hash stored: ${user.password.substring(0, 50)}...`);

    const isPasswordMatch = await user.matchPassword(password);
    console.log(`\nPassword verification: ${isPasswordMatch ? '✓ MATCH' : '❌ NO MATCH'}`);

    if (isPasswordMatch) {
      console.log('\n✓ Login test PASSED - Credentials are correct');
    } else {
      console.log('\n❌ Login test FAILED - Password does not match');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testLogin();
