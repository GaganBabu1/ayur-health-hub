/**
 * Simple way to check if data is in MongoDB
 * by testing with the API
 */

const API = 'http://localhost:5000/api';

async function checkDatabase() {
  console.log('\n🔍 CHECKING IF DATA EXISTS IN MONGODB\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Try to signup
    console.log('\n1️⃣  Testing Signup (to add data to MongoDB)...\n');
    
    const email = `rajesh.kumar${Date.now()}@example.com`;
    const signupRes = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rajesh Kumar',
        email: email,
        password: 'SecurePass123!',
      }),
    });

    const signupData = await signupRes.json();

    if (signupRes.ok) {
      console.log('✅ SIGNUP SUCCESSFUL\n');
      console.log('User created in MongoDB:');
      console.log(`  Name: ${signupData.user.name}`);
      console.log(`  Email: ${signupData.user.email}`);
      console.log(`  User ID: ${signupData.user._id}`);
      console.log(`  Role: ${signupData.user.role}`);
      console.log(`  Token: ${signupData.token.substring(0, 30)}...\n`);

      console.log('═'.repeat(60));
      console.log('\n✅ DATA IS NOW IN MONGODB!\n');
      console.log('To view in MongoDB Compass:\n');
      console.log('1. Open MongoDB Compass');
      console.log('2. Click "Connect"');
      console.log('3. Look for database: ayurhealth');
      console.log('4. Open the "users" collection');
      console.log('5. You should see:');
      console.log(`   - Name: Rajesh Kumar`);
      console.log(`   - Email: ${email}`);
      console.log(`   - Role: patient`);
      console.log(`   - _id: ${signupData.user._id}\n`);

      console.log('═'.repeat(60));
      console.log('\nTO TEST THE FULL WORKFLOW:\n');
      console.log('1. Go to http://localhost:8080');
      console.log('2. Click "Sign Up"');
      console.log('3. Enter:');
      console.log('   Name: Rajesh Kumar');
      console.log(`   Email: ${email}`);
      console.log('   Password: SecurePass123!');
      console.log('4. Click "Sign Up"');
      console.log('5. You will be logged in');
      console.log('6. Follow the Testing Guide steps\n');

    } else {
      console.log('❌ SIGNUP FAILED');
      console.log('Error:', signupData.error);
      console.log('\nMake sure:');
      console.log('  1. Backend is running on port 5000');
      console.log('  2. MongoDB is running');
      console.log('  3. Email is unique\n');
    }

    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ CONNECTION ERROR:', error.message);
    console.log('\nMake sure:');
    console.log('  1. Backend server is running (npm run dev in /backend)');
    console.log('  2. MongoDB is running (mongod)');
    console.log('  3. You can access http://localhost:5000\n');
    process.exit(1);
  }
}

checkDatabase();
