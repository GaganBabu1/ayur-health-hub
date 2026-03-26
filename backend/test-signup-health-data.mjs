import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Test user with health data
const testUser = {
  name: 'Health Test User',
  email: `health-test-${Date.now()}@test.com`,
  password: 'TestPass123!',
  age: 30,
  gender: 'male',
  height: 175,
  weight: 75,
  lifestyle: 'active',
  sleepQuality: 4,
  diseaseHistory: 'No chronic conditions, occasional headaches'
};

async function testSignupWithHealthData() {
  try {
    console.log('🔄 Testing Signup with Health Data...\n');
    console.log('Signup data:', {
      ...testUser,
      password: '***hidden***'
    });

    const signupResponse = await axios.post(`${API_URL}/auth/register`, testUser);
    const signupData = signupResponse.data;
    console.log('\n✅ Signup Successful!\n');

    const { user, token } = signupData;
    console.log('User created:');
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Age: ${user.age}`);
    console.log(`  Gender: ${user.gender}`);
    console.log(`  Height: ${user.height} cm`);
    console.log(`  Weight: ${user.weight} kg`);
    console.log(`  Lifestyle: ${user.lifestyle}`);
    console.log(`  Sleep Quality: ${user.sleepQuality}/5`);
    console.log(`  Medical History: ${user.diseaseHistory}`);
    console.log(`  Token: ${token.substring(0, 20)}...`);

    // Test Profile fetch with token
    console.log('\n🔄 Fetching Profile with Auth Token...\n');
    
    const profileResponse = await axios.get(`${API_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const profileData = profileResponse.data;
    console.log('✅ Profile Retrieved Successfully!\n');
    console.log('Profile data:');
    console.log(`  Height: ${profileData.height} cm`);
    console.log(`  Weight: ${profileData.weight} kg`);
    console.log(`  Lifestyle: ${profileData.lifestyle}`);
    console.log(`  Sleep Quality: ${profileData.sleepQuality}/5`);
    console.log(`  Medical History: ${profileData.diseaseHistory}`);

    // Verify all fields match
    const allMatch = 
      profileData.height === testUser.height &&
      profileData.weight === testUser.weight &&
      profileData.lifestyle === testUser.lifestyle &&
      profileData.sleepQuality === testUser.sleepQuality &&
      profileData.diseaseHistory === testUser.diseaseHistory;

    if (allMatch) {
      console.log('\n✅ All health data fields match! Perfect!');
    } else {
      console.log('\n⚠️ Some fields do not match:');
      if (profileData.height !== testUser.height) console.log(`   Height: expected ${testUser.height}, got ${profileData.height}`);
      if (profileData.weight !== testUser.weight) console.log(`   Weight: expected ${testUser.weight}, got ${profileData.weight}`);
      if (profileData.lifestyle !== testUser.lifestyle) console.log(`   Lifestyle: expected ${testUser.lifestyle}, got ${profileData.lifestyle}`);
      if (profileData.sleepQuality !== testUser.sleepQuality) console.log(`   Sleep Quality: expected ${testUser.sleepQuality}, got ${profileData.sleepQuality}`);
      if (profileData.diseaseHistory !== testUser.diseaseHistory) console.log(`   Medical History: expected "${testUser.diseaseHistory}", got "${profileData.diseaseHistory}"`);
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════');
    console.log('\nSignup Test Account:');
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: ${testUser.password}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
    process.exit(1);
  }
}

testSignupWithHealthData();
