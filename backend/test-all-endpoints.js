const http = require('http');

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function request(method, path, data = null, token = null) {
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

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

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

function logTest(name, passed, details = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Get It Done! Backend API Test Suite');
  console.log('='.repeat(60));
  console.log('');

  let accessToken = null;
  let refreshToken = null;
  let userId = null;
  let taskId = null;

  // Test 1: Health Check
  console.log('1. HEALTH CHECK');
  console.log('-'.repeat(60));
  try {
    const res = await request('GET', '/health');
    if (res.status === 200 && res.data.status === 'ok') {
      logTest('Health endpoint', true, `Status: ${res.data.status}`);
    } else {
      logTest('Health endpoint', false, `Unexpected response: ${JSON.stringify(res)}`);
    }
  } catch (error) {
    logTest('Health endpoint', false, error.message);
    console.log('\n❌ Server is not responding. Aborting tests.\n');
    return;
  }
  console.log('');

  // Test 2: User Registration
  console.log('2. AUTHENTICATION - REGISTRATION');
  console.log('-'.repeat(60));
  const testEmail = `test${Date.now()}@example.com`;
  try {
    const res = await request('POST', '/api/auth/register', {
      email: testEmail,
      password: 'TestPass123!',
      name: 'Test User',
      roles: ['student', 'professional'],
      primaryRole: 'student',
      experienceLevel: 'intermediate',
      motivationStyle: 'positive',
    });
    
    if (res.status === 201 && res.data.accessToken) {
      accessToken = res.data.accessToken;
      refreshToken = res.data.refreshToken;
      userId = res.data.user.id;
      logTest('User registration', true, `User ID: ${userId}`);
      logTest('Access token received', true);
      logTest('Refresh token received', true);
    } else {
      logTest('User registration', false, `Status: ${res.status}, Data: ${JSON.stringify(res.data)}`);
    }
  } catch (error) {
    logTest('User registration', false, error.message);
  }
  console.log('');

  // Test 3: Login
  console.log('3. AUTHENTICATION - LOGIN');
  console.log('-'.repeat(60));
  try {
    const res = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'TestPass123!',
    });
    
    if (res.status === 200 && res.data.accessToken) {
      logTest('User login', true);
      // Use new tokens
      accessToken = res.data.accessToken;
      refreshToken = res.data.refreshToken;
    } else {
      logTest('User login', false, `Status: ${res.status}`);
    }
  } catch (error) {
    logTest('User login', false, error.message);
  }
  console.log('');

  // Test 4: Get Profile
  console.log('4. AUTHENTICATION - GET PROFILE');
  console.log('-'.repeat(60));
  try {
    const res = await request('GET', '/api/auth/me', null, accessToken);
    
    if (res.status === 200 && res.data.email === testEmail) {
      logTest('Get user profile', true, `Email: ${res.data.email}`);
    } else {
      logTest('Get user profile', false, `Status: ${res.status}`);
    }
  } catch (error) {
    logTest('Get user profile', false, error.message);
  }
  console.log('');

  // Test 5: Update Profile
  console.log('5. AUTHENTICATION - UPDATE PROFILE');
  console.log('-'.repeat(60));
  try {
    const res = await request('PUT', '/api/auth/me', {
      motivationStyle: 'cheeky',
      onboardingComplete: true,
    }, accessToken);
    
    if (res.status === 200 && res.data.motivationStyle === 'cheeky') {
      logTest('Update user profile', true, 'Motivation style updated to cheeky');
    } else {
      logTest('Update user profile', false, `Status: ${res.status}`);
    }
  } catch (error) {
    logTest('Update user profile', false, error.message);
  }
  console.log('');

  // Test 6: Refresh Token
  console.log('6. AUTHENTICATION - REFRESH TOKEN');
  console.log('-'.repeat(60));
  try {
    const res = await request('POST', '/api/auth/refresh', {
      refreshToken: refreshToken,
    });
    
    if (res.status === 200 && res.data.accessToken) {
      logTest('Refresh access token', true);
      accessToken = res.data.accessToken;
    } else {
      logTest('Refresh access token', false, `Status: ${res.status}`);
    }
  } catch (error) {
    logTest('Refresh access token', false, error.message);
  }
  console.log('');

  // Test 7: Create Task
  console.log('7. TASKS - CREATE');
  console.log('-'.repeat(60));
  try {
    const res = await request('POST', '/api/tasks', {
      title: 'Test Task 1',
      description: 'This is a test task',
      context: 'student',
      category: 'homework',
      priority: 'high',
      estimatedDuration: 30,
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    }, accessToken);
    
    if (res.status === 201 && res.data.id) {
      taskId = res.data.id;
      logTest('Create task', true, `Task ID: ${taskId}`);
    } else {
      logTest('Create task', false, `Status: ${res.status}`);
    }
  } catch (error) {
    logTest('Create task', false, error.message);
  }
  console.log('');

  // Test 8: Get All Tasks
  console.log('8. TASKS - LIST');
  console.log('-'.repeat(60));
  try {
    const res = await request('GET', '/api/tasks', null, accessToken);
    
    if (res.status === 200 && Array.isArray(res.data.tasks)) {
      logTest('Get all tasks', true, `Found ${res.data.tasks.length} task(s)`);
    } else {
      logTest('Get all tasks', false, `Status: ${res.status}`);
    }
  } catch (error) {
    logTest('Get all tasks', false, error.message);
  }
  console.log('');

  // Test 9: Get Single Task
  console.log('9. TASKS - GET ONE');
  console.log('-'.repeat(60));
  if (taskId) {
    try {
      const res = await request('GET', `/api/tasks/${taskId}`, null, accessToken);
      
      if (res.status === 200 && res.data.id === taskId) {
        logTest('Get single task', true, `Title: ${res.data.title}`);
      } else {
        logTest('Get single task', false, `Status: ${res.status}`);
      }
    } catch (error) {
      logTest('Get single task', false, error.message);
    }
  } else {
    logTest('Get single task', false, 'No task ID available');
  }
  console.log('');

  // Test 10: Update Task
  console.log('10. TASKS - UPDATE');
  console.log('-'.repeat(60));
  if (taskId) {
    try {
      const res = await request('PUT', `/api/tasks/${taskId}`, {
        title: 'Updated Test Task',
        priority: 'medium',
      }, accessToken);
      
      if (res.status === 200 && res.data.title === 'Updated Test Task') {
        logTest('Update task', true, 'Title updated successfully');
      } else {
        logTest('Update task', false, `Status: ${res.status}`);
      }
    } catch (error) {
      logTest('Update task', false, error.message);
    }
  } else {
    logTest('Update task', false, 'No task ID available');
  }
  console.log('');

  // Test 11: Complete Task
  console.log('11. TASKS - COMPLETE');
  console.log('-'.repeat(60));
  if (taskId) {
    try {
      const res = await request('POST', `/api/tasks/${taskId}/complete`, null, accessToken);
      
      if (res.status === 200 && res.data.completed === true) {
        logTest('Complete task', true, 'Task marked as completed');
      } else {
        logTest('Complete task', false, `Status: ${res.status}`);
      }
    } catch (error) {
      logTest('Complete task', false, error.message);
    }
  } else {
    logTest('Complete task', false, 'No task ID available');
  }
  console.log('');

  // Test 12: Get Stats
  console.log('12. GAMIFICATION - STATS');
  console.log('-'.repeat(60));
  try {
    const res = await request('GET', '/api/stats', null, accessToken);
    
    if (res.status === 200 && res.data.tasksCompleted !== undefined) {
      logTest('Get user stats', true, `Tasks completed: ${res.data.tasksCompleted}, Streak: ${res.data.currentStreak}`);
    } else {
      logTest('Get user stats', false, `Status: ${res.status}`);
    }
  } catch (error) {
    logTest('Get user stats', false, error.message);
  }
  console.log('');

  // Test 13: Get Streak
  console.log('13. GAMIFICATION - STREAK');
  console.log('-'.repeat(60));
  try {
    const res = await request('GET', '/api/stats/streak', null, accessToken);
    
    if (res.status === 200 && res.data.currentStreak !== undefined) {
      logTest('Get streak info', true, `Current streak: ${res.data.currentStreak} days`);
    } else {
      logTest('Get streak info', false, `Status: ${res.status}`);
    }
  } catch (error) {
    logTest('Get streak info', false, error.message);
  }
  console.log('');

  // Test 14: Get Achievements
  console.log('14. GAMIFICATION - ACHIEVEMENTS');
  console.log('-'.repeat(60));
  try {
    const res = await request('GET', '/api/achievements', null, accessToken);
    
    if (res.status === 200 && Array.isArray(res.data.achievements)) {
      logTest('Get achievements', true, `Found ${res.data.achievements.length} achievement types`);
    } else {
      logTest('Get achievements', false, `Status: ${res.status}`);
    }
  } catch (error) {
    logTest('Get achievements', false, error.message);
  }
  console.log('');

  // Test 15: Check Achievements
  console.log('15. GAMIFICATION - CHECK ACHIEVEMENTS');
  console.log('-'.repeat(60));
  try {
    const res = await request('POST', '/api/achievements/check', null, accessToken);
    
    if (res.status === 200) {
      logTest('Check achievements', true, `New achievements: ${res.data.newAchievements.length}`);
    } else {
      logTest('Check achievements', false, `Status: ${res.status}`);
    }
  } catch (error) {
    logTest('Check achievements', false, error.message);
  }
  console.log('');

  // Test 16: Uncomplete Task
  console.log('16. TASKS - UNCOMPLETE');
  console.log('-'.repeat(60));
  if (taskId) {
    try {
      const res = await request('POST', `/api/tasks/${taskId}/uncomplete`, null, accessToken);
      
      if (res.status === 200 && res.data.completed === false) {
        logTest('Uncomplete task', true, 'Task marked as incomplete');
      } else {
        logTest('Uncomplete task', false, `Status: ${res.status}`);
      }
    } catch (error) {
      logTest('Uncomplete task', false, error.message);
    }
  } else {
    logTest('Uncomplete task', false, 'No task ID available');
  }
  console.log('');

  // Test 17: Delete Task
  console.log('17. TASKS - DELETE');
  console.log('-'.repeat(60));
  if (taskId) {
    try {
      const res = await request('DELETE', `/api/tasks/${taskId}`, null, accessToken);
      
      if (res.status === 200) {
        logTest('Delete task', true, 'Task deleted successfully');
      } else {
        logTest('Delete task', false, `Status: ${res.status}`);
      }
    } catch (error) {
      logTest('Delete task', false, error.message);
    }
  } else {
    logTest('Delete task', false, 'No task ID available');
  }
  console.log('');

  // Test 18: Today's Tasks
  console.log('18. TASKS - TODAY');
  console.log('-'.repeat(60));
  try {
    const res = await request('GET', '/api/tasks/today', null, accessToken);
    
    if (res.status === 200 && Array.isArray(res.data.tasks)) {
      logTest("Get today's tasks", true, `Found ${res.data.tasks.length} task(s)`);
    } else {
      logTest("Get today's tasks", false, `Status: ${res.status}`);
    }
  } catch (error) {
    logTest("Get today's tasks", false, error.message);
  }
  console.log('');

  // Test 19: Week's Tasks
  console.log('19. TASKS - WEEK');
  console.log('-'.repeat(60));
  try {
    const res = await request('GET', '/api/tasks/week', null, accessToken);
    
    if (res.status === 200 && Array.isArray(res.data.tasks)) {
      logTest("Get week's tasks", true, `Found ${res.data.tasks.length} task(s)`);
    } else {
      logTest("Get week's tasks", false, `Status: ${res.status}`);
    }
  } catch (error) {
    logTest("Get week's tasks", false, error.message);
  }
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
  console.log('');

  if (testResults.failed > 0) {
    console.log('FAILED TESTS:');
    testResults.tests.filter(t => !t.passed).forEach(t => {
      console.log(`  ❌ ${t.name}: ${t.details}`);
    });
    console.log('');
  }

  if (testResults.failed === 0) {
    console.log('🎉 All tests passed! Backend API is fully functional.');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }
  console.log('');
}

runTests().catch(console.error);

