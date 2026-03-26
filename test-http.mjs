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
  console.log('=== API TEST ===\n');

  // Test 1: Health
  console.log('1️⃣ Health Check');
  let res = await httpRequest('GET', '/api/health');
  console.log(`   Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
  
  if (!res.ok) {
    console.log('\n❌ Backend not responding! Make sure: node backend/src/server.js is running');
    process.exit(1);
  }

  // Test 2: Register Patient
  console.log('\n2️⃣ Register Patient');
  const patientEmail = `patient-${Date.now()}@test.com`;
  res = await httpRequest('POST', '/api/auth/register', {
    name: 'Patient',
    email: patientEmail,
    password: 'Pass123',
    age: 30,
    gender: 'male'
  });
  const patientId = res.data?._id;
  const patientToken = res.data?.token;
  console.log(`   Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
  console.log(`   ID: ${patientId?.slice(0, 8)}...`);

  // Test 3: Register Doctor
  console.log('\n3️⃣ Register Doctor');
  const doctorEmail = `doctor-${Date.now()}@test.com`;
  res = await httpRequest('POST', '/api/auth/register', {
    name: 'Doctor',
    email: doctorEmail,
    password: 'Pass123'
  });
  const doctorId = res.data?._id;
  console.log(`   Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
  console.log(`   ID: ${doctorId?.slice(0, 8)}...`);

  // Test 4: Register Admin
  console.log('\n4️⃣ Register Admin');
  const adminEmail = `admin-${Date.now()}@test.com`;
  res = await httpRequest('POST', '/api/auth/register', {
    name: 'Admin',
    email: adminEmail,
    password: 'Pass123'
  });
  const adminId = res.data?._id;
  console.log(`   Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
  console.log(`   ID: ${adminId?.slice(0, 8)}...`);

  // Test 5: Set Doctor Role
  console.log('\n5️⃣ Initialize Doctor Role');
  res = await httpRequest('POST', '/api/auth/init-admin', {
    userId: doctorId,
    role: 'doctor'
  });
  console.log(`   Status: ${res.status} ${res.ok ? '✅' : '❌'}`);

  // Test 6: Set Admin Role
  console.log('\n6️⃣ Initialize Admin Role');
  res = await httpRequest('POST', '/api/auth/init-admin', {
    userId: adminId,
    role: 'admin'
  });
  console.log(`   Status: ${res.status} ${res.ok ? '✅' : '❌'}`);

  // Test 7: Doctor Login (Fresh Token)
  console.log('\n7️⃣ Doctor Re-login');
  res = await httpRequest('POST', '/api/auth/login', {
    email: doctorEmail,
    password: 'Pass123'
  });
  const doctorToken = res.data?.token;
  const doctorRole = res.data?.role;
  console.log(`   Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
  console.log(`   Role: ${doctorRole}`);

  // Test 8: Admin Login (Fresh Token)
  console.log('\n8️⃣ Admin Re-login');
  res = await httpRequest('POST', '/api/auth/login', {
    email: adminEmail,
    password: 'Pass123'
  });
  const adminToken = res.data?.token;
  const adminRole = res.data?.role;
  console.log(`   Status: ${res.status} ${res.ok ? '✅' : '❌'}`);
  console.log(`   Role: ${adminRole}`);

  // Test 9: Patient Profile
  console.log('\n9️⃣ Update Patient Profile');
  res = await httpRequest('PUT', '/api/user/profile', {
    age: 30,
    gender: 'male',
    height: 180,
    weight: 75
  }, patientToken);
  console.log(`   Status: ${res.status} ${res.ok ? '✅' : '❌'}`);

  // Test 10: Doctor Access
  console.log('\n🔟 Doctor View Consultations');
  res = await httpRequest('GET', '/api/doctor/consultations', null, doctorToken);
  console.log(`   Status: ${res.status} ${res.ok ? '✅ (Doctor can access)' : '❌'}`);

  // Test 11: Admin Access
  console.log('\n1️⃣1️⃣ Admin View Users');
  res = await httpRequest('GET', '/api/admin/users', null, adminToken);
  console.log(`   Status: ${res.status} ${res.ok ? '✅ (Admin can access)' : '❌'}`);

  console.log('\n=== DONE ===');
  process.exit(0);
}

runTest().catch(console.error);
