const axios = require('axios');

async function test() {
  try {
    // Wait for server to be ready
    await new Promise(r => setTimeout(r, 1000));
    
    const response = await axios.get('http://localhost:5000/api/doctor/list');
    console.log('✅ API Works! Doctors found:', response.data.length);
    console.log('Sample doctor:', JSON.stringify(response.data[0], null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
  process.exit(0);
}

test();
