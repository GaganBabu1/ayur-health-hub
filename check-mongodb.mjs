/**
 * Check MongoDB for user data
 * This will show you what's actually stored in the database
 */

import mongoose from 'mongoose';

async function checkMongoDB() {
  console.log('\n🔍 CHECKING MONGODB FOR USER DATA\n');
  console.log('═'.repeat(60));

  try {
    // Connect to MongoDB
    console.log('\n1️⃣  Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/ayurhealth');
    console.log('✅ Connected to ayurhealth database\n');

    // Get all users
    console.log('2️⃣  Fetching all users...\n');
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).toArray();

    if (users.length === 0) {
      console.log('⚠️  NO USERS FOUND IN DATABASE\n');
      console.log('This means:');
      console.log('  • No one has signed up yet');
      console.log('  • OR the database was reset');
      console.log('  • OR you\'re using a different database\n');
    } else {
      console.log(`✅ Found ${users.length} user(s) in database:\n`);
      
      users.forEach((user, idx) => {
        console.log(`USER #${idx + 1}:`);
        console.log(`  _id: ${user._id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Created: ${user.createdAt}`);
        console.log(`  Password Hash: ${user.password.substring(0, 20)}...`);
        console.log();
      });

      // Check if Rajesh Kumar exists
      const rajesh = users.find(u => u.name === 'Rajesh Kumar');
      if (rajesh) {
        console.log('✅ Rajesh Kumar FOUND in database!');
        console.log(`   Email: ${rajesh.email}`);
      } else {
        console.log('❌ Rajesh Kumar NOT FOUND in database');
        console.log('   You need to sign up first!\n');
      }
    }

    // Check MongoDB Compass connection info
    console.log('\n3️⃣  MongoDB Connection Details:\n');
    console.log('MongoDB URI: mongodb://localhost:27017/ayurhealth');
    console.log('Database: ayurhealth');
    console.log('Collection: users');
    console.log('\n');

    console.log('═'.repeat(60));
    console.log('\nTO VIEW IN MONGODB COMPASS:\n');
    console.log('1. Open MongoDB Compass');
    console.log('2. Click "Connect"');
    console.log('3. Navigate to:');
    console.log('   Database: ayurhealth');
    console.log('   Collection: users');
    console.log('4. You should see all registered users\n');

    console.log('IF YOU DON\'T SEE RAJESH KUMAR:\n');
    console.log('1. Go to http://localhost:8080');
    console.log('2. Click "Sign Up"');
    console.log('3. Fill in:');
    console.log('   Name: Rajesh Kumar');
    console.log('   Email: rajesh.kumar@example.com');
    console.log('   Password: SecurePass123!');
    console.log('4. Click Sign Up');
    console.log('5. Then check MongoDB Compass again\n');

    await mongoose.disconnect();
    console.log('✅ MongoDB check complete\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\nMake sure:');
    console.log('  1. MongoDB is running');
    console.log('  2. Backend server is running (port 5000)');
    console.log('  3. Database name is "ayurhealth"\n');
    process.exit(1);
  }
}

checkMongoDB();
