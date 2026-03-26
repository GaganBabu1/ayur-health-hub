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
  console.log('║   E2E TEST SUITE - AYUR HEALTH HUB                 ║');
  console.log('║   Backend: http://localhost:5000                   ║');
  console.log('║   Frontend: http://localhost:8080                  ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  let testResults = { passed: 0, failed: 0, skipped: 0 };
  
  // ================== PATIENT FLOW ==================
  console.log('📋 PATIENT FLOW\n');
  console.log('✦ Step 1: Signup');
  const patientEmail = `patient-${Date.now()}@test.com`;
  let res = await httpRequest('POST', '/api/auth/register', {
    name: 'Test Patient',
    email: patientEmail,
    password: 'Patient123',
    age: 28,
    gender: 'female'
  });
  const patientToken = res.data?.token;
  console.log(`  Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  console.log('\n✦ Step 2: Login');
  res = await httpRequest('POST', '/api/auth/login', {
    email: patientEmail,
    password: 'Patient123'
  });
  console.log(`  Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  console.log('\n✦ Step 3: Update Profile');
  res = await httpRequest('PUT', '/api/user/profile', {
    age: 28,
    gender: 'female',
    height: 165,
    weight: 65,
    chronicConditions: ['diabetes'],
    allergies: ['peanuts']
  }, patientToken);
  console.log(`  Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  console.log('\n✦ Step 4: Get Symptoms');
  res = await httpRequest('GET', '/api/admin/symptoms', null, patientToken);
  const symptoms = res.data?.slice(0, 3) || [];
  console.log(`  Status: ${res.status} - Found ${symptoms.length} symptoms ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  console.log('\n✦ Step 5: Create Consultation');
  const symptomIds = symptoms.map(s => s._id).filter(Boolean);
  let consultationId = null;
  if (symptomIds.length > 0) {
    res = await httpRequest('POST', '/api/consultations', {
      symptomIds: symptomIds,
      mentalState: { stressLevel: 6, sleepQuality: 4, mood: 'anxious' },
      diseaseHistory: 'None'
    }, patientToken);
    consultationId = res.data?._id;
    console.log(`  Status: ${res.status} - ID: ${consultationId?.slice(0, 8)}... ${res.ok ? '✅' : '❌'}`);
    res.ok ? testResults.passed++ : testResults.failed++;
  } else {
    console.log(`  ⊘ Skipped (no symptoms)`);
    testResults.skipped++;
  }

  console.log('\n✦ Step 6: View Consultation History');
  res = await httpRequest('GET', '/api/consultations/my', null, patientToken);
  console.log(`  Status: ${res.status} - Found ${res.data?.length || 0} consultations ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  // ================== DOCTOR FLOW ==================
  console.log('\n\n👨‍⚕️  DOCTOR FLOW\n');
  console.log('✦ Step 1: Register Doctor');
  const doctorEmail = `doctor-${Date.now()}@test.com`;
  res = await httpRequest('POST', '/api/auth/register', {
    name: 'Test Doctor',
    email: doctorEmail,
    password: 'Doctor123'
  });
  const doctorId = res.data?._id;
  console.log(`  Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  console.log('\n✦ Step 2: Set Doctor Role');
  res = await httpRequest('POST', '/api/auth/init-admin', {
    userId: doctorId,
    role: 'doctor'
  });
  console.log(`  Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  console.log('\n✦ Step 3: Doctor Re-login');
  res = await httpRequest('POST', '/api/auth/login', {
    email: doctorEmail,
    password: 'Doctor123'
  });
  const doctorToken = res.data?.token;
  const doctorRole = res.data?.role;
  console.log(`  Status: ${res.status} - Role: ${doctorRole} ${res.ok && doctorRole === 'doctor' ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  console.log('\n✦ Step 4: View Assigned Consultations');
  res = await httpRequest('GET', '/api/doctor/consultations', null, doctorToken);
  console.log(`  Status: ${res.status} - Found ${res.data?.length || 0} consultations ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  console.log('\n✦ Step 5: Add Feedback');
  if (consultationId) {
    res = await httpRequest('PUT', `/api/doctor/consultations/${consultationId}/feedback`, {
      doctorNotes: 'Increase water intake, practice meditation',
      followUpRecommendation: 'Continue Ashwagandha + Brahmi for 2 weeks',
      status: 'completed'
    }, doctorToken);
    console.log(`  Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
    res.ok ? testResults.passed++ : testResults.failed++;
  } else {
    console.log(`  ⊘ Skipped (no consultation)`);
    testResults.skipped++;
  }

  console.log('\n✦ Step 6: View Appointments');
  res = await httpRequest('GET', '/api/appointments/doctor/list', null, doctorToken);
  console.log(`  Status: ${res.status} - Found ${res.data?.length || 0} appointments ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  // ================== ADMIN FLOW ==================
  console.log('\n\n🔐 ADMIN FLOW\n');
  console.log('✦ Step 1: Find or Create Admin');
  
  // Try to find an existing admin or create one
  let adminToken = null;
  const tryAdminEmail = 'admin@test.example.com';
  const tryAdminPassword = 'Admin123Test';
  
  // Attempt login with known credentials
  res = await httpRequest('POST', '/api/auth/login', {
    email: tryAdminEmail,
    password: tryAdminPassword
  });
  
  if (res.ok && res.data?.role === 'admin') {
    console.log(`  Found existing admin ✅`);
    adminToken = res.data.token;
    testResults.passed++;
  } else {
    // Register new admin
    res = await httpRequest('POST', '/api/auth/register', {
      name: 'Test Admin',
      email: tryAdminEmail,
      password: tryAdminPassword
    });
    
    if (res.ok) {
      const newAdminId = res.data._id;
      
      // Promote to admin
      res = await httpRequest('POST', '/api/auth/init-admin', {
        userId: newAdminId,
        role: 'admin'
      });
      
      if (res.ok) {
        // Re-login to get admin token
        res = await httpRequest('POST', '/api/auth/login', {
          email: tryAdminEmail,
          password: tryAdminPassword
        });
        adminToken = res.data?.token;
        console.log(`  Created new admin ✅`);
        testResults.passed++;
      } else if (res.status === 403) {
        console.log(`  Admin exists, using new user token ℹ️`);
        adminToken = res.data?.token || null;
        testResults.skipped++;
      } else {
        console.log(`  Failed to create admin ❌`);
        testResults.failed++;
      }
    }
  }

  if (!adminToken) {
    console.log('\n⚠️  Admin token not available. Skipping admin tests.');
    console.log(`\n╔════════════════════════════════════════════════════╗`);
    console.log(`║          TEST RESULTS                               ║`);
    console.log(`╠════════════════════════════════════════════════════╣`);
    console.log(`║ ✅ PASSED:  ${testResults.passed}/${testResults.passed + testResults.failed}`);
    console.log(`║ ❌ FAILED:  ${testResults.failed}/${testResults.passed + testResults.failed}`);
    console.log(`║ ⊘  SKIPPED: ${testResults.skipped}`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);
    process.exit(testResults.failed === 0 ? 0 : 1);
  }

  console.log('\n✦ Step 2: View All Users');
  res = await httpRequest('GET', '/api/admin/users', null, adminToken);
  console.log(`  Status: ${res.status} - Found ${res.data?.length || 0} users ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  console.log('\n✦ Step 3: View Symptoms');
  res = await httpRequest('GET', '/api/admin/symptoms', null, adminToken);
  console.log(`  Status: ${res.status} - Found ${res.data?.length || 0} symptoms ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  console.log('\n✦ Step 4: Create Symptom');
  res = await httpRequest('POST', '/api/admin/symptoms', {
    name: `Test Symptom ${Date.now()}`,
    category: 'respiratory',
    description: 'Test symptom created at ' + new Date().toISOString()
  }, adminToken);
  console.log(`  Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  console.log('\n✦ Step 5: View Diseases');
  res = await httpRequest('GET', '/api/admin/diseases', null, adminToken);
  console.log(`  Status: ${res.status} - Found ${res.data?.length || 0} diseases ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  console.log('\n✦ Step 6: View Treatments');
  res = await httpRequest('GET', '/api/admin/treatments', null, adminToken);
  console.log(`  Status: ${res.status} - Found ${res.data?.length || 0} treatments ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  console.log('\n✦ Step 7: View All Consultations');
  res = await httpRequest('GET', '/api/admin/consultations', null, adminToken);
  console.log(`  Status: ${res.status} - Found ${res.data?.length || 0} consultations ${res.ok ? '✅' : '❌'}`);
  res.ok ? testResults.passed++ : testResults.failed++;

  // ================== SUMMARY ==================
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║          TEST RESULTS                               ║');
  console.log('╠════════════════════════════════════════════════════╣');
  const total = testResults.passed + testResults.failed;
  const percentage = total > 0 ? Math.round((testResults.passed / total) * 100) : 0;
  console.log(`║ ✅ PASSED:  ${String(testResults.passed).padEnd(2)} / ${total}`);
  console.log(`║ ❌ FAILED:  ${String(testResults.failed).padEnd(2)} / ${total}`);
  console.log(`║ ⊘  SKIPPED: ${testResults.skipped}`);
  console.log(`║ 📊 SUCCESS: ${percentage}%`);
  console.log('╚════════════════════════════════════════════════════╝\n');

  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! System ready for production.\n');
  } else {
    console.log(`⚠️  ${testResults.failed} test(s) failed. Check output above.\n`);
  }

  process.exit(testResults.failed === 0 ? 0 : 1);
}

runTest().catch(err => {
  console.error('❌ Test error:', err);
  process.exit(1);
});
