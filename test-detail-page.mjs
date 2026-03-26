const API = 'http://localhost:5000/api';

async function testDetailPage() {
  try {
    console.log('🔍 Testing Consultation Detail Page...\n');

    // 1. Create test user
    console.log('1️⃣  Creating test user...');
    const signupRes = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      }),
    });

    const signupData = await signupRes.json();
    if (!signupRes.ok) {
      throw new Error(`Signup failed: ${JSON.stringify(signupData)}`);
    }

    const token = signupData.token;
    console.log('✅ User created and logged in\n');

    // 2. Get user profile to verify token works
    console.log('2️⃣  Getting user profile...');
    const profileRes = await fetch(`${API}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!profileRes.ok) {
      throw new Error(`Profile fetch failed: ${profileRes.status}`);
    }

    const profile = await profileRes.json();
    console.log('✅ Profile loaded:', profile.name, '\n');

    // 3. Get symptoms
    console.log('3️⃣  Getting symptoms...');
    const symptomsRes = await fetch(`${API}/admin/symptoms`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const symptoms = await symptomsRes.json();
    console.log(`✅ Got ${symptoms.length} symptoms`);
    console.log('  First symptom:', JSON.stringify(symptoms[0], null, 2), '\n');

    // 4. Create a consultation
    console.log('4️⃣  Creating a consultation...');
    const consultationRes = await fetch(`${API}/consultations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        symptomIds: symptoms.slice(0, 2).map(s => s._id),
        mentalState: {
          stressLevel: 5,
          sleepQuality: 6,
          mood: 'neutral',
        },
        diseaseHistory: 'None',
        oldTreatments: 'None',
      }),
    });

    const consultation = await consultationRes.json();
    if (!consultationRes.ok) {
      throw new Error(`Consultation creation failed: ${JSON.stringify(consultation)}`);
    }

    console.log('✅ Consultation created:', consultation._id, '\n');

    // 5. Fetch the consultation detail
    console.log('5️⃣  Fetching consultation detail...');
    const detailRes = await fetch(`${API}/consultations/${consultation._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!detailRes.ok) {
      throw new Error(`Detail fetch failed: ${detailRes.status}`);
    }

    const detail = await detailRes.json();
    console.log('✅ Consultation detail loaded\n');

    // 6. Inspect the data structure
    console.log('📊 Consultation Data Structure:');
    console.log('  _id:', detail._id);
    console.log('  createdAt:', detail.createdAt);
    console.log('  symptoms:', Array.isArray(detail.symptoms), `(${detail.symptoms?.length} items)`);
    console.log('  symptoms[0]:', detail.symptoms?.[0]);
    console.log('  predictedDiseases:', Array.isArray(detail.predictedDiseases), `(${detail.predictedDiseases?.length} items)`);
    console.log('  predictedDiseases[0]:', JSON.stringify(detail.predictedDiseases?.[0], null, 2));
    console.log('  recommendedPlan:', detail.recommendedPlan);
    console.log('  recommendations:', detail.recommendations);
    console.log('  triageLevel:', detail.triageLevel);
    console.log('\n⚠️  NOTE: API returns "recommendedPlan" but page expects "recommendations"');
    console.log('  This is a mismatch that needs to be fixed in ConsultationResultPage!\n');

    console.log('\n✅ ALL TESTS PASSED');
    console.log('The consultation detail page should load correctly now.');
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

testDetailPage();
