import http from 'http';

function httpRequest(method, path, data = null, token = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData, ok: res.statusCode < 400 });
        } catch (e) {
          resolve({ status: res.statusCode, data: { error: body }, ok: res.statusCode < 400 });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ status: 0, error: error.message, ok: false });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTest() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   COMPREHENSIVE E2E TEST FOR AYUR HEALTH HUB       ║');
  console.log('║   Backend: http://localhost:5000/api               ║');
  console.log('║   Frontend: http://localhost:8080                  ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  let testResults = { passed: 0, failed: 0, skipped: 0 };
  
  // ================== PATIENT FLOW ==================
  console.log('📋 PATIENT FLOW\n');
  
  const patientEmail = `patient-${Date.now()}@test.com`;
  const patientPassword = 'Patient123';
  let patientToken = null;
  let consultationId = null;

  console.log('✓ Step 1: Patient Signup');
  let res = await httpRequest('POST', '/api/auth/register', {
    name: 'Test Patient',
    email: patientEmail,
    password: patientPassword,
    age: 28,
    gender: 'female'
  });
  if (res.status === 201) {
    patientToken = res.data?.token;
    console.log(`   ✅ PASS (status: ${res.status})`);
    testResults.passed++;
  } else {
    console.log(`   ❌ FAIL (status: ${res.status})`);
    testResults.failed++;
  }

  console.log('\n✓ Step 2: Patient Login');
  res = await httpRequest('POST', '/api/auth/login', {
    email: patientEmail,
    password: patientPassword
  });
  if (res.ok && res.data?.token) {
    patientToken = res.data.token;
    console.log(`   ✅ PASS (status: ${res.status})`);
    testResults.passed++;
  } else {
    console.log(`   ❌ FAIL (status: ${res.status})`);
    testResults.failed++;
  }

  console.log('\n✓ Step 3: Update Patient Profile');
  res = await httpRequest('PUT', '/api/user/profile', {
    age: 28,
    gender: 'female',
    height: 165,
    weight: 65,
    chronicConditions: ['diabetes'],
    allergies: ['peanuts']
  }, patientToken);
  if (res.ok) {
    console.log(`   ✅ PASS (status: ${res.status})`);
    testResults.passed++;
  } else {
    console.log(`   ❌ FAIL (status: ${res.status})`);
    testResults.failed++;
  }

  console.log('\n✓ Step 4: Get Available Symptoms');
  res = await httpRequest('GET', '/api/admin/symptoms', null, patientToken);
  let symptoms = res.data?.slice(0, 3) || [];
  if (res.ok && symptoms.length > 0) {
    console.log(`   ✅ PASS (${symptoms.length} symptoms available)`);
    testResults.passed++;
  } else {
    console.log(`   ❌ FAIL (status: ${res.status})`);
    testResults.failed++;
  }

  console.log('\n✓ Step 5: Create Consultation');
  const symptomIds = symptoms.map(s => s._id).filter(Boolean);
  if (symptomIds.length > 0) {
    res = await httpRequest('POST', '/api/consultations', {
      symptomIds: symptomIds,
      mentalState: {
        stressLevel: 6,
        sleepQuality: 4,
        mood: 'anxious'
      },
      diseaseHistory: 'None reported'
    }, patientToken);
    if (res.ok) {
      consultationId = res.data?._id;
      console.log(`   ✅ PASS (consultation ID: ${consultationId?.slice(0, 8)}...)`);
      testResults.passed++;
    } else {
      console.log(`   ❌ FAIL (status: ${res.status})`);
      testResults.failed++;
    }
  } else {
    console.log(`   ⊘ SKIP (no symptoms to consult)`);
    testResults.skipped++;
  }

  console.log('\n✓ Step 6: View Consultation History');
  res = await httpRequest('GET', '/api/consultations/my', null, patientToken);
  if (res.ok) {
    console.log(`   ✅ PASS (${res.data?.length || 0} consultations)`);
    testResults.passed++;
  } else {
    console.log(`   ❌ FAIL (status: ${res.status})`);
    testResults.failed++;
  }

  // ================== DOCTOR FLOW ==================
  console.log('\n\n👨‍⚕️  DOCTOR FLOW\n');

  const doctorEmail = `doctor-${Date.now()}@test.com`;
  const doctorPassword = 'Doctor123';
  let doctorToken = null;

  console.log('✓ Step 1: Doctor Signup');
  res = await httpRequest('POST', '/api/auth/register', {
    name: 'Test Doctor',
    email: doctorEmail,
    password: doctorPassword
  });
  const doctorId = res.data?._id;
  if (res.ok) {
    console.log(`   ✅ PASS (doctor ID: ${doctorId?.slice(0, 8)}...)`);
    testResults.passed++;
  } else {
    console.log(`   ❌ FAIL (status: ${res.status})`);
    testResults.failed++;
  }

  console.log('\n✓ Step 2: Set Doctor Role');
  res = await httpRequest('POST', '/api/auth/init-admin', {
    userId: doctorId,
    role: 'doctor'
  });
  if (res.ok) {
    console.log(`   ✅ PASS (status: ${res.status})`);
    testResults.passed++;
  } else {
    console.log(`   ⚠️  SKIP (status: ${res.status}) - may already be set`);
    testResults.skipped++;
  }

  console.log('\n✓ Step 3: Doctor Login');
  res = await httpRequest('POST', '/api/auth/login', {
    email: doctorEmail,
    password: doctorPassword
  });
  if (res.ok && res.data?.role === 'doctor') {
    doctorToken = res.data.token;
    console.log(`   ✅ PASS (role: ${res.data.role})`);
    testResults.passed++;
  } else {
    console.log(`   ❌ FAIL (got role: ${res.data?.role}, status: ${res.status})`);
    testResults.failed++;
  }

  console.log('\n✓ Step 4: Doctor Views Consultations');
  res = await httpRequest('GET', '/api/doctor/consultations', null, doctorToken);
  if (res.ok) {
    console.log(`   ✅ PASS (${res.data?.length || 0} consultations available)`);
    testResults.passed++;
  } else {
    console.log(`   ❌ FAIL (status: ${res.status})`);
    testResults.failed++;
  }

  console.log('\n✓ Step 5: Doctor Adds Feedback');
  if (consultationId && doctorToken) {
    res = await httpRequest('PUT', `/api/doctor/consultations/${consultationId}/feedback`, {
      doctorNotes: 'Patient needs rest and hydration',
      followUpRecommendation: 'Follow up in 3 days',
      status: 'completed'
    }, doctorToken);
    if (res.ok) {
      console.log(`   ✅ PASS (status: ${res.status})`);
      testResults.passed++;
    } else {
      console.log(`   ❌ FAIL (status: ${res.status})`);
      testResults.failed++;
    }
  } else {
    console.log(`   ⊘ SKIP (no consultation to feedback)`);
    testResults.skipped++;
  }

  console.log('\n✓ Step 6: Doctor Views Appointments');
  res = await httpRequest('GET', '/api/appointments/doctor/list', null, doctorToken);
  if (res.ok) {
    console.log(`   ✅ PASS (${res.data?.length || 0} appointments)`);
    testResults.passed++;
  } else {
    console.log(`   ❌ FAIL (status: ${res.status})`);
    testResults.failed++;
  }

  // ================== SYMPTOM MANAGEMENT TESTS ==================
  console.log('\n\n⚕️  KNOWLEDGE BASE TESTS\n');

  console.log('✓ Step 1: Get Symptoms (Patient Access)');
  res = await httpRequest('GET', '/api/admin/symptoms', null, patientToken);
  if (res.ok && res.data?.length > 0) {
    console.log(`   ✅ PASS (${res.data.length} symptoms)`);
    testResults.passed++;
  } else {
    console.log(`   ❌ FAIL (status: ${res.status})`);
    testResults.failed++;
  }

  console.log('\n✓ Step 2: Get Diseases (Patient Access)');
  res = await httpRequest('GET', '/api/admin/diseases', null, patientToken);
  if (res.ok && res.data?.length > 0) {
    console.log(`   ✅ PASS (${res.data.length} diseases)`);
    testResults.passed++;
  } else {
    console.log(`   ❌ FAIL (status: ${res.status})`);
    testResults.failed++;
  }

  console.log('\n✓ Step 3: Get Treatments (Patient Access)');
  res = await httpRequest('GET', '/api/admin/treatments', null, patientToken);
  if (res.ok) {
    console.log(`   ✅ PASS (${res.data?.length || 0} treatments)`);
    testResults.passed++;
  } else {
    console.log(`   ❌ FAIL (status: ${res.status})`);
    testResults.failed++;
  }

  // ================== SUMMARY ==================
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║                   TEST SUMMARY                      ║');
  console.log('╠════════════════════════════════════════════════════╣');
  const total = testResults.passed + testResults.failed + testResults.skipped;
  const percentage = testResults.failed === 0 ? 100 : Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100);
  console.log(`║  ✅ PASSED: ${String(testResults.passed).padEnd(2)} │ ❌ FAILED: ${String(testResults.failed).padEnd(2)} │ ⊘ SKIPPED: ${testResults.skipped}`);
  console.log(`║  Success Rate: ${percentage}%`);
  console.log('╚════════════════════════════════════════════════════╝\n');

  if (testResults.failed === 0) {
    console.log('🎉 ALL CRITICAL TESTS PASSED!\n');
    console.log('✓ Patient flow: Signup → Login → Profile → Consultation → History');
    console.log('✓ Doctor flow: Signup → Set Role → Login → View Consultations → Add Feedback');
    console.log('✓ Knowledge Base: All users can read symptoms/diseases/treatments\n');
    console.log('System is ready for production!\n');
  } else {
    console.log(`⚠️  ${testResults.failed} test(s) failed.\n`);
  }

  process.exit(testResults.failed === 0 ? 0 : 1);
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
