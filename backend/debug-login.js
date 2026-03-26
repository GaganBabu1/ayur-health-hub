const mongoose = require('mongoose');
const User = require('./src/models/User');

async function debugLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ayur-health');
    console.log('Connected to MongoDB\n');

    const email = 'sharma@ayurhealth.com';
    const password = 'password123';

    console.log('Step 1: Finding user...');
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log(`  User found: ${user ? 'YES' : 'NO'}`);
    
    if (!user) {
      console.log('  Looking for all users with role doctor:');
      const allDoctors = await User.find({ role: 'doctor' });
      console.log(`  Found ${allDoctors.length} doctors:`);
      allDoctors.forEach(d => console.log(`    - ${d.email}`));
      process.exit(1);
    }

    console.log(`  User: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Email lowercase: ${user.email.toLowerCase()}`);
    console.log(`  Password hash length: ${user.password.length}`);

    console.log('\nStep 2: Comparing password...');
    const isPasswordMatch = await user.matchPassword(password);
    console.log(`  Password match: ${isPasswordMatch}`);

    if (isPasswordMatch) {
      console.log('\n✓ Login should work!');
    } else {
      console.log('\n❌ Password mismatch');
      console.log(`\nTrying alternative approaches...`);
      
      // Try different password formats
      const testPasswords = [
        'password123',
        'PASSWORD123',
        'password123 ',
        ' password123',
      ];
      
      for (const testPwd of testPasswords) {
        const match = await user.matchPassword(testPwd);
        console.log(`  "${testPwd}": ${match}`);
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

debugLogin();
