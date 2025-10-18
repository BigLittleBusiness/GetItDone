const http = require('http');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Testing Get It Done! Backend API\n');

  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const health = await testEndpoint('/health');
    console.log('✅ Health check:', health.status, health.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Register user
  console.log('\n2. Testing user registration...');
  try {
    const register = await testEndpoint('/api/auth/register', 'POST', {
      email: 'testuser@example.com',
      password: 'testpass123',
      name: 'Test User',
      roles: ['student'],
      primaryRole: 'student',
      experienceLevel: 'intermediate',
      motivationStyle: 'positive',
    });
    console.log('✅ Registration:', register.status);
    if (register.data.accessToken) {
      console.log('   Access token received');
      global.accessToken = register.data.accessToken;
      global.userId = register.data.user.id;
    }
  } catch (error) {
    console.log('❌ Registration failed:', error.message);
  }

  console.log('\nTests complete!');
}

runTests();
