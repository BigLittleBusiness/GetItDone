const http = require('http');

const API_BASE = 'http://localhost:3001';
let accessToken = '';
let refreshToken = '';
let userId = '';
let taskId = '';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test suite
async function runTests() {
  console.log('🧪 Starting End-to-End Tests\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  try {
    const res = await makeRequest('GET', '/health');
    if (res.status === 200 && res.data.status === 'ok') {
      console.log('✅ Test 1: Health check passed');
      passed++;
    } else {
      console.log('❌ Test 1: Health check failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 1: Health check error:', error.message);
    failed++;
  }

  // Test 2: User Registration
  try {
    const userData = {
      email: `test${Date.now()}@example.com`,
      password: 'SecurePassword123!',
      name: 'Test User',
      roles: ['student'],
      primaryRole: 'student',
    };

    const res = await makeRequest('POST', '/auth/register', userData);
    if (res.status === 201 && res.data.accessToken) {
      accessToken = res.data.accessToken;
      refreshToken = res.data.refreshToken;
      userId = res.data.user.id;
      console.log('✅ Test 2: User registration passed');
      passed++;
    } else {
      console.log('❌ Test 2: User registration failed');
      console.log('   Response:', res.data);
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 2: User registration error:', error.message);
    failed++;
  }

  // Test 3: Get Profile (with auth)
  try {
    const res = await makeRequest('GET', '/auth/me', null, accessToken);
    if (res.status === 200 && res.data.id === userId) {
      console.log('✅ Test 3: Get profile passed');
      passed++;
    } else {
      console.log('❌ Test 3: Get profile failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 3: Get profile error:', error.message);
    failed++;
  }

  // Test 4: Create Task
  try {
    const taskData = {
      title: 'Complete homework',
      description: 'Math assignment chapter 5',
      context: 'student',
      category: 'homework',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      estimatedDuration: 60,
    };

    const res = await makeRequest('POST', '/tasks', taskData, accessToken);
    if (res.status === 201 && res.data.task) {
      taskId = res.data.task.id;
      console.log('✅ Test 4: Create task passed');
      passed++;
    } else {
      console.log('❌ Test 4: Create task failed');
      console.log('   Response:', res.data);
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 4: Create task error:', error.message);
    failed++;
  }

  // Test 5: Get All Tasks
  try {
    const res = await makeRequest('GET', '/tasks', null, accessToken);
    if (res.status === 200 && Array.isArray(res.data.tasks)) {
      console.log('✅ Test 5: Get all tasks passed');
      console.log(`   Found ${res.data.tasks.length} task(s)`);
      passed++;
    } else {
      console.log('❌ Test 5: Get all tasks failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 5: Get all tasks error:', error.message);
    failed++;
  }

  // Test 6: Complete Task
  try {
    const res = await makeRequest('POST', `/tasks/${taskId}/complete`, null, accessToken);
    if (res.status === 200 && res.data.task.completed) {
      console.log('✅ Test 6: Complete task passed');
      passed++;
    } else {
      console.log('❌ Test 6: Complete task failed');
      console.log('   Response:', res.data);
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 6: Complete task error:', error.message);
    failed++;
  }

  // Test 7: Get Stats (should show updated streak)
  try {
    const res = await makeRequest('GET', '/stats', null, accessToken);
    if (res.status === 200 && res.data.stats) {
      console.log('✅ Test 7: Get stats passed');
      console.log(`   Points: ${res.data.stats.totalPoints}`);
      console.log(`   Streak: ${res.data.stats.currentStreak} days`);
      console.log(`   Tasks completed: ${res.data.stats.tasksCompleted}`);
      passed++;
    } else {
      console.log('❌ Test 7: Get stats failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 7: Get stats error:', error.message);
    failed++;
  }

  // Test 8: Check Achievements
  try {
    const res = await makeRequest('POST', '/achievements/check', null, accessToken);
    if (res.status === 200) {
      console.log('✅ Test 8: Check achievements passed');
      if (res.data.newAchievements && res.data.newAchievements.length > 0) {
        console.log(`   Unlocked ${res.data.newAchievements.length} achievement(s)!`);
      }
      passed++;
    } else {
      console.log('❌ Test 8: Check achievements failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 8: Check achievements error:', error.message);
    failed++;
  }

  // Test 9: Update Task
  try {
    const updates = {
      title: 'Complete homework (Updated)',
      priority: 'medium',
    };

    const res = await makeRequest('PUT', `/tasks/${taskId}`, updates, accessToken);
    if (res.status === 200 && res.data.task.title.includes('Updated')) {
      console.log('✅ Test 9: Update task passed');
      passed++;
    } else {
      console.log('❌ Test 9: Update task failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 9: Update task error:', error.message);
    failed++;
  }

  // Test 10: Delete Task
  try {
    const res = await makeRequest('DELETE', `/tasks/${taskId}`, null, accessToken);
    if (res.status === 200) {
      console.log('✅ Test 10: Delete task passed');
      passed++;
    } else {
      console.log('❌ Test 10: Delete task failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 10: Delete task error:', error.message);
    failed++;
  }

  // Test 11: Token Refresh
  try {
    const res = await makeRequest('POST', '/auth/refresh', { refreshToken });
    if (res.status === 200 && res.data.accessToken) {
      console.log('✅ Test 11: Token refresh passed');
      passed++;
    } else {
      console.log('❌ Test 11: Token refresh failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 11: Token refresh error:', error.message);
    failed++;
  }

  // Test 12: Calendar Connections (should return empty array)
  try {
    const res = await makeRequest('GET', '/calendar/connections', null, accessToken);
    if (res.status === 200 && Array.isArray(res.data.connections)) {
      console.log('✅ Test 12: Get calendar connections passed');
      console.log(`   Found ${res.data.connections.length} connection(s)`);
      passed++;
    } else {
      console.log('❌ Test 12: Get calendar connections failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ Test 12: Get calendar connections error:', error.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('\n🎉 All tests passed! System is fully functional.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Please review errors above.\n');
  }

  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

