const API = 'http://localhost:5000/api';

async function testFullFlow() {
  try {
    console.log('\n🧪 FULL END-TO-END TEST\n');
    console.log('═'.repeat(60));

    // 1. SIGNUP
    console.log('\n1️⃣  SIGNUP');
    const signupRes = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Test Patient ${Date.now()}`,
        email: `patient-${Date.now()}@example.com`,
        password: 'password123',
      }),
    });

    if (!signupRes.ok) {
      throw new Error(`Signup failed: ${signupRes.status}`);
    }

    const { token, user } = await signupRes.json();
    console.log(`✅ Signed up as: ${user.name}`);

    // 2. GET PROFILE
    console.log('\n2️⃣  GET PROFILE');
    const profileRes = await fetch(`${API}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!profileRes.ok) {
      throw new Error(`Profile fetch failed: ${profileRes.status}`);
    }

    const profile = await profileRes.json();
    console.log(`✅ Profile loaded: ${profile.name}`);

    // 3. GET SYMPTOMS
    console.log('\n3️⃣  GET SYMPTOMS');
    const symptomsRes = await fetch(`${API}/admin/symptoms`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const symptoms = await symptomsRes.json();
    console.log(`✅ Got ${symptoms.length} symptoms`);

    // 4. CREATE CONSULTATION
    console.log('\n4️⃣  CREATE CONSULTATION');
    const consultationRes = await fetch(`${API}/consultations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        symptomIds: symptoms.slice(0, 3).map(s => s._id),
        mentalState: {
          stressLevel: 7,
          sleepQuality: 5,
          mood: 'anxious',
        },
        diseaseHistory: 'No previous diseases',
        oldTreatments: 'No previous treatments',
      }),
    });

    if (!consultationRes.ok) {
      throw new Error(`Consultation creation failed: ${consultationRes.status}`);
    }

    const consultation = await consultationRes.json();
    const consultationId = consultation._id;
    console.log(`✅ Created consultation: ${consultationId}`);

    // 5. GET CONSULTATION HISTORY
    console.log('\n5️⃣  GET CONSULTATION HISTORY');
    const historyRes = await fetch(`${API}/consultations/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!historyRes.ok) {
      throw new Error(`History fetch failed: ${historyRes.status}`);
    }

    const history = await historyRes.json();
    console.log(`✅ Got consultation history: ${history.length} consultations`);

    // 6. GET CONSULTATION DETAILS
    console.log('\n6️⃣  GET CONSULTATION DETAILS');
    const detailRes = await fetch(`${API}/consultations/${consultationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!detailRes.ok) {
      throw new Error(`Detail fetch failed: ${detailRes.status}`);
    }

    const detail = await detailRes.json();
    console.log(`✅ Loaded consultation details`);

    // 7. VALIDATE DETAIL DATA STRUCTURE
    console.log('\n7️⃣  VALIDATE DETAIL PAGE DATA');
    const errors = [];

    // Check required fields
    if (!detail._id) errors.push('Missing _id');
    if (!detail.createdAt) errors.push('Missing createdAt');
    if (!Array.isArray(detail.symptoms)) errors.push('symptoms is not an array');
    if (!Array.isArray(detail.predictedDiseases)) errors.push('predictedDiseases is not an array');
    if (!detail.recommendedPlan) errors.push('Missing recommendedPlan');
    if (!Array.isArray(detail.recommendedPlan?.herbs)) errors.push('recommendedPlan.herbs is not an array');
    if (!Array.isArray(detail.recommendedPlan?.diet)) errors.push('recommendedPlan.diet is not an array');
    if (!Array.isArray(detail.recommendedPlan?.lifestyle)) errors.push('recommendedPlan.lifestyle is not an array');
    if (!detail.triageLevel) errors.push('Missing triageLevel');

    // Check that old field names don't exist (to ensure we updated correctly)
    if (detail.recommendations) errors.push('❌ FOUND OLD FIELD: recommendations (should use recommendedPlan)');

    if (errors.length > 0) {
      console.log('❌ DATA VALIDATION FAILED:');
      errors.forEach(err => console.log(`  - ${err}`));
      throw new Error('Data structure validation failed');
    }

    console.log('✅ All required fields present');
    console.log(`   - Symptoms: ${detail.symptoms.length}`);
    console.log(`   - Predicted Diseases: ${detail.predictedDiseases.length}`);
    console.log(`   - Herbs: ${detail.recommendedPlan.herbs.length}`);
    console.log(`   - Diet items: ${detail.recommendedPlan.diet.length}`);
    console.log(`   - Lifestyle items: ${detail.recommendedPlan.lifestyle.length}`);
    console.log(`   - Triage Level: ${detail.triageLevel}`);

    // 8. SIMULATE FRONTEND RENDERING
    console.log('\n8️⃣  SIMULATE FRONTEND RENDERING');
    console.log('\nConsultation Details View:');
    console.log('┌─ Header');
    console.log(`│  Date: ${detail.createdAt.split('T')[0]}`);
    console.log(`│  Status: ${detail.triageLevel}`);
    console.log('├─ Symptoms');
    detail.symptoms.forEach((s, i) => {
      const name = typeof s === 'string' ? s : s.name;
      console.log(`│  ${i + 1}. ${name}`);
    });
    console.log('├─ AI Analysis');
    detail.predictedDiseases.slice(0, 2).forEach((d, i) => {
      console.log(`│  ${i + 1}. ${d.name} (${Math.round(d.confidence * 100)}%)`);
    });
    console.log('├─ Herbal Recommendations');
    detail.recommendedPlan.herbs.slice(0, 3).forEach((h, i) => {
      console.log(`│  ${i + 1}. ${h}`);
    });
    console.log('├─ Diet Recommendations');
    detail.recommendedPlan.diet.slice(0, 2).forEach((d, i) => {
      console.log(`│  ${i + 1}. ${d}`);
    });
    console.log('├─ Lifestyle Recommendations');
    detail.recommendedPlan.lifestyle.slice(0, 2).forEach((l, i) => {
      console.log(`│  ${i + 1}. ${l}`);
    });
    console.log('└─ [Print] [Share] [New Consultation] [Dashboard]');

    console.log('\n═'.repeat(60));
    console.log('\n✅ ALL TESTS PASSED!\n');
    console.log('Summary:');
    console.log(`  ✓ Signup works`);
    console.log(`  ✓ Profile fetching works`);
    console.log(`  ✓ Symptom retrieval works`);
    console.log(`  ✓ Consultation creation works`);
    console.log(`  ✓ Consultation history works`);
    console.log(`  ✓ Consultation detail page works`);
    console.log(`  ✓ Data structure is correct for frontend rendering`);
    console.log(`\n🎉 The detail page will load correctly now!\n`);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message, '\n');
    process.exit(1);
  }
}

testFullFlow();
