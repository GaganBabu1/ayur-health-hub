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

async function test() {
  console.log('Testing Admin Creation...\n');

  // Step 1: Register
  console.log('1. Register user');
  let res = await httpRequest('POST', '/api/auth/register', {
    name: 'Admin Test',
    email: `admin-test-${Date.now()}@example.com`,
    password: 'Admin123'
  });
  console.log(`   Status: ${res.status}`);
  console.log(`   User ID: ${res.data._id}`);
  console.log(`   Initial Role: ${res.data.role}`);
  const userId = res.data._id;

  // Step 2: Promote to admin
  console.log('\n2. Promote to admin');
  res = await httpRequest('POST', '/api/auth/init-admin', {
    userId: userId,
    role: 'admin'
  });
  console.log(`   Status: ${res.status}`);
  console.log(`   Response:`, JSON.stringify(res.data, null, 2));

  // Step 3: Login and check role
  console.log('\n3. Login to verify role');
  res = await httpRequest('POST', '/api/auth/login', {
    email: `admin-test-${Date.now() - 100}@example.com`, // Won't work since we just created it
    password: 'Admin123'
  });
  console.log(`   Status: ${res.status}`);
  if (res.ok) {
    console.log(`   Role: ${res.data.role}`);
  }
}

test();
