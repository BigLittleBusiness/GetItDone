# Onboarding Flows by User Segment

This document details the complete onboarding experience for each main user segment, showing which steps they see and which are skipped based on their selections.

---

## User Segment 1: Student (Non-Autistic, Gaming Interest)

**Profile:** High school or university student who enjoys gaming and wants positive motivation.

### Step-by-Step Flow

**Step 1: User Type Selection**
- Progress: Step 1 of 12 (8%)
- Description: "Let's get started"
- Question: "Who is Get It Done! for?"
- Selection: **"Just me (Individual)"**
- Options: Individual vs. Team

**Step 2: Personal Information**
- Progress: Step 2 of 12 (17%)
- Description: "Tell us about yourself"
- Fields:
  - Full Name
  - Email
  - Password
- Required: All fields must be filled

**Step 3: Role Selection (Multi-select)**
- Progress: Step 3 of 12 (25%)
- Description: "Select your roles"
- Question: "What describes you?"
- Selection: **✓ Student**
- Tooltip: "💡 Why we're asking: We'll tailor your motivational messages and task categories to match your life stages. You can switch between contexts anytime!"
- Options: Student, Professional, Parent
- Can select multiple roles

**Step 4: Primary Role Selection**
- Progress: Step 4 of 12 (33%)
- Description: "Choose your primary focus"
- Question: "Which role is your main focus right now?"
- Selection: **Student**
- Shows only roles selected in Step 3

**Step 5: Student Details**
- Progress: Step 5 of 12 (42%)
- Description: "Student details"
- Question: "What level of education are you in?"
- Selection: **High School** (or Primary, University)
- Required for students

**Step 6: Autism Spectrum Question**
- Progress: Step 6 of 12 (50%)
- Description: "What interests you?"
- Question: "Communication preferences"
- Selection: **Not selected** (not on autism spectrum)
- Optional checkbox with explanation

**Step 7: Motivation Style**
- Progress: Step 7 of 12 (58%)
- Description: "Choose your motivation style"
- Question: "How do you like to be motivated?"
- Selection: **Positive & Encouraging**
- Tooltip: "💡 Why we're asking: Our AI generates 1000+ unique messages in your preferred style. You'll never see the same message twice for 6+ months!"
- Options:
  - Positive & Encouraging: "You've got this! Let's make it happen!"
  - Cheeky & Witty: "That task won't do itself. Unfortunately. Your turn!"
- Note: This step is shown because user is NOT autistic

**Step 8: Gaming Preferences**
- Progress: Step 8 of 12 (67%)
- Description: "Gaming preferences"
- Question: "What gaming elements motivate you?"
- Selections: **✓ Points & Levels**, **✓ Achievements**
- Options: Points & Levels, Achievements, Leaderboards, Challenges
- Note: This step is shown because user selected gaming interest in Step 6

**Step 9: Parent Details**
- Progress: SKIPPED
- Reason: User did not select "Parent" role in Step 3
- Jumps directly to Step 10

**Step 10: Professional Details**
- Progress: SKIPPED
- Reason: User did not select "Professional" role in Step 3
- Jumps directly to Step 11

**Step 11: Calendar Integration**
- Progress: Step 11 of 12 (92%)
- Description: "Calendar integration"
- Question: "Which calendar app do you use?"
- Selection: **Google Calendar**
- Options: Google Calendar, Apple Calendar, Outlook, None

**Step 12: Notification Preferences**
- Progress: Step 12 of 12 (100%)
- Description: "Notification preferences"
- Question: "How often should we remind you?"
- Selection: **Standard**
- Options: Minimal, Standard, Frequent
- Final step - shows "Complete" button

**Total Steps Seen:** 10 out of 12 (skipped Steps 9 and 10)

---

## User Segment 2: Professional (Real Estate, Cheeky Mode, Non-Gaming)

**Profile:** Real estate agent who wants cheeky motivation and doesn't care about gaming.

### Step-by-Step Flow

**Step 1: User Type Selection**
- Progress: Step 1 of 12 (8%)
- Description: "Let's get started"
- Selection: **"Just me (Individual)"**

**Step 2: Personal Information**
- Progress: Step 2 of 12 (17%)
- Description: "Tell us about yourself"
- Fields: Name, Email, Password

**Step 3: Role Selection**
- Progress: Step 3 of 12 (25%)
- Description: "Select your roles"
- Selection: **✓ Professional**
- Tooltip: "💡 Why we're asking: We'll tailor your motivational messages and task categories to match your life stages. You can switch between contexts anytime!"

**Step 4: Primary Role Selection**
- Progress: Step 4 of 12 (33%)
- Description: "Choose your primary focus"
- Selection: **Professional**

**Step 5: Student Details**
- Progress: SKIPPED
- Reason: User did not select "Student" role
- Jumps directly to Step 6

**Step 6: Interests Selection**
- Progress: Step 6 of 12 (50%)
- Description: "What interests you?"
- Question: "What are you interested in?"
- Selections: **✓ Fitness**, **✓ Reading** (NOT gaming)
- Options: Gaming, Fitness, Reading, Travel, etc.

**Step 7: Motivation Style**
- Progress: Step 7 of 12 (58%)
- Description: "Choose your motivation style"
- Selection: **Cheeky & Witty**
- Tooltip: "💡 Why we're asking: Our AI generates 1000+ unique messages in your preferred style. You'll never see the same message twice for 6+ months!"

**Step 8: Gaming Preferences**
- Progress: SKIPPED
- Reason: User did not select "gaming" in interests
- Jumps directly to Step 9

**Step 9: Parent Details**
- Progress: SKIPPED
- Reason: User did not select "Parent" role
- Jumps directly to Step 10

**Step 10: Professional Details**
- Progress: Step 10 of 12 (83%)
- Description: "Professional details"
- Question: "What industry are you in?"
- Selection: **Real Estate**
- Options: Real Estate, Sales, Other
- Helps tailor task categories and messages

**Step 11: Calendar Integration**
- Progress: Step 11 of 12 (92%)
- Description: "Calendar integration"
- Selection: **Google Calendar**

**Step 12: Notification Preferences**
- Progress: Step 12 of 12 (100%)
- Description: "Notification preferences"
- Selection: **Frequent** (real estate agents need lots of reminders!)

**Total Steps Seen:** 8 out of 12 (skipped Steps 5, 8, and 9)

---

## User Segment 3: Parent (Newborn, Autism-Friendly Mode)

**Profile:** New parent with a newborn baby, on the autism spectrum, needs clear communication.

### Step-by-Step Flow

**Step 1: User Type Selection**
- Progress: Step 1 of 12 (8%)
- Description: "Let's get started"
- Selection: **"Just me (Individual)"**

**Step 2: Personal Information**
- Progress: Step 2 of 12 (17%)
- Description: "Tell us about yourself"
- Fields: Name, Email, Password

**Step 3: Role Selection**
- Progress: Step 3 of 12 (25%)
- Description: "Select your roles"
- Selection: **✓ Parent**
- Tooltip: "💡 Why we're asking: We'll tailor your motivational messages and task categories to match your life stages. You can switch between contexts anytime!"

**Step 4: Primary Role Selection**
- Progress: Step 4 of 12 (33%)
- Description: "Choose your primary focus"
- Selection: **Parent**

**Step 5: Student Details**
- Progress: SKIPPED
- Reason: User did not select "Student" role
- Jumps directly to Step 6

**Step 6: Autism Spectrum Question**
- Progress: Step 6 of 12 (50%)
- Description: "What interests you?"
- Question: "Communication preferences"
- Selection: **✓ I am on the autism spectrum**
- Explanation: "We'll use clear, literal language and provide structured, predictable communication"
- Important: This selection affects Step 7

**Step 7: Autism-Friendly Mode Confirmation**
- Progress: Step 7 of 12 (58%)
- Description: "Choose your motivation style"
- Display: **Confirmation screen** (not a selection)
- Shows: Green checkmark icon
- Message: "Autism-friendly mode enabled. You'll receive clear, literal messages with no metaphors or sarcasm."
- Note: Motivation style is automatically set to "autism" - no selection needed
- User just clicks "Next" to continue

**Step 8: Gaming Preferences**
- Progress: SKIPPED (typically)
- Reason: Most parents with newborns don't select gaming interest
- Jumps directly to Step 9

**Step 9: Parent Details**
- Progress: Step 9 of 12 (75%)
- Description: "Parent details"
- Questions:
  - "How old is your child?" → **Newborn (0-3 months)**
  - "Are you co-parenting?" → **Yes/No**
- Options for child age: Newborn, Baby (3-12 months), Toddler, Preschool, School-age
- This information helps tailor self-care reminders and task suggestions

**Step 10: Professional Details**
- Progress: SKIPPED
- Reason: User did not select "Professional" role
- Jumps directly to Step 11

**Step 11: Calendar Integration**
- Progress: Step 11 of 12 (92%)
- Description: "Calendar integration"
- Selection: **Apple Calendar** (common for parents)

**Step 12: Notification Preferences**
- Progress: Step 12 of 12 (100%)
- Description: "Notification preferences"
- Selection: **Minimal** (parents with newborns are overwhelmed!)
- Note: In autism-friendly mode, notifications will be clear and predictable

**Total Steps Seen:** 8 out of 12 (skipped Steps 5, 8, and 10)

**Special Features for This User:**
- All messages will be literal and clear (no sarcasm, metaphors, or idioms)
- No cheeky or playful language
- Structured, predictable communication
- Self-care tasks will be emphasized (parent with newborn needs this!)

---

## User Segment 4: Multi-Role User (Student + Professional + Parent)

**Profile:** University student working part-time in sales with a school-age child. Wants positive motivation.

### Step-by-Step Flow

**Step 1: User Type Selection**
- Progress: Step 1 of 12 (8%)
- Description: "Let's get started"
- Selection: **"Just me (Individual)"**

**Step 2: Personal Information**
- Progress: Step 2 of 12 (17%)
- Description: "Tell us about yourself"
- Fields: Name, Email, Password

**Step 3: Role Selection (Multi-select)**
- Progress: Step 3 of 12 (25%)
- Description: "Select your roles"
- Selections: **✓ Student**, **✓ Professional**, **✓ Parent**
- Tooltip: "💡 Why we're asking: We'll tailor your motivational messages and task categories to match your life stages. You can switch between contexts anytime!"
- Note: This is the power of the app - context switching!

**Step 4: Primary Role Selection**
- Progress: Step 4 of 12 (33%)
- Description: "Choose your primary focus"
- Question: "Which role is your main focus right now?"
- Selection: **Student** (but can switch to Professional or Parent anytime in the app)
- Shows all three selected roles as options

**Step 5: Student Details**
- Progress: Step 5 of 12 (42%)
- Description: "Student details"
- Selection: **University**
- Required because user selected Student role

**Step 6: Interests Selection**
- Progress: Step 6 of 12 (50%)
- Description: "What interests you?"
- Selections: **✓ Fitness**, **✓ Family time** (not gaming)

**Step 7: Motivation Style**
- Progress: Step 7 of 12 (58%)
- Description: "Choose your motivation style"
- Selection: **Positive & Encouraging**
- Tooltip: "💡 Why we're asking: Our AI generates 1000+ unique messages in your preferred style. You'll never see the same message twice for 6+ months!"

**Step 8: Gaming Preferences**
- Progress: SKIPPED
- Reason: User did not select gaming interest
- Jumps directly to Step 9

**Step 9: Parent Details**
- Progress: Step 9 of 12 (75%)
- Description: "Parent details"
- Selections:
  - Child age: **School-age (5+ years)**
  - Co-parenting: **Yes**
- Required because user selected Parent role

**Step 10: Professional Details**
- Progress: Step 10 of 12 (83%)
- Description: "Professional details"
- Selection: **Sales**
- Required because user selected Professional role

**Step 11: Calendar Integration**
- Progress: Step 11 of 12 (92%)
- Description: "Calendar integration"
- Selection: **Google Calendar**

**Step 12: Notification Preferences**
- Progress: Step 12 of 12 (100%)
- Description: "Notification preferences"
- Selection: **Standard**

**Total Steps Seen:** 11 out of 12 (skipped only Step 8)

**Special Features for This User:**
- Can switch between Student, Professional, and Parent contexts in the dashboard
- Task categories adapt to current context
- Messages tailored to current role
- Self-care reminders for parent mode
- Work tasks for professional mode
- Study tasks for student mode

---

## User Segment 5: Team Manager (B2B)

**Profile:** Team manager at a company wanting to use Get It Done! for their team.

### Step-by-Step Flow

**Step 1: User Type Selection**
- Progress: Step 1 of 12 (8%)
- Description: "Let's get started"
- Selection: **"My team (Business/Organization)"**
- This changes the entire flow!

**Step 2: Personal Information**
- Progress: Step 2 of 12 (17%)
- Description: "Tell us about yourself"
- Fields: Name, Email, Password
- Note: This is the team admin account

**Step 3: Team Details** (Different from individual flow)
- Progress: Step 3 of 12 (25%)
- Description: "Tell us about your team"
- Questions:
  - Company name
  - Team size
  - Industry
- Required for team setup

**Step 4: Team Members** (Different from individual flow)
- Progress: Step 4 of 12 (33%)
- Description: "Add team members"
- Can add team member emails
- Can skip and add later

**Step 5-12: Team-Specific Configuration**
- Team motivation preferences
- Shared calendar integration
- Team notification settings
- Accountability features
- Leaderboard preferences

**Note:** The team flow is significantly different from the individual flow and focuses on team management, shared goals, and accountability features.

---

## Summary: Steps by User Segment

| Step | Description | Student | Professional | Parent | Multi-Role | Team |
|------|-------------|---------|--------------|--------|------------|------|
| 1 | User Type | ✓ | ✓ | ✓ | ✓ | ✓ |
| 2 | Personal Info | ✓ | ✓ | ✓ | ✓ | ✓ |
| 3 | Role Selection | ✓ | ✓ | ✓ | ✓ | Team Details |
| 4 | Primary Role | ✓ | ✓ | ✓ | ✓ | Team Members |
| 5 | Student Details | ✓ | ✗ | ✗ | ✓ | Team Config |
| 6 | Interests/Autism | ✓ | ✓ | ✓ | ✓ | Team Config |
| 7 | Motivation Style | ✓ | ✓ | Autism Mode | ✓ | Team Config |
| 8 | Gaming Prefs | ✓ | ✗ | ✗ | ✗ | Team Config |
| 9 | Parent Details | ✗ | ✗ | ✓ | ✓ | Team Config |
| 10 | Professional | ✗ | ✓ | ✗ | ✓ | Team Config |
| 11 | Calendar | ✓ | ✓ | ✓ | ✓ | ✓ |
| 12 | Notifications | ✓ | ✓ | ✓ | ✓ | ✓ |

**Legend:**
- ✓ = Step is shown
- ✗ = Step is skipped
- Autism Mode = Special confirmation screen instead of selection

---

## Key Onboarding Features

### Dynamic Step Skipping
- Gaming preferences (Step 8) only shown if user selects gaming interest
- Parent details (Step 9) only shown if user selects Parent role
- Professional details (Step 10) only shown if user selects Professional role
- Student details (Step 5) only shown if user selects Student role

### Autism-Friendly Adaptation
- If user selects "I am on the autism spectrum" in Step 6
- Step 7 becomes a confirmation screen (not a selection)
- Motivation style automatically set to "autism"
- All future messages will be literal and clear

### Multi-Role Support
- Users can select multiple roles in Step 3
- Step 4 asks for primary focus
- All selected roles get their detail steps
- Can switch contexts in the app after onboarding

### Progress Transparency
- Each step shows "Step X of 12" and percentage
- Step description provides context
- Tooltips explain why questions are asked
- Milestone markers show progress visually

### Estimated Completion Time
- Student (gaming): ~5-6 minutes (10 steps)
- Professional (non-gaming): ~4-5 minutes (8 steps)
- Parent (autism-friendly): ~4-5 minutes (8 steps)
- Multi-role: ~6-7 minutes (11 steps)
- Team: ~7-8 minutes (12 steps, different content)

