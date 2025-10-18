# Frontend Integration Guide

**Status:** API Service Layer Created  
**Next Steps:** Update components to use real API calls

---

## What's Been Completed

### ✅ API Service Layer Created

**File:** `/get-it-done-app/src/services/api.js`

Complete API service with:
- Axios instance configured for backend
- Request interceptor (adds JWT token automatically)
- Response interceptor (handles token refresh on 401)
- Authentication API (register, login, logout, profile)
- Tasks API (CRUD, complete, uncomplete, filtering)
- Stats API (gamification, streaks, achievements)
- Calendar API (placeholder for OAuth implementation)

### ✅ App.jsx Updated

- Imports authAPI service
- Validates user session on load
- Auto-refreshes expired tokens
- Uses 'user' key instead of 'gitUser' in localStorage

### ✅ Environment Configuration

- `.env.example` created with API_URL and OAuth placeholders
- `.env` created for development (localhost:3001)

---

## Components That Need API Integration

### 1. ImprovedOnboarding.jsx

**Current:** Saves to localStorage only  
**Needed:** Call `authAPI.register()` on completion

```javascript
import { authAPI } from '../services/api'

const handleCoreComplete = async () => {
  try {
    const userData = await authAPI.register({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      roles: formData.roles,
      primaryRole: formData.primaryRole,
      experienceLevel: formData.experienceLevel,
      motivationStyle: formData.motivationStyle,
    })
    
    onComplete(userData.user)
    navigate('/dashboard')
  } catch (error) {
    console.error('Registration failed:', error)
    // Show error message to user
  }
}
```

### 2. LandingPage.jsx

**Current:** No login functionality  
**Needed:** Add login form

```javascript
import { authAPI } from '../services/api'

const handleLogin = async (e) => {
  e.preventDefault()
  try {
    const { user } = await authAPI.login(email, password)
    onLogin(user)
    navigate('/dashboard')
  } catch (error) {
    setError('Invalid email or password')
  }
}
```

### 3. AdaptiveDashboard.jsx

**Current:** Uses mock task data from localStorage  
**Needed:** Fetch from API

```javascript
import { tasksAPI, statsAPI } from '../services/api'

useEffect(() => {
  const loadData = async () => {
    try {
      const [tasksData, statsData, streakData] = await Promise.all([
        tasksAPI.getAll(currentContext),
        statsAPI.getStats(),
        statsAPI.getStreak()
      ])
      
      setTasks(tasksData.tasks)
      setStats(statsData)
      setStreak(streakData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }
  
  loadData()
}, [currentContext])
```

### 4. TaskEntry.jsx

**Current:** Adds tasks to localStorage  
**Needed:** Call API

```javascript
import { tasksAPI, statsAPI } from '../services/api'

const handleTaskCreate = async (taskData) => {
  try {
    const newTask = await tasksAPI.create({
      title: taskData.title,
      description: taskData.description,
      context: currentContext,
      category: taskData.category,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      estimatedDuration: taskData.estimatedDuration
    })
    
    // Check for new achievements
    const { newAchievements } = await statsAPI.checkAchievements()
    if (newAchievements.length > 0) {
      showCelebration(newAchievements)
    }
    
    onTaskAdded(newTask)
  } catch (error) {
    console.error('Failed to create task:', error)
  }
}

const handleTaskComplete = async (taskId) => {
  try {
    const updatedTask = await tasksAPI.complete(taskId)
    
    // Refresh stats to show updated streak
    const statsData = await statsAPI.getStats()
    setStats(statsData)
    
    // Check for achievements
    const { newAchievements } = await statsAPI.checkAchievements()
    if (newAchievements.length > 0) {
      showCelebration(newAchievements)
    }
    
    onTaskUpdated(updatedTask)
  } catch (error) {
    console.error('Failed to complete task:', error)
  }
}
```

### 5. Settings.jsx

**Current:** Updates localStorage  
**Needed:** Call API

```javascript
import { authAPI } from '../services/api'

const handleSave = async () => {
  try {
    const updatedUser = await authAPI.updateProfile({
      motivationStyle: settings.motivationStyle,
      notificationFrequency: settings.notificationFrequency,
      calendarApp: settings.calendarApp
    })
    
    onUserUpdate(updatedUser)
    setSuccess('Settings saved successfully!')
  } catch (error) {
    setError('Failed to save settings')
  }
}
```

---

## Testing Frontend Integration

### 1. Start Backend Server
```bash
cd /home/ubuntu/GetItDone/backend
node src-js/server.js
```

### 2. Start Frontend Dev Server
```bash
cd /home/ubuntu/GetItDone/get-it-done-app
pnpm dev
```

### 3. Test Flow
1. Visit http://localhost:5173
2. Complete onboarding (should call `/api/auth/register`)
3. Add a task (should call `/api/tasks`)
4. Complete task (should call `/api/tasks/:id/complete`)
5. Check dashboard stats (should show real data from API)

### 4. Verify in Browser DevTools
- Network tab: See API calls to `localhost:3001/api/*`
- Application tab: See `accessToken`, `refreshToken`, `user` in localStorage
- Console: No errors

---

## Error Handling

### Common Issues

**CORS Errors:**
Backend already has CORS configured for `http://localhost:5173`. If you see CORS errors:
1. Check backend is running
2. Verify VITE_API_URL in `.env`
3. Check browser console for exact error

**401 Unauthorized:**
- Token expired: Auto-refresh should handle this
- No token: User needs to login again
- Invalid token: Clear localStorage and re-login

**Network Errors:**
- Backend not running: Start backend server
- Wrong API URL: Check `.env` file
- Firewall blocking: Check port 3001 is accessible

---

## Migration Strategy

### Option A: All at Once (Risky)
Update all components in one go, test thoroughly

### Option B: Incremental (Recommended)
1. **Week 1:** Auth only (register, login, profile)
2. **Week 2:** Tasks (CRUD operations)
3. **Week 3:** Gamification (stats, streaks, achievements)
4. **Week 4:** Polish and bug fixes

### Option C: Hybrid Mode (Safest)
Keep localStorage as fallback:
```javascript
const loadTasks = async () => {
  try {
    const data = await tasksAPI.getAll()
    return data.tasks
  } catch (error) {
    // Fallback to localStorage
    const local = localStorage.getItem('tasks')
    return local ? JSON.parse(local) : []
  }
}
```

---

## Production Considerations

### Environment Variables
```
# Development
VITE_API_URL=http://localhost:3001/api

# Production
VITE_API_URL=https://api.getitdone.app/api
```

### Token Security
- Never log tokens
- Use httpOnly cookies in production (requires backend changes)
- Implement token rotation
- Add CSRF protection

### Performance
- Cache API responses
- Implement optimistic updates
- Add loading states
- Handle offline mode

---

## Next Steps

1. **Update ImprovedOnboarding.jsx** - Register via API
2. **Update LandingPage.jsx** - Add login form
3. **Update AdaptiveDashboard.jsx** - Fetch tasks from API
4. **Update TaskEntry.jsx** - Create/complete tasks via API
5. **Update Settings.jsx** - Save settings via API
6. **Test end-to-end** - Complete user journey
7. **Fix bugs** - Handle edge cases
8. **Deploy** - Push to production

---

## Estimated Timeline

**Full Integration:** 1-2 weeks  
**Basic Integration (auth + tasks):** 3-5 days  
**Testing & Bug Fixes:** 2-3 days

---

## Files Modified

- ✅ `src/services/api.js` - Created
- ✅ `src/App.jsx` - Updated
- ✅ `.env` - Created
- ✅ `.env.example` - Created
- ⏳ `src/components/ImprovedOnboarding.jsx` - Needs update
- ⏳ `src/components/LandingPage.jsx` - Needs update
- ⏳ `src/components/AdaptiveDashboard.jsx` - Needs update
- ⏳ `src/components/TaskEntry.jsx` - Needs update
- ⏳ `src/components/Settings.jsx` - Needs update

