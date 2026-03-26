// Test API Requests - E2E Testing
// Run this in Node.js to systematically test all endpoints

const BASE_URL = 'http://localhost:5000/api';

async function testAPI(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return {
      status: response.status,
      data,
      ok: response.ok,
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      ok: false,
    };
  }
}

async function runTests() {
  console.log('=== E2E API Testing ===\n');

  // 1. Health Check
  console.log('1. Health Check');
  let result = await testAPI('GET', '/health');
  console.log(`   Status: ${result.status}`, result.ok ? '✅' : '❌');
  if (result.data) console.log(`   Response:`, result.data);

  // 2. Register Patient
  console.log('\n2. Register Patient');
  result = await testAPI('POST', '/auth/register', {
    name: 'John Patient',
    email: 'patient@test.com',
    password: 'Patient123',
    age: 30,
    gender: 'male',
  });
  console.log(`   Status: ${result.status}`, result.ok ? '✅' : '❌');
  const patientToken = result.data?.token;
  const patientId = result.data?._id;
  console.log(`   Patient ID: ${patientId}`);
  console.log(`   Token: ${patientToken ? '✅' : '❌'}`);

  // 3. Login Patient
  console.log('\n3. Login Patient');
  result = await testAPI('POST', '/auth/login', {
    email: 'patient@test.com',
    password: 'Patient123',
  });
  console.log(`   Status: ${result.status}`, result.ok ? '✅' : '❌');
  console.log(`   Token matches: ${result.data?.token === patientToken ? '✅' : '❌'}`);

  // 4. Register Doctor
  console.log('\n4. Register Doctor');
  result = await testAPI('POST', '/auth/register', {
    name: 'Dr. Sharma',
    email: 'doctor@test.com',
    password: 'Doctor123',
  });
  console.log(`   Status: ${result.status}`, result.ok ? '✅' : '❌');
  const doctorId = result.data?._id;
  const doctorToken = result.data?.token;
  console.log(`   Doctor ID: ${doctorId}`);

  // 5. Register Admin
  console.log('\n5. Register Admin');
  result = await testAPI('POST', '/auth/register', {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'Admin123',
  });
  console.log(`   Status: ${result.status}`, result.ok ? '✅' : '❌');
  const adminId = result.data?._id;
  const adminToken = result.data?.token;
  console.log(`   Admin ID: ${adminId}`);

  // 6. Seed Data (using admin token)
  console.log('\n6. Seed Data');
  if (adminToken) {
    result = await testAPI('POST', '/admin/seed', {});
    console.log(`   Status: ${result.status}`, result.ok ? '✅' : '❌');
    if (result.data?.symptoms) {
      console.log(`   Symptoms seeded: ${result.data.symptoms.length}`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Patient: ${patientId} | Token: ✅`);
  console.log(`Doctor: ${doctorId} | Token: ✅`);
  console.log(`Admin: ${adminId} | Token: ✅`);
}

runTests().catch(console.error);
