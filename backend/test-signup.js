const http = require('http');

const data = JSON.stringify({
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123',
  age: 25,
  gender: 'Male'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
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
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.write(data);
req.end();
