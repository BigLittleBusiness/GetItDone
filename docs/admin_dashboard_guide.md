# Admin Dashboard Guide

## Overview

The Admin Dashboard is a comprehensive platform management interface for Get It Done! administrators. It provides tools for user management, content management, revenue tracking, and system configuration.

## Accessing the Admin Dashboard

**URL:** `/admin`

**Access Requirements:**
- User must be logged in
- User must have `isAdmin: true` in their user object

**How to Grant Admin Access:**
```javascript
// In localStorage or database, set:
user.isAdmin = true
```

**Admin Button Location:**
- Visible in the main Dashboard header (top right)
- Only appears for users with admin privileges
- Styled with indigo border and shield icon

---

## Dashboard Sections

### 1. Overview Tab

**Purpose:** High-level platform metrics and recent activity

**Key Metrics:**
- **Total Users** - All registered users
- **Active Users** - Users active in last 30 days
- **Monthly Revenue** - Recurring revenue this month
- **Retention Rate** - 30-day user retention percentage

**Platform Activity (Last 30 Days):**
- Messages Sent
- Tasks Completed
- Total Donations
- Active Teams

**Recent Signups:**
- Last 10 users registered
- Shows user ID, email, and account type

---

### 2. Users Tab

**Purpose:** Manage all platform users

**Features:**

**Search & Filter:**
- Search by name or email
- Real-time filtering
- Export user list to CSV

**User Table Columns:**
- User (name and email)
- Type (individual or team)
- Status (active or inactive)
- Tasks completed
- Current streak
- Account creation date
- Actions (Edit, Delete)

**User Actions:**
- **Add User** - Manually create new user account
- **Edit** - Modify user details, settings, or permissions
- **Delete** - Remove user account (with confirmation)
- **Export** - Download user list as CSV

**User Management Best Practices:**
- Review inactive users monthly
- Monitor high-performing users for case studies
- Track user growth trends
- Identify users who need support

---

### 3. Messages Tab

**Purpose:** Manage motivational message library

**Add New Message:**

**Fields:**
- **Category** - Positive, Cheeky, or Autism-Friendly
- **Theme** - General, Gaming, Super Mario, Sports, Work
- **Message Text** - The motivational statement
- **Context** - When to show (dashboard_view, pre_task, etc.)

**Message Library:**

**Displays:**
- Message ID (e.g., pos_gen_001)
- Category and theme badges
- Message text
- Usage count (how many times delivered)
- Edit and Delete actions

**Message Management Best Practices:**
- Maintain 1,000+ unique messages
- Balance categories (40% positive, 40% cheeky, 20% autism)
- Test new messages with A/B testing
- Remove low-performing messages (low feedback scores)
- Expand themed collections based on user interests

**Quality Control:**
For **Cheeky** messages, ensure they meet the standards:
- ✅ Actual personality and bite
- ✅ Genuinely funny and memorable
- ✅ Creates emotional response that drives action
- ✅ Shareable ("Check out what my app just said to me")
- ✅ Self-aware humor that respects user's intelligence

---

### 4. Revenue Tab

**Purpose:** Track donations and revenue

**Revenue Stats:**
- **Total Revenue** - All-time revenue
- **Monthly Recurring** - Recurring donations per month
- **Average Donation** - Per donor average

**Donations Table:**

**Columns:**
- User name
- Amount per month
- Frequency (monthly or one-time)
- Status (active, completed, cancelled)
- Date started

**Revenue Actions:**
- **Export** - Download revenue report as CSV
- **Filter** - By status, date range, amount

**Revenue Insights:**
- Track donation trends over time
- Identify top donors
- Monitor cancellation rates
- Calculate LTV (Lifetime Value) per user

**B2B Revenue (Future):**
- Team subscription tracking
- Volume discount management
- Invoice generation
- Payment processing

---

### 5. Settings Tab

**Purpose:** Configure platform-wide settings

**Available Settings:**

**Default Notification Frequency:**
- Light (2-3 per day)
- Standard (4-5 per day)
- Intense (6-7 per day)

**Minimum Message Pool Size:**
- Number of messages before allowing repeats
- Default: 1,000

**Message Repeat Threshold:**
- Days before a message can be shown again
- Default: 180 days (6 months)

**Maintenance Mode:**
- Enable/disable platform access
- Show maintenance message to users
- Useful for updates or emergency fixes

**Settings Best Practices:**
- Test setting changes in staging first
- Communicate changes to users
- Monitor impact on engagement metrics
- Document all configuration changes

---

## Admin Dashboard Features

### User Management

**View All Users:**
- Complete user list with search and filter
- Sort by registration date, activity, or streak
- Export to CSV for analysis

**Edit User:**
- Update user profile information
- Change motivation style or interests
- Grant/revoke admin privileges
- Reset password
- Adjust notification preferences

**Delete User:**
- Permanently remove user account
- Delete all associated data (tasks, messages, feedback)
- Confirmation required
- Log deletion for audit trail

**Add User:**
- Manually create user accounts
- Useful for team onboarding
- Set initial preferences
- Send welcome email

### Content Management

**Message Library:**
- 1,000+ motivational messages
- Organized by category and theme
- Track usage and effectiveness
- Add, edit, or delete messages

**Message Performance:**
- View feedback scores (👍/👎 ratio)
- Identify top-performing messages
- Remove low-performing content
- A/B test new messages

**Content Expansion:**
- Add new themes based on user interests
- Create seasonal content (holidays, events)
- Develop industry-specific messages
- Localize content for international users

### Analytics & Reporting

**Platform Metrics:**
- Total users, active users, growth rate
- Retention rate (30-day, 90-day)
- Engagement metrics (messages sent, tasks completed)
- Revenue metrics (MRR, ARR, LTV, churn)

**User Behavior:**
- Most popular motivation styles
- Most popular themes and interests
- Peak usage times
- Task completion rates

**Revenue Analytics:**
- Donation trends over time
- Average donation amount
- Donor retention rate
- Revenue per user

**Export Reports:**
- CSV export for all data tables
- Custom date ranges
- Filtered exports (e.g., active users only)

### System Administration

**Maintenance Mode:**
- Temporarily disable app access
- Show custom maintenance message
- Useful for updates, migrations, or emergencies

**Platform Settings:**
- Configure default user preferences
- Set message delivery rules
- Adjust gamification thresholds
- Manage notification frequency

**Security:**
- Admin access control
- Audit logs for sensitive actions
- User data privacy controls
- GDPR compliance tools

---

## Common Admin Tasks

### 1. Add New Motivational Messages

**Steps:**
1. Navigate to **Messages** tab
2. Click **Add New Motivational Message**
3. Select **Category** (Positive, Cheeky, Autism-Friendly)
4. Select **Theme** (General, Gaming, Mario, etc.)
5. Enter **Message Text**
6. Click **Add Message**

**Best Practice:** Add messages in batches of 50-100 to maintain variety

### 2. Review User Activity

**Steps:**
1. Navigate to **Users** tab
2. Use search to find specific user
3. Review stats (tasks, streak, status)
4. Click **Edit** to view full details

**Use Cases:**
- Identify power users for testimonials
- Support struggling users
- Investigate suspicious activity

### 3. Track Revenue

**Steps:**
1. Navigate to **Revenue** tab
2. Review revenue stats cards
3. Check donations table for details
4. Click **Export** for detailed report

**Metrics to Monitor:**
- Monthly recurring revenue (MRR)
- Donation cancellation rate
- Average donation per user
- Revenue growth rate

### 4. Manage Platform Settings

**Steps:**
1. Navigate to **Settings** tab
2. Adjust desired settings
3. Click **Save Settings**
4. Monitor impact on user engagement

**Important:** Test changes in staging before production

### 5. Export Data

**Available Exports:**
- User list (CSV)
- Revenue report (CSV)
- Message library (CSV)

**Steps:**
1. Navigate to desired tab
2. Click **Export** button
3. File downloads automatically

---

## Admin Permissions

**Current Implementation:**
- Single admin role (`isAdmin: true`)
- Full access to all features

**Future Enhancement:**
- Role-based access control (RBAC)
- Granular permissions (e.g., content manager, finance viewer)
- Audit logs for all admin actions

---

## Security Best Practices

1. **Limit Admin Access** - Only grant to trusted team members
2. **Use Strong Passwords** - Require 2FA for admin accounts
3. **Audit Regularly** - Review admin actions monthly
4. **Backup Data** - Before bulk deletions or changes
5. **Test Changes** - Use staging environment first

---

## Troubleshooting

### Admin Button Not Visible

**Cause:** User doesn't have admin privileges

**Solution:**
```javascript
// Set in localStorage or database
const user = JSON.parse(localStorage.getItem('gitUser'))
user.isAdmin = true
localStorage.setItem('gitUser', JSON.stringify(user))
// Refresh page
```

### Can't Access /admin Route

**Cause:** Not logged in or not admin

**Solution:**
1. Log in to the app
2. Ensure `user.isAdmin === true`
3. Navigate to `/admin` manually or click Admin button

### Data Not Loading

**Cause:** Mock data in MVP (no backend yet)

**Solution:**
- MVP uses hardcoded mock data
- Backend integration needed for real data
- See Developer Documentation for API endpoints

---

## Future Enhancements

### Phase 2 (Months 4-6)
- Real-time analytics dashboard
- Advanced user segmentation
- A/B testing framework
- Message performance analytics
- Automated reports (weekly, monthly)

### Phase 3 (Months 7-12)
- Role-based access control
- Team admin delegation (B2B)
- Custom dashboards per admin role
- Advanced fraud detection
- Integration with analytics tools (Google Analytics, Mixpanel)

---

## Admin Dashboard Metrics

**Key Performance Indicators (KPIs):**

**User Metrics:**
- Total users
- Active users (DAU, MAU)
- User growth rate
- Retention rate (30-day, 90-day)
- Churn rate

**Engagement Metrics:**
- Messages sent per user
- Tasks completed per user
- Average streak length
- Feedback rate (👍/👎 responses)

**Revenue Metrics:**
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Average Revenue Per User (ARPU)
- Lifetime Value (LTV)
- Churn rate

**Content Metrics:**
- Total messages in library
- Messages per category/theme
- Average message usage
- Message feedback scores

---

## Support

For admin dashboard issues or questions:
- **Email:** admin-support@getitdone.app
- **Documentation:** This guide
- **Developer Docs:** DEVELOPER_DOCUMENTATION.md

---

**Version:** 1.0.0  
**Last Updated:** October 14, 2025  
**Get It Done! Admin Team**

