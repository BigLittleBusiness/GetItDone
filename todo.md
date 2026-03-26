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
- [x] Add Parents & Carers link to top navigation
- [x] Soften hero subheading (remove combative "fighting" language)
- [x] Rewrite Shame-Free Zone card to use positive reinforcement framing
- [x] Rename "Dopamine on Demand" section heading to warmer alternative
- [x] Add "For Parents & Carers" to mobile hamburger menu
- [x] Full-page tone audit: rewrite any remaining negative or clinical copy
- [x] Add Whisper-based server-side voice transcription procedure
- [x] Build shared useVoiceInput hook (MediaRecorder + Whisper fallback)
- [x] Upgrade QuickAdd to use Whisper for full cross-browser voice input
- [x] Add microphone button to Dashboard task entry form
- [x] Step-level checkbox completion in AI task breakdown (persist checked steps via tasks.update)
- [x] Voice input mic button for the Notes field in the Add Task dialog
- [x] Create /settings page with role and personality mode dropdowns
- [x] Add dark mode toggle to Settings page with persistent theme preference
- [x] Add personalised daily streak reminder time picker to Settings page
- [x] Add timezone field to user profile (auto-detect from browser, persist to DB)
- [x] Update streak reminder job to fire at correct local time using user's timezone
- [ ] Add dueDate column to tasks table (schema + DB migration)
- [ ] Add due date picker to the Add Task dialog in Dashboard
- [ ] Build due-date reminder job (timezone-aware, fires at user's reminder time)
- [ ] Add due-date reminder time preference to Settings page
- [x] Add 'Due Today' / 'Due Tomorrow' / 'Overdue' visual chips to task cards in the dashboard
- [x] Sort tasks by urgency — overdue and due-today float to top of list
- [x] Inline due-date editing with calendar popover on task cards
- [x] 'Due This Week' filter tab showing tasks due within the next 7 days
- [x] Create Mission page for the marketing website
- [x] Create Pricing page at /pricing with free tier and upcoming paid tier
- [x] Fix guilt-inducing copy in Mission page Parents & Carers section — replace "never drop the ball again" line
- [x] Create 'For Parents & Carers' page at /parents
- [x] Add Open Graph and Twitter Card meta tags to all four marketing pages
- [x] Extract marketing nav bar into a shared MarketingNav component
- [x] Implement smooth scroll for anchor links on the homepage with fixed-nav offset
- [x] Add floating back-to-top button to all marketing pages
- [x] Extract marketing footer into a shared MarketingFooter component
- [x] Add robots.txt and sitemap.xml to client/public for search engine indexing
- [x] Implement cookie consent banner on all marketing pages
- [x] Add readingTheme column to users schema and migrate DB
- [x] Add updateReadingTheme tRPC procedure
- [x] Build Reading Theme CSS variables and apply globally in DashboardLayout
- [x] Add Reading Theme selector UI to Settings page
- [x] Add Reading Theme selection step to the end of the onboarding flow
- [x] Feature Reading Theme on the For Parents & Carers page as a key selling point
- [x] Create Privacy Policy page at /privacy and link from footer and cookie banner
- [x] Add Small/Medium/Large text-size toggle to Settings with per-user persistence
- [x] Add Text Size selection step to the onboarding flow
- [x] Create Terms of Service page at /terms and link from footer
- [x] Wire up bottom CTA email form on homepage to save emails to the database
- [x] Fire owner notification (Manus built-in) on every new waitlist signup
- [x] Strengthen admin login: replace hardcoded password with server-side secret
- [x] Rate-limit admin login: lock out IP after 5 incorrect attempts
- [x] Add task editing: edit dialog for title, notes, priority, energy level, and due date
- [x] Fill in Privacy Policy and Terms of Service with legal entity details
- [ ] Implement per-user email reminders via Resend (streak + due-date)
- [x] Add recurring tasks with ADHD-first design (after-completion trigger, roll-forward, daily/weekly/monthly/specific days)
