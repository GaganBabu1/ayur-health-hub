const http = require('http');

const data = JSON.stringify({
  email: 'sharma@ayurhealth.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${responseData}`);
    
    try {
      const parsed = JSON.parse(responseData);
      if (parsed.token) {
        console.log(`\n✓ Login SUCCESS! Token: ${parsed.token.substring(0, 50)}...`);
      } else if (parsed.error) {
        console.log(`\n❌ Login FAILED: ${parsed.error}`);
      }
    } catch (e) {
      console.log('Response is not JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.write(data);
req.end();
