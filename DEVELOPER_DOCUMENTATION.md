# Get It Done! - Developer Documentation

## Overview

Get It Done! is a motivation-driven productivity application built with React that provides personalized motivational messages to help users complete their tasks. The app features three distinct communication streams (Positive, Cheeky, and Autism-Friendly), gamification, calendar integration, and B2B team management capabilities.

## Technology Stack

- **Frontend Framework:** React 18+ with Vite
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router DOM
- **State Management:** React Hooks (useState, useEffect)
- **Data Storage:** LocalStorage (MVP), ready for backend integration
- **Voice Input:** Web Speech API (browser-native)

## Project Structure

```
get-it-done-app/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── LandingPage.jsx  # Marketing landing page
│   │   ├── Onboarding.jsx   # 10-step user onboarding
│   │   ├── Dashboard.jsx    # Main user dashboard
│   │   ├── TaskEntry.jsx    # Chat-based task entry
│   │   ├── Settings.jsx     # User settings
│   │   └── TeamDashboard.jsx # B2B team management
│   ├── lib/
│   │   └── motivationEngine.js # Message selection logic
│   ├── App.jsx              # Main app component with routing
│   ├── App.css              # Global styles
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── dist/                    # Build output
└── package.json             # Dependencies

```

## Core Features

### 1. User Onboarding (10 Steps)

**File:** `src/components/Onboarding.jsx`

**Steps:**
1. User type selection (Individual / Team)
2. Personal information (name, email, password)
3. Autism spectrum option
4. Motivation style (Positive / Cheeky / Adaptive)
5. Interests & themes selection
6. Gaming preferences (conditional on gaming interest)
7. Work context
8. Calendar app integration
9. Notification frequency
10. Confirmation

**Key Features:**
- Progress bar showing completion percentage
- Conditional rendering (gaming preferences only if gaming selected)
- Form validation before proceeding
- Data stored in user object

### 2. Motivational Messaging System

**File:** `src/lib/motivationEngine.js`

**Message Database Structure:**
```javascript
{
  positive: {
    general: [...],
    gaming: [...],
    mario: [...]
  },
  cheeky: {
    general: [...],
    gaming: [...],
    mario: [...]
  },
  autism: {
    general: [...]
  }
}
```

**Message Selection Algorithm:**
1. Determine user's motivation style (positive/cheeky/autism)
2. Build message pool from general + themed messages (based on interests)
3. Filter by context (dashboard_view, pre_task, morning_start, etc.)
4. Exclude previously seen messages (no-repeat logic)
5. Random selection from available pool
6. Log message ID to user's message history

**No-Repeat Logic:**
- Each message has unique ID
- User's `messageHistory` array tracks seen messages
- Messages filtered out if ID exists in history
- If all messages seen, pool resets automatically
- Keeps last 100 messages in history

**Current Message Count:** 100+ (expandable to 1,000+)

### 3. Dashboard

**File:** `src/components/Dashboard.jsx`

**Features:**
- Motivational message card with feedback (👍/👎)
- Quick actions (Add Task, View Tasks)
- Recent activity feed
- Streak counter with visual styling
- Progress thermometer (0-100 tasks)
- Achievement badges (stream-specific presentation)
- Donation CTA
- Team dashboard link (B2B users only)

**Gamification Presentation:**
- **Standard:** "Week Warrior", "Task Master", traditional badges
- **Cheeky:** "7-Day Survivor", "Actually Doing Things", playful language
- **Autism:** "7 days completed", "10 tasks completed", literal descriptions

### 4. Chat-Based Task Entry

**File:** `src/components/TaskEntry.jsx`

**Conversation Flow:**
1. **Initial:** App asks "What's on your plate today?"
2. **User describes task:** "Call 5 prospects"
3. **App asks for time:** "When do you want to tackle this?"
4. **User specifies time:** "This morning"
5. **App suggests category:** "I'm adding this to 'Work'. Sound good?"
6. **User confirms/changes:** "Yes" or "No, make it Personal"
7. **Task saved:** Confirmation message based on motivation style

**Features:**
- Voice input support (Web Speech API)
- Real-time message display
- Auto-category suggestion based on keywords
- Personality-driven responses matching user's motivation style
- Tasks saved to localStorage (ready for backend integration)

**Category Auto-Suggestion Logic:**
- Work: "call", "client", "meeting", "email", "prospect", "sale"
- Health: "gym", "workout", "exercise", "doctor", "health"
- Personal: "home", "family", "personal", "buy", "shop"
- Default: Based on user's work context or "General"

### 5. Settings

**File:** `src/components/Settings.jsx`

**General Settings (All Users):**
- Motivation style
- Interests & themes
- Notification frequency
- Calendar app integration

**Autism-Specific Settings (Conditional Display):**
- Visual effects (Full / Reduced / None)
- Sound enabled/disabled
- Vibration enabled/disabled
- Dark mode

**Conditional Rendering:**
- Autism settings only visible if `user.isAutistic === true`
- Settings saved to user object and localStorage
- Visual feedback on save ("Settings Saved!")

### 6. Team Dashboard (B2B)

**File:** `src/components/TeamDashboard.jsx`

**Features:**
- Team overview stats (active members, avg completion rate, total tasks, team streak)
- Anonymized individual performance tracking ("Team Member A", "Team Member B")
- Leaderboard (top performers by completion rate)
- Performance distribution (Excellent, Good, Fair, Needs Support)
- Engagement insights (most active day, peak hours, avg response time)

**Privacy:**
- All team members anonymized with letters (A, B, C, etc.)
- No personal information displayed
- Manager sees aggregated and individual stats without names

## Data Models

### User Object
```javascript
{
  id: string,
  userType: 'individual' | 'team',
  name: string,
  email: string,
  password: string,
  isAutistic: boolean,
  motivationStyle: 'positive' | 'cheeky' | 'adaptive',
  interests: string[], // ['gaming', 'sports', etc.]
  gamingPreferences: string[], // ['mario', 'zelda', etc.]
  workContext: string,
  calendarApp: 'google' | 'outlook' | 'apple' | 'other',
  notificationFrequency: 'light' | 'standard' | 'intense',
  visualEffects: 'full' | 'reduced' | 'none', // autism-specific
  soundEnabled: boolean,
  vibrationEnabled: boolean,
  darkMode: boolean,
  messageHistory: string[], // Array of message IDs
  tasks: Task[],
  stats: {
    tasksCompleted: number,
    currentStreak: number,
    longestStreak: number,
    totalPoints: number
  },
  createdAt: string
}
```

### Task Object
```javascript
{
  id: string,
  userId: string,
  name: string,
  time: string,
  category: 'Work' | 'Personal' | 'Health' | 'General',
  completed: boolean,
  createdAt: string
}
```

### Message Object
```javascript
{
  id: string, // e.g., 'pos_gen_001', 'chk_mar_003'
  text: string,
  context: string[], // ['dashboard_view', 'pre_task', etc.]
  theme?: string // 'gaming', 'mario', etc.
}
```

## Routing Structure

```
/ → LandingPage (or redirect to /dashboard if logged in)
/onboarding → Onboarding flow
/dashboard → Main dashboard (requires auth)
/tasks → Task entry chat interface (requires auth)
/settings → User settings (requires auth)
/team → Team dashboard (requires auth + userType === 'team')
```

## State Management

**Current Implementation:** React Context via localStorage

**User Session:**
- Stored in `localStorage` as `gitUser`
- Loaded on app initialization
- Updated on onboarding completion and settings changes
- Cleared on logout

**Tasks:**
- Stored in `localStorage` as `tasks_{userId}`
- Loaded per user
- Updated on task creation

**Message Feedback:**
- Stored in `localStorage` as `messageFeedback`
- Array of feedback objects with userId, messageId, isPositive, timestamp

## API Integration Points (Ready for Backend)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/stats` - Get user statistics

### Tasks
- `GET /api/tasks?userId=:id` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/complete` - Mark task complete

### Messages
- `GET /api/messages/motivational` - Get motivational message
- `POST /api/messages/feedback` - Record message feedback
- `GET /api/messages/stats` - Get message effectiveness stats

### Team (B2B)
- `GET /api/teams/:id` - Get team details
- `GET /api/teams/:id/members` - Get team members (anonymized)
- `GET /api/teams/:id/stats` - Get team statistics
- `POST /api/teams/:id/members` - Add team member

### Calendar Integration
- `POST /api/calendar/sync` - Sync with calendar app
- `GET /api/calendar/events` - Get calendar events
- `POST /api/calendar/events` - Create calendar event

## Styling System

**Tailwind CSS Configuration:**
- Custom color palette (indigo primary, supporting colors)
- Responsive breakpoints (sm, md, lg, xl)
- Custom animations (fade-in, pulse, spin)
- Dark mode support (via `dark:` prefix)

**shadcn/ui Theme:**
- CSS variables for colors (`--background`, `--foreground`, etc.)
- Border radius: `--radius: 0.625rem`
- Light and dark mode color schemes
- Consistent spacing and typography

## Voice Input Implementation

**Browser Support:** Chrome, Edge (Web Speech API)

**Implementation:**
```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()
recognition.continuous = false
recognition.interimResults = false

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript
  // Use transcript as input
}
```

**Features:**
- Toggle recording with mic button
- Visual feedback (recording indicator)
- Automatic transcription to text input
- Error handling for unsupported browsers

## Deployment

**Build Command:**
```bash
pnpm run build
```

**Output:** `dist/` directory with optimized static files

**Deployment Platform:** Manus deployment service (React framework)

**Environment Variables:** None required for MVP (uses localStorage)

## Future Enhancements

### Phase 2 (Months 4-6)
- Backend API integration (replace localStorage)
- Real calendar sync (Google, Outlook, Apple APIs)
- Advanced AI personalization
- Social sharing implementation
- A/B testing framework
- Message library expansion to 1,500+

### Phase 3 (Months 7-12)
- Deep workflow integrations (Slack, Teams, CRM)
- User-generated content program
- Premium features
- Vertical specialization (industry-specific content)
- International expansion (localization)
- Mobile apps (React Native)

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Lint code
pnpm run lint
```

## Testing Recommendations

### Unit Tests
- Message selection algorithm
- Category auto-suggestion logic
- Form validation
- User data persistence

### Integration Tests
- Onboarding flow completion
- Task creation and storage
- Message feedback recording
- Settings updates

### E2E Tests
- Complete user journey (signup → task creation → completion)
- Team dashboard workflows
- Voice input functionality
- Cross-browser compatibility

## Performance Optimization

**Current Optimizations:**
- Code splitting via React Router
- Lazy loading of components
- Memoization of expensive computations
- Optimized re-renders with proper key props

**Recommended:**
- Image optimization (WebP format)
- Bundle size analysis
- Service worker for offline support
- CDN for static assets

## Accessibility

**Current Implementation:**
- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals

**Autism-Friendly Features:**
- Literal, clear language option
- Reduced visual effects option
- Customizable sensory settings
- Predictable UI patterns

## Security Considerations

**Current:**
- Client-side only (localStorage)
- No sensitive data transmission

**Production Requirements:**
- HTTPS only
- Secure authentication (JWT or session-based)
- Input sanitization
- CSRF protection
- Rate limiting on API endpoints
- Data encryption at rest and in transit

## Browser Support

**Minimum Requirements:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Voice Input:**
- Chrome 90+ ✅
- Edge 90+ ✅
- Firefox ❌ (not supported)
- Safari ❌ (not supported)

## Known Limitations (MVP)

1. **No backend:** All data stored in localStorage (lost on browser clear)
2. **No real calendar sync:** Calendar integration UI only
3. **Limited message library:** 100+ messages (target: 1,000+)
4. **No user authentication:** Simple localStorage-based session
5. **No team collaboration:** Team dashboard is demo data
6. **Voice input browser-specific:** Only works in Chrome/Edge
7. **No mobile optimization:** Desktop-first design

## Contributing Guidelines

1. Follow existing code structure and naming conventions
2. Use TypeScript for new features (migration in progress)
3. Write unit tests for new functionality
4. Update documentation for API changes
5. Follow Tailwind CSS utility-first approach
6. Use shadcn/ui components for consistency
7. Maintain accessibility standards

## Support

For questions or issues:
- GitHub Issues: [Repository URL]
- Documentation: This file
- Email: [Support email]

---

**Last Updated:** October 14, 2025  
**Version:** 1.0.0 (MVP)  
**Maintainer:** Get It Done! Development Team

