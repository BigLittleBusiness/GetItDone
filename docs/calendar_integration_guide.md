# Calendar Integration Backend - Complete Guide

## Overview

The Get It Done! calendar integration backend enables full two-way sync between the app and users' phone calendars (Google Calendar, Outlook Calendar, and Apple Calendar/iCal). This allows students and professionals to seamlessly manage tasks across platforms.

---

## Architecture

### Technology Stack

**Backend Framework:** Flask (Python)  
**Database:** SQLite (development), PostgreSQL (production recommended)  
**Calendar APIs:**
- Google Calendar API (OAuth 2.0)
- Microsoft Graph API (Outlook Calendar, OAuth 2.0)
- CalDAV Protocol (Apple Calendar/iCloud)

### Components

1. **Services** (`src/services/`)
   - `google_calendar.py` - Google Calendar integration
   - `outlook_calendar.py` - Outlook Calendar integration
   - `apple_calendar.py` - Apple Calendar/iCloud integration

2. **Models** (`src/models/`)
   - `calendar.py` - Database models for connections, syncs, webhooks

3. **Routes** (`src/routes/`)
   - `calendar.py` - API endpoints for calendar operations

---

## Setup Instructions

### 1. Google Calendar API Setup

**Create Google Cloud Project:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Get It Done Calendar Integration"
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5000/api/calendar/google/callback`
   - For production: `https://yourdomain.com/api/calendar/google/callback`
5. Download client credentials

**Set Environment Variables:**

```bash
export GOOGLE_CLIENT_ID="your_client_id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your_client_secret"
export GOOGLE_REDIRECT_URI="http://localhost:5000/api/calendar/google/callback"
```

### 2. Microsoft Graph API Setup (Outlook)

**Register Azure AD Application:**

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Name: "Get It Done Calendar Integration"
5. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
6. Redirect URI: `http://localhost:5000/api/calendar/outlook/callback`
7. After registration, go to "API permissions":
   - Add permission → Microsoft Graph → Delegated permissions
   - Add: `Calendars.ReadWrite`, `offline_access`
8. Go to "Certificates & secrets" → Create new client secret

**Set Environment Variables:**

```bash
export MICROSOFT_CLIENT_ID="your_application_id"
export MICROSOFT_CLIENT_SECRET="your_client_secret"
export MICROSOFT_REDIRECT_URI="http://localhost:5000/api/calendar/outlook/callback"
```

### 3. Apple Calendar Setup

**No API Registration Required**

Apple Calendar uses CalDAV protocol with iCloud credentials.

**Users must:**
1. Go to [appleid.apple.com](https://appleid.apple.com/)
2. Sign in
3. Navigate to "Security" → "App-Specific Passwords"
4. Generate new password for "Get It Done"
5. Use this password (not Apple ID password) for authentication

---

## API Endpoints

### Base URL
`http://localhost:5000/api/calendar` (development)  
`https://yourdomain.com/api/calendar` (production)

### Authentication & Connection

#### 1. Initiate Calendar Connection

**Endpoint:** `POST /connect/<calendar_type>`

**Calendar Types:** `google`, `outlook`, `apple`

**Request Body:**
```json
{
  "user_id": "user123"
}
```

**Response (Google/Outlook):**
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/auth?...",
  "state": "user123",
  "calendar_type": "google"
}
```

**Response (Apple):**
```json
{
  "message": "Apple Calendar requires app-specific password",
  "instructions": "Generate app-specific password at appleid.apple.com",
  "calendar_type": "apple"
}
```

**Usage:**
- For Google/Outlook: Redirect user to `authorization_url`
- For Apple: Show instructions and password input form

---

#### 2. Google OAuth Callback

**Endpoint:** `GET /google/callback`

**Query Parameters:**
- `code`: Authorization code (automatic from Google)
- `state`: User ID (automatic from Google)

**Response:**
- Redirects to: `/calendar-connected?type=google&status=success`

**Backend Action:**
- Exchanges authorization code for access token
- Saves credentials to database
- User is now connected

---

#### 3. Outlook OAuth Callback

**Endpoint:** `GET /outlook/callback`

**Query Parameters:**
- `code`: Authorization code (automatic from Microsoft)
- `state`: User ID (automatic from Microsoft)

**Response:**
- Redirects to: `/calendar-connected?type=outlook&status=success`

**Backend Action:**
- Exchanges authorization code for access token
- Saves credentials to database
- User is now connected

---

#### 4. Apple Calendar Connection

**Endpoint:** `POST /apple/connect`

**Request Body:**
```json
{
  "user_id": "user123",
  "apple_id": "user@icloud.com",
  "app_password": "abcd-efgh-ijkl-mnop"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Apple Calendar connected successfully",
  "calendars": ["Calendar", "Work", "Personal"]
}
```

---

### Task Syncing

#### 5. Sync Task to Calendar

**Endpoint:** `POST /task-to-calendar`

**Request Body:**
```json
{
  "user_id": "user123",
  "task_data": {
    "id": "task456",
    "name": "Complete assignment",
    "scheduled_time": "2025-10-17T14:00:00",
    "category": "Homework",
    "timezone": "America/New_York"
  }
}
```

**Response:**
```json
{
  "success": true,
  "event_id": "calendar_event_id_789",
  "event_link": "https://calendar.google.com/calendar/event?eid=..."
}
```

**What Happens:**
- Creates event in user's connected calendar
- Event appears on phone calendar app
- Stores mapping between task ID and calendar event ID
- Records sync in database

---

#### 6. Sync Calendar to Tasks

**Endpoint:** `POST /calendar-to-tasks`

**Request Body:**
```json
{
  "user_id": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "tasks": [
    {
      "name": "Team meeting",
      "scheduled_time": "2025-10-17T10:00:00",
      "category": "General",
      "calendar_event_id": "event123",
      "calendar_source": "google",
      "calendar_link": "https://calendar.google.com/..."
    },
    {
      "name": "Dentist appointment",
      "scheduled_time": "2025-10-18T15:30:00",
      "category": "General",
      "calendar_event_id": "event456",
      "calendar_source": "google"
    }
  ],
  "count": 2
}
```

**What Happens:**
- Fetches events from user's calendar (next 7 days by default)
- Filters out events already created by Get It Done!
- Returns events formatted as tasks
- Frontend creates tasks in Get It Done! from these events

---

#### 7. Update Calendar Event

**Endpoint:** `PUT /update-event`

**Request Body:**
```json
{
  "user_id": "user123",
  "event_id": "calendar_event_id_789",
  "task_data": {
    "name": "Updated assignment title",
    "scheduled_time": "2025-10-17T15:00:00",
    "category": "Homework"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

#### 8. Delete Calendar Event

**Endpoint:** `DELETE /delete-event`

**Request Body:**
```json
{
  "user_id": "user123",
  "event_id": "calendar_event_id_789"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### Status & Management

#### 9. Check Connection Status

**Endpoint:** `GET /connection-status/<user_id>`

**Response (Connected):**
```json
{
  "connected": true,
  "calendar_type": "google",
  "connected_at": "2025-10-16T10:30:00"
}
```

**Response (Not Connected):**
```json
{
  "connected": false
}
```

---

#### 10. Disconnect Calendar

**Endpoint:** `POST /disconnect/<user_id>`

**Response:**
```json
{
  "success": true,
  "message": "Calendar disconnected"
}
```

---

#### 11. Get Sync History

**Endpoint:** `GET /sync-history/<user_id>`

**Response:**
```json
{
  "syncs": [
    {
      "id": 1,
      "user_id": "user123",
      "task_id": "task456",
      "calendar_event_id": "event789",
      "calendar_type": "google",
      "sync_direction": "to_calendar",
      "sync_status": "success",
      "error_message": null,
      "created_at": "2025-10-16T14:30:00"
    }
  ],
  "count": 1
}
```

---

## Database Schema

### CalendarConnection Table

Stores user calendar authentication credentials.

```sql
CREATE TABLE calendar_connections (
    id INTEGER PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    calendar_type VARCHAR(20) NOT NULL,  -- 'google', 'outlook', 'apple'
    credentials TEXT NOT NULL,  -- JSON string
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### CalendarSync Table

Tracks all sync operations between Get It Done! and calendars.

```sql
CREATE TABLE calendar_syncs (
    id INTEGER PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    task_id VARCHAR(100),  -- Get It Done! task ID
    calendar_event_id VARCHAR(200),  -- Calendar provider's event ID
    calendar_type VARCHAR(20) NOT NULL,
    sync_direction VARCHAR(20) NOT NULL,  -- 'to_calendar', 'from_calendar'
    sync_status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'success', 'failed'
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### WebhookSubscription Table

Stores webhook subscriptions for real-time sync (future feature).

```sql
CREATE TABLE webhook_subscriptions (
    id INTEGER PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    calendar_type VARCHAR(20) NOT NULL,
    subscription_id VARCHAR(200) NOT NULL,
    channel_id VARCHAR(200),  -- For Google
    resource_id VARCHAR(200),  -- For Google
    expiration DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Integration Flow

### User Connects Calendar

```
1. User clicks "Connect Google Calendar" in Get It Done! app
2. Frontend calls: POST /api/calendar/connect/google
3. Backend returns authorization_url
4. Frontend redirects user to Google OAuth page
5. User grants permission
6. Google redirects to: /api/calendar/google/callback?code=...&state=user123
7. Backend exchanges code for access token
8. Backend saves credentials to database
9. Backend redirects to: /calendar-connected?type=google&status=success
10. Frontend shows "Calendar connected successfully!"
```

### Task Created in Get It Done! → Syncs to Calendar

```
1. User creates task in Get It Done! chat interface
2. Frontend saves task to Get It Done! database
3. Frontend calls: POST /api/calendar/task-to-calendar
   Body: { user_id, task_data }
4. Backend retrieves user's calendar credentials
5. Backend calls Google Calendar API to create event
6. Google Calendar creates event
7. Event appears on user's phone calendar app
8. Backend returns event_id and event_link
9. Frontend stores calendar_event_id with task
```

### Calendar Event Created → Syncs to Get It Done!

```
1. User creates event in phone calendar app (e.g., "Dentist 3pm")
2. Get It Done! frontend calls: POST /api/calendar/calendar-to-tasks
3. Backend fetches events from Google Calendar API
4. Backend filters out events created by Get It Done!
5. Backend returns list of external events as task format
6. Frontend creates tasks in Get It Done! from calendar events
7. User sees "Dentist 3pm" task in Get It Done! dashboard
8. Get It Done! sends motivational reminder at appropriate time
```

---

## Error Handling

### Common Errors

**1. Token Expired**

```json
{
  "error": "Token has expired"
}
```

**Solution:** Refresh token automatically (Google/Outlook) or prompt user to reconnect (Apple)

**2. Calendar Not Connected**

```json
{
  "error": "No calendar connected"
}
```

**Solution:** Prompt user to connect calendar first

**3. Invalid Credentials**

```json
{
  "error": "Invalid authentication credentials"
}
```

**Solution:** User must reconnect calendar with valid credentials

**4. API Rate Limit**

```json
{
  "error": "Rate limit exceeded"
}
```

**Solution:** Implement exponential backoff and retry logic

---

## Security Considerations

### Credential Storage

**Current (Development):**
- Credentials stored in SQLite database
- JSON-encoded in `credentials` column

**Production Recommendations:**
1. **Encrypt credentials at rest** using AES-256
2. **Use environment variables** for encryption keys
3. **Rotate encryption keys** regularly
4. **Use PostgreSQL** with encrypted columns
5. **Implement key management service** (AWS KMS, Azure Key Vault)

### OAuth Security

**Best Practices:**
1. **Use HTTPS only** in production
2. **Validate state parameter** to prevent CSRF attacks
3. **Store tokens securely** (encrypted database)
4. **Implement token refresh** automatically
5. **Revoke tokens** when user disconnects calendar

### API Security

**Recommendations:**
1. **Require authentication** for all calendar endpoints
2. **Validate user_id** matches authenticated user
3. **Rate limit** API requests (100 requests/minute per user)
4. **Log all sync operations** for audit trail
5. **Implement CORS** properly for frontend-backend communication

---

## Performance Optimization

### Caching Strategy

**Cache Calendar Events:**
- Cache fetched events for 5 minutes
- Invalidate cache on manual sync request
- Reduces API calls to calendar providers

**Cache Credentials:**
- Keep credentials in memory for active sessions
- Reduces database queries

### Batch Operations

**Batch Sync:**
- Sync multiple tasks to calendar in single request
- Reduces API calls and improves performance

### Async Processing

**Background Jobs (Future):**
- Use Celery or similar for async sync operations
- Prevents blocking user interface
- Handles webhook processing

---

## Testing

### Manual Testing

**Test Google Calendar:**

```bash
# 1. Start backend
cd /home/ubuntu/GetItDone/calendar-backend
source venv/bin/activate
python src/main.py

# 2. Connect calendar
curl -X POST http://localhost:5000/api/calendar/connect/google \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user_123"}'

# 3. Visit authorization_url in browser
# 4. Grant permission
# 5. Check connection status
curl http://localhost:5000/api/calendar/connection-status/test_user_123

# 6. Create task and sync to calendar
curl -X POST http://localhost:5000/api/calendar/task-to-calendar \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "task_data": {
      "id": "task_001",
      "name": "Test homework assignment",
      "scheduled_time": "2025-10-17T14:00:00",
      "category": "Homework",
      "timezone": "America/New_York"
    }
  }'

# 7. Check Google Calendar on phone - event should appear!
```

### Integration Testing

**Test Calendar → Tasks Sync:**

1. Create event in Google Calendar on phone: "Team meeting 2pm tomorrow"
2. Call sync endpoint:
```bash
curl -X POST http://localhost:5000/api/calendar/calendar-to-tasks \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user_123"}'
```
3. Verify "Team meeting" appears in response
4. Frontend creates task in Get It Done!

---

## Deployment

### Environment Variables (Production)

```bash
# Google Calendar
export GOOGLE_CLIENT_ID="your_production_client_id"
export GOOGLE_CLIENT_SECRET="your_production_client_secret"
export GOOGLE_REDIRECT_URI="https://getitdone.app/api/calendar/google/callback"

# Microsoft Outlook
export MICROSOFT_CLIENT_ID="your_production_client_id"
export MICROSOFT_CLIENT_SECRET="your_production_client_secret"
export MICROSOFT_REDIRECT_URI="https://getitdone.app/api/calendar/outlook/callback"

# Database
export DATABASE_URL="postgresql://user:password@host:5432/getitdone"

# Security
export SECRET_KEY="your_secret_key_here"
export ENCRYPTION_KEY="your_encryption_key_here"
```

### Production Checklist

- [ ] Set up HTTPS with valid SSL certificate
- [ ] Update OAuth redirect URIs to production domain
- [ ] Migrate from SQLite to PostgreSQL
- [ ] Implement credential encryption
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Enable CORS for frontend domain only
- [ ] Set up automated backups
- [ ] Implement error alerting (Sentry, etc.)
- [ ] Load test sync endpoints

---

## Frontend Integration

### React Component Example

```javascript
// Connect Google Calendar
const connectGoogleCalendar = async () => {
  const response = await fetch('/api/calendar/connect/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: currentUser.id })
  });
  
  const data = await response.json();
  
  // Redirect to Google OAuth
  window.location.href = data.authorization_url;
};

// Sync task to calendar when created
const createTask = async (taskData) => {
  // 1. Save task to Get It Done! database
  const task = await saveTask(taskData);
  
  // 2. Sync to calendar
  const syncResponse = await fetch('/api/calendar/task-to-calendar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: currentUser.id,
      task_data: {
        id: task.id,
        name: task.name,
        scheduled_time: task.scheduledTime,
        category: task.category,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    })
  });
  
  const syncData = await syncResponse.json();
  
  if (syncData.success) {
    // Store calendar event ID with task
    task.calendarEventId = syncData.event_id;
    await updateTask(task);
  }
};

// Sync calendar events to tasks (run on app load)
const syncCalendarToTasks = async () => {
  const response = await fetch('/api/calendar/calendar-to-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: currentUser.id })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Create tasks from calendar events
    for (const taskData of data.tasks) {
      await createTaskFromCalendar(taskData);
    }
  }
};
```

---

## Troubleshooting

### Issue: "No calendar connected" error

**Solution:**
1. Check connection status: `GET /connection-status/<user_id>`
2. If not connected, initiate connection flow
3. Verify OAuth credentials are correct

### Issue: Events not appearing in calendar

**Solution:**
1. Check sync history: `GET /sync-history/<user_id>`
2. Look for `sync_status: 'failed'` and `error_message`
3. Common causes:
   - Expired token (refresh or reconnect)
   - Invalid scheduled_time format (must be ISO 8601)
   - Missing timezone

### Issue: Duplicate events created

**Solution:**
1. Check if task already has `calendar_event_id`
2. If yes, call `PUT /update-event` instead of `POST /task-to-calendar`
3. Implement idempotency check in frontend

---

## Future Enhancements

### Phase 2 Features

1. **Real-time Sync via Webhooks**
   - Implement webhook handlers for Google/Outlook
   - Instant sync when events change in calendar
   - No need for manual "Refresh" button

2. **Conflict Resolution**
   - Handle cases where task and event are edited in both places
   - Show user diff and let them choose which to keep

3. **Multiple Calendar Support**
   - Allow user to connect multiple calendars
   - Choose which calendar for each task category
   - Example: Work tasks → Work calendar, Personal → Personal calendar

4. **Smart Scheduling**
   - Analyze calendar free/busy times
   - Suggest optimal task scheduling times
   - Avoid scheduling during meetings

5. **Recurring Tasks**
   - Support recurring events from calendar
   - Create recurring tasks in Get It Done!

---

## Support

For issues or questions:
- Check sync history for error messages
- Review logs in `/var/log/getitdone/calendar-sync.log`
- Contact: support@getitdone.app

---

**Version:** 1.0.0  
**Last Updated:** October 16, 2025  
**Get It Done! Development Team**

