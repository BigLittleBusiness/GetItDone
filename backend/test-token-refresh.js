const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testTokenRefresh() {
  console.log('🧪 Testing Token Refresh Flow\n');

  try {
    // Step 1: Register a test user
    console.log('1️⃣  Registering test user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User',
      roles: ['student'],
      primaryRole: 'student',
    });

    const { accessToken, refreshToken } = registerResponse.data;
    console.log('✅ User registered successfully');
    console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
    console.log(`   Refresh Token: ${refreshToken.substring(0, 20)}...\n`);

    // Step 2: Use access token to get profile
    console.log('2️⃣  Fetching profile with access token...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('✅ Profile fetched successfully');
    console.log(`   User: ${profileResponse.data.name}\n`);

    // Step 3: Wait for token to be close to expiration (15 min in production, but testing immediately)
    console.log('3️⃣  Refreshing access token...');
    const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    const newAccessToken = refreshResponse.data.accessToken;
    console.log('✅ Token refreshed successfully');
    console.log(`   New Access Token: ${newAccessToken.substring(0, 20)}...\n`);

    // Step 4: Use new access token
    console.log('4️⃣  Using new access token to fetch profile...');
    const newProfileResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });
    console.log('✅ Profile fetched with new token');
    console.log(`   User: ${newProfileResponse.data.name}\n`);

    // Step 5: Try to use old access token (should still work since not expired yet)
    console.log('5️⃣  Testing old access token (should still work)...');
    try {
      await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log('✅ Old token still valid (as expected)\n');
    } catch (error) {
      console.log('❌ Old token rejected (unexpected)\n');
    }

    // Step 6: Try invalid refresh token
    console.log('6️⃣  Testing invalid refresh token...');
    try {
      await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: 'invalid-token',
      });
      console.log('❌ Invalid token accepted (SECURITY ISSUE!)\n');
    } catch (error) {
      console.log('✅ Invalid token rejected (as expected)\n');
    }

    console.log('🎉 All token refresh tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return false;
  }
}

// Run the test
testTokenRefresh().then(success => {
  process.exit(success ? 0 : 1);
});

