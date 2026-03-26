import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const API_URL = 'http://localhost:5000/api';
const MONGO_URI = 'mongodb://localhost:27017/ayurhealth';

// Test credentials
const testUsers = [
  {
    name: 'Test Patient',
    email: 'patient@test.com',
    password: 'Patient123!',
    role: 'patient',
    age: 28
  },
  {
    name: 'Test Doctor',
    email: 'doctor@test.com',
    password: 'Doctor123!',
    role: 'doctor',
    age: 45
  },
  {
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin',
    age: 35
  }
];

async function resetUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get User model
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      age: Number,
      createdAt: { type: Date, default: Date.now }
    });
    const User = mongoose.model('User', userSchema, 'users');

    // Delete all existing users
    console.log('\n🗑️  Deleting all existing users...');
    const deleteResult = await User.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} users`);

    // Create new test users
    console.log('\n➕ Creating new test accounts...\n');

    for (const userData of testUsers) {
      try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const newUser = new User({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          age: userData.age
        });

        await newUser.save();

        console.log(`✅ Created ${userData.role.toUpperCase()}`);
        console.log(`   Email: ${userData.email}`);
        console.log(`   Password: ${userData.password}`);
        console.log(`   ID: ${newUser._id}\n`);
      } catch (error) {
        console.error(`❌ Error creating ${userData.role}:`, error.message);
      }
    }

    console.log('═══════════════════════════════════════════');
    console.log('✅ DATABASE RESET COMPLETE!');
    console.log('═══════════════════════════════════════════');
    console.log('\n📋 TEST ACCOUNTS READY:\n');
    
    testUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}\n`);
    });

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetUsers();
