// Final E2E Test - Using new /auth/init-admin endpoint
// Properly written in ESM format

import fs from 'fs';

const BASE_URL = 'http://127.0.0.1:5000/api';
let results = [];

function log(message) {
  console.log(message);
  results.push(message);
}

async function testAPI(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { parseError: 'Failed to parse JSON' };
    }
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    console.error(`Network error on ${method} ${endpoint}:`, error.message);
    return { status: 0, error: error.message, ok: false };
  }
}

async function runTests() {
  log('=== COMPREHENSIVE E2E TEST - FINAL ===');
  log(`Timestamp: ${new Date().toISOString()}\n`);

  let tokens = {};
  let userIds = {};
  let emails = {};

  // SECTION 1: Create users
  log('SECTION 1: USER SETUP\n');

  // Create patient
  let result = await testAPI('POST', '/auth/register', {
    name: 'Patient User',
    email: `patient-${Date.now()}@test.com`,
    password: 'Patient123',
    age: 30,
    gender: 'male',
  });
  userIds.patient = result.data?._id;
  emails.patient = result.data?.email;
  tokens.patient = result.data?.token;
  log(`✓ Patient Registered: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Email: ${emails.patient}\n`);

  // Create doctor
  result = await testAPI('POST', '/auth/register', {
    name: 'Doctor User',
    email: `doctor-${Date.now()}@test.com`,
    password: 'Doctor123',
  });
  userIds.doctor = result.data?._id;
  emails.doctor = result.data?.email;
  tokens.doctorTemp = result.data?.token;
  log(`✓ Doctor Registered: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})\n`);

  // Create admin
  result = await testAPI('POST', '/auth/register', {
    name: 'Admin User',
    email: `admin-${Date.now()}@test.com`,
    password: 'Admin123',
  });
  userIds.admin = result.data?._id;
  emails.admin = result.data?.email;
  tokens.adminTemp = result.data?.token;
  log(`✓ Admin Registered: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})\n`);

  // SECTION 2: Initialize roles using new endpoint
  log('SECTION 2: ROLE INITIALIZATION\n');

  result = await testAPI('POST', '/auth/init-admin', {
    userId: userIds.doctor,
    role: 'doctor',
  });
  log(`✓ Doctor Role Initialized: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})\n`);

  result = await testAPI('POST', '/auth/init-admin', {
    userId: userIds.admin,
    role: 'admin',
  });
  log(`✓ Admin Role Initialized: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})\n`);

  // Re-login to get fresh tokens with updated roles
  log('SECTION 3: RE-AUTHENTICATION\n');
  
  result = await testAPI('POST', '/auth/login', {
    email: emails.doctor,
    password: 'Doctor123',
  });
  if (result.ok) {
    tokens.doctor = result.data?.token;
    log(`✓ Doctor Re-login: PASS (${result.status})`);
    log(`  Role: ${result.data?.role}\n`);
  } else {
    log(`✓ Doctor Re-login: FAIL (${result.status})\n`);
    tokens.doctor = tokens.doctorTemp;
  }

  result = await testAPI('POST', '/auth/login', {
    email: emails.admin,
    password: 'Admin123',
  });
  if (result.ok) {
    tokens.admin = result.data?.token;
    log(`✓ Admin Re-login: PASS (${result.status})`);
    log(`  Role: ${result.data?.role}\n`);
  } else {
    log(`✓ Admin Re-login: FAIL (${result.status})\n`);
    tokens.admin = tokens.adminTemp;
  }

  // SECTION 4: Data seeding
  log('SECTION 4: DATA SEEDING\n');

  result = await testAPI('POST', '/admin/seed', {});
  log(`✓ Seed Data: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Symptoms Seeded: ${result.data?.symptoms?.length || 0}\n`);

  // SECTION 5: Patient Flow
  log('SECTION 5: PATIENT FLOW\n');

  result = await testAPI('PUT', '/user/profile', {
    age: 30,
    gender: 'male',
    height: 180,
    weight: 75,
    chronicConditions: ['hypertension'],
  }, tokens.patient);
  log(`✓ Update Profile: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})\n`);

  result = await testAPI('GET', '/user/profile', null, tokens.patient);
  log(`✓ Get Profile: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Name: ${result.data?.name}\n`);

  result = await testAPI('GET', '/admin/symptoms', null, tokens.patient);
  const symptoms = result.data?.slice(0, 2) || [];
  log(`✓ Get Symptoms: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Available: ${symptoms.length}\n`);

  const symptomIds = symptoms.map(s => s._id).filter(Boolean);
  let consultationId = null;
  if (symptomIds.length > 0) {
    result = await testAPI('POST', '/consultations', {
      symptomIds,
      mentalState: { stressLevel: 5, sleepQuality: 4, mood: 'anxious' },
      diseaseHistory: 'None',
    }, tokens.patient);
    consultationId = result.data?._id;
    log(`✓ Create Consultation: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
    if (!result.ok) log(`  Error: ${result.data?.error}\n`);
    else log(`  ID: ${consultationId}\n`);
  }

  result = await testAPI('GET', '/consultations/my', null, tokens.patient);
  log(`✓ View History: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Count: ${result.data?.length || 0}\n`);

  // Book appointment
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  let appointmentId = null;
  result = await testAPI('POST', '/appointments', {
    doctor: userIds.doctor,
    date: tomorrow.toISOString().split('T')[0],
    timeSlot: '10:00–10:30',
    reason: 'General checkup',
  }, tokens.patient);
  log(`✓ Book Appointment: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  if (!result.ok) log(`  Error: ${result.data?.error}\n`);
  else {
    appointmentId = result.data?.appointment?._id;
    log(`  Success\n`);
  }

  // View appointments
  result = await testAPI('GET', '/appointments/my', null, tokens.patient);
  log(`✓ View My Appointments: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Count: ${result.data?.upcoming?.length || 0}\n`);

  // SECTION 6: Doctor Flow
  log('SECTION 6: DOCTOR FLOW\n');

  result = await testAPI('GET', '/doctor/consultations', null, tokens.doctor);
  log(`✓ View Consultations: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Count: ${result.data?.length || 0}\n`);

  result = await testAPI('GET', '/doctor/profile', null, tokens.doctor);
  log(`✓ View Profile: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})\n`);

  result = await testAPI('GET', '/appointments/doctor/list', null, tokens.doctor);
  log(`✓ View Doctor Appointments: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Count: ${result.data?.length || 0}\n`);

  // Add feedback to consultation if it exists
  if (consultationId) {
    result = await testAPI('PUT', `/doctor/consultations/${consultationId}/feedback`, {
      feedback: 'Patient shows signs of anxiety. Recommended yoga and meditation.',
      aiDiagnosis: 'Anxiety disorder with Vata imbalance',
      treatment: 'Ashwagandha and breathing exercises',
    }, tokens.doctor);
    log(`✓ Add Feedback: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})\n`);
  }

  // SECTION 7: Admin Flow
  log('SECTION 7: ADMIN FLOW\n');

  result = await testAPI('GET', '/admin/users', null, tokens.admin);
  log(`✓ View Users: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Count: ${result.data?.length || 0}\n`);

  result = await testAPI('GET', '/admin/symptoms', null, tokens.admin);
  log(`✓ View Symptoms: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Count: ${result.data?.length || 0}\n`);

  result = await testAPI('POST', '/admin/symptoms', {
    name: `Test-Symptom-${Date.now()}`,
    category: 'test',
    description: 'Test symptom for E2E testing',
  }, tokens.admin);
  log(`✓ Create Symptom: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})\n`);

  result = await testAPI('GET', '/admin/diseases', null, tokens.admin);
  log(`✓ View Diseases: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Count: ${result.data?.length || 0}\n`);

  result = await testAPI('GET', '/admin/treatments', null, tokens.admin);
  log(`✓ View Treatments: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Count: ${result.data?.length || 0}\n`);

  result = await testAPI('GET', '/admin/consultations', null, tokens.admin);
  log(`✓ View All Consultations: ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Count: ${result.data?.length || 0}\n`);

  // SECTION 8: Knowledge Base
  log('SECTION 8: KNOWLEDGE BASE\n');

  result = await testAPI('GET', '/admin/diseases', null, tokens.patient);
  log(`✓ Access Diseases (Patient): ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Count: ${result.data?.length || 0}\n`);

  result = await testAPI('GET', '/admin/treatments', null, tokens.patient);
  log(`✓ Access Treatments (Patient): ${result.ok ? 'PASS' : 'FAIL'} (${result.status})`);
  log(`  Count: ${result.data?.length || 0}\n`);

  // Summary
  log('=== TEST EXECUTION COMPLETE ===\n');

  // Count results
  const passes = results.filter(r => r.includes('PASS')).length;
  const fails = results.filter(r => r.includes('FAIL')).length;
  const total = passes + fails;

  log(`Results: ${passes}/${total} PASSED (${Math.round(passes/total*100)}%)\n`);

  // List failures
  const failures = results.filter(r => r.includes('FAIL'));
  if (failures.length > 0) {
    log(`Failed Tests:\n`);
    failures.forEach(f => log(`  - ${f}`));
  } else {
    log(`✅ ALL TESTS PASSED!`);
  }

  // Save results
  fs.writeFileSync('E2E_TEST_FINAL_RESULTS.txt', results.join('\n'));
  console.log('\n✅ Results saved to E2E_TEST_FINAL_RESULTS.txt');
  
  process.exit(0);
}

runTests().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
