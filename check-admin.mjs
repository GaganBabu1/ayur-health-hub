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
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: null });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ status: 0, error: error.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function checkAdmin() {
  console.log('Checking for existing admin users...\n');
  
  // Try a few common admin emails
  const testEmails = [
    'admin@example.com',
    'admin@test.com',
    'admin-test@test.com',
    'test@example.com'
  ];

  for (const email of testEmails) {
    console.log(`Trying: ${email}`);
    const res = await httpRequest('POST', '/api/auth/login', {
      email: email,
      password: 'Admin123'
    });
    if (res.status === 200) {
      console.log(`✅ ACCOUNT FOUND: ${email}`);
      console.log(`   Role: ${res.data?.role}`);
      if (res.data?.role === 'admin') {
        console.log(`   ✅ IS ADMIN`);
        console.log(`   Token: ${res.data?.token?.slice(0, 20)}...`);
        return;
      }
    }
  }

  console.log('❌ No admin found with common credentials');
}

checkAdmin().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
