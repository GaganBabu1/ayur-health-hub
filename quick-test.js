// Quick test to verify API
const result = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Quick Test',
    email: 'quick@test.com',
    password: 'Quick123'
  })
});

const data = await result.json();
console.log('Status:', result.status);
console.log('Response:', JSON.stringify(data, null, 2));
