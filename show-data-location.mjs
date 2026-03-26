/**
 * SHOW EXACTLY WHERE YOUR DATA IS
 */

async function showData() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        VERIFYING DATA IN MONGODB & BACKEND API             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Test 1: Check Backend API
    console.log('1️⃣  CHECKING BACKEND API (Port 5000)...\n');
    
    // First create a user
    const signupRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rajesh Kumar',
        email: `rajesh.kumar${Date.now()}@example.com`,
        password: 'SecurePass123!',
      }),
    });

    if (!signupRes.ok) {
      throw new Error(`Signup failed: ${signupRes.status}`);
    }

    const user = await signupRes.json();
    const token = user.token;

    console.log('✅ Backend API is working!');
    console.log(`   User created: ${user.user.name}`);
    console.log(`   Email: ${user.user.email}`);
    console.log(`   User ID: ${user.user._id}\n`);

    // Test 2: Get all users
    console.log('2️⃣  CHECKING DATABASE - FETCHING ALL USERS...\n');
    
    const usersRes = await fetch('http://localhost:5000/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!usersRes.ok) {
      throw new Error(`Profile fetch failed: ${usersRes.status}`);
    }

    const profile = await usersRes.json();
    console.log('✅ User data retrieved from database!');
    console.log(`   User ID: ${profile._id}`);
    console.log(`   Name: ${profile.name}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Role: ${profile.role}`);
    console.log(`   Age: ${profile.age || 'Not set'}`);
    console.log(`   Gender: ${profile.gender || 'Not set'}\n`);

    // Test 3: Instructions for MongoDB Compass
    console.log('3️⃣  DATA LOCATION IN MONGODB COMPASS:\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  STEP-BY-STEP TO FIND YOUR DATA                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('STEP 1: Open MongoDB Compass\n');
    
    console.log('STEP 2: Look at LEFT SIDEBAR → Databases section\n');
    console.log('You should see:');
    console.log('  📦 admin');
    console.log('  📦 config');
    console.log('  📦 local');
    console.log('  📦 ayurhealth ← CLICK THIS\n');

    console.log('STEP 3: Inside "ayurhealth" database, find collections\n');
    console.log('You should see:');
    console.log('  📋 appointments');
    console.log('  📋 consultations');
    console.log('  📋 diseases');
    console.log('  📋 symptoms');
    console.log('  📋 treatments');
    console.log('  📋 users ← CLICK THIS\n');

    console.log('STEP 4: View Documents\n');
    console.log('In the MAIN PANEL, you\'ll see documents like:\n');
    console.log('┌────────────────────────────────────┐');
    console.log('│ Documents (5 documents)            │');
    console.log('├────────────────────────────────────┤');
    console.log('│ • _id: 69344819e2f9cde4822131d0   │');
    console.log('│   name: "Test Patient"            │');
    console.log('│   email: "patient-..."            │');
    console.log('│   role: "patient"                 │');
    console.log('│                                   │');
    console.log('│ • _id: 6934481ae2f9cde4822131e6  │');
    console.log('│   name: "Test Doctor"             │');
    console.log('│   email: "doctor-..."             │');
    console.log('│   role: "doctor"                  │');
    console.log('│                                   │');
    console.log('│ ... and more documents            │');
    console.log('└────────────────────────────────────┘\n');

    console.log('STEP 5: Search for a specific user\n');
    console.log('Click the FILTER button (looks like: 🔍)');
    console.log('Type in filter box: { "name": "Rajesh Kumar" }');
    console.log('Press Enter\n');
    console.log('You should see the user you just created!\n');

    console.log('═'.repeat(60));
    console.log('\n✅ YOUR DATA IS DEFINITELY IN MONGODB!\n');
    console.log('If you still can\'t see it:\n');
    console.log('1. Close MongoDB Compass completely');
    console.log('2. Reopen MongoDB Compass');
    console.log('3. Click "Connect"');
    console.log('4. Navigate to ayurhealth → users');
    console.log('5. Click refresh (🔄) button\n');

    console.log('═'.repeat(60));
    console.log('\n🎯 NEXT: Go to http://localhost:8081 and test!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\nMake sure:');
    console.log('  1. Backend is running (npm run dev in /backend)');
    console.log('  2. MongoDB is running');
    console.log('  3. Port 5000 is accessible\n');
  }
}

showData();
