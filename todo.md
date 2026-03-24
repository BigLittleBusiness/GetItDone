# GetItDone! Project TODO

## Core Infrastructure
- [x] Full-stack project setup (React + tRPC + Express + Drizzle + MySQL)
- [x] Database schema: users (with gamification fields), tasks, achievements, survey_responses
- [x] tRPC routers: auth, user, tasks, achievements, survey
- [x] Deep Indigo brand theme (CSS variables, OKLCH colors)

## Landing Page
- [x] Hero section with animated gradient and tagline
- [x] Role Explorer component (Student / Parent / Professional)
- [x] Wall of Awful section (pain point storytelling)
- [x] Dopamine / gamification section
- [x] CTA / waitlist section
- [x] Feedback/survey modal (FeedbackModal) with 3-question flow
- [x] "Go to App" button for signed-in users in nav
- [x] Admin dashboard at /admin for survey data review

## Authentication & Onboarding
- [x] Manus OAuth authentication flow
- [x] 3-step onboarding: role selection → personality mode → sample tasks preview
- [x] Sample tasks seeded on onboarding completion
- [x] Redirect to dashboard after onboarding

## Dashboard & Task Management
- [x] Adaptive dashboard with role context switching (Student / Parent / Professional)
- [x] Task list with filter tabs (all / todo / done)
- [x] Add task dialog (title, notes, priority, energy level, due date)
- [x] Complete task with optimistic UI update
- [x] Delete task with optimistic UI update
- [x] Priority badges (high/medium/low) with colour coding
- [x] Energy level indicators (high/medium/low)
- [x] XP reward display per task

## Gamification
- [x] XP system: earn XP on task completion (high=20, medium=10, low=5)
- [x] Level computation (cumulative XP thresholds, 100*level per level)
- [x] XP progress bar in dashboard
- [x] Streak tracking (daily consecutive activity)
- [x] Longest streak tracking
- [x] 10 achievement types with unlock logic
- [x] Achievement toast notifications on unlock
- [x] XP flash animation on task completion

## Personality Modes
- [x] Cheeky mode: playful roast-style messages
- [x] Positive mode: warm encouragement
- [x] Literal mode: autism-friendly, no metaphors
- [x] Mode-specific empty state, completion, and streak messages
- [x] Settings dialog to change mode

## Tests
- [x] Auth logout test
- [x] Survey submit/getAll tests (6 tests)
- [x] Gamification unit tests: computeLevel, xpForLevel, xpProgress, computeStreak, XP rewards (18 tests)

## Future / Backlog
- [ ] Voice capture for task entry (Whisper API integration)
- [ ] AI task breakdown (sub-steps generation via LLM)
- [ ] Body Double mode (guided focus session)
- [ ] Calendar/schedule view
- [ ] Mobile-optimised layout improvements
- [ ] Dark mode toggle
- [ ] Push notifications for streak reminders

## New Features (In Progress)
- [x] AI task breakdown: Expand button on tasks calls LLM to generate 3-5 micro-steps
- [x] Streak reminder notifications: daily nudge if no task completed by a set time
- [x] Mobile floating Quick Add button with voice input on all pages

## Copy & UX Improvements
- [x] Replace "Wall of Awful" with positive, empowering language throughout the app
- [x] Rewrite survey pain-point answer labels to be empowering and non-dramatic
- [x] Add a For Parents & Carers section to the landing page
