# Get It Done! Deployment Guide

**Production-Ready Deployment Configuration**

---

## Overview

This guide covers deploying Get It Done! to production using:
- **Frontend:** Vercel (React app)
- **Backend:** Railway or Render (Node.js API)
- **Database:** PostgreSQL (included with Railway/Render)
- **Domain:** Custom domain (optional)

---

## Prerequisites

- GitHub account with Get It Done! repository
- Vercel account (free tier available)
- Railway or Render account (free tier available)
- Google Cloud Console account (for Google Calendar OAuth)
- Microsoft Azure account (for Outlook OAuth)

---

## Part 1: Backend Deployment (Railway)

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose `BigLittleBusiness/GetItDone`
5. Select `/backend` as root directory

### Step 2: Add PostgreSQL Database

1. Click "New" → "Database" → "PostgreSQL"
2. Railway automatically creates database
3. Copy `DATABASE_URL` from database variables

### Step 3: Configure Environment Variables

Add these variables in Railway dashboard:

```
DATABASE_URL=(automatically set by Railway)
JWT_SECRET=(generate with: openssl rand -base64 32)
JWT_REFRESH_SECRET=(generate with: openssl rand -base64 32)
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=(from Google Cloud Console)
GOOGLE_CLIENT_SECRET=(from Google Cloud Console)
GOOGLE_REDIRECT_URI=https://your-api.railway.app/api/calendar/google/callback
MICROSOFT_CLIENT_ID=(from Azure Portal)
MICROSOFT_CLIENT_SECRET=(from Azure Portal)
MICROSOFT_REDIRECT_URI=https://your-api.railway.app/api/calendar/outlook/callback
```

### Step 4: Deploy

1. Railway automatically deploys on push to main
2. Wait for build to complete
3. Note your API URL: `https://your-project.railway.app`

### Step 5: Run Database Migrations

```bash
# In Railway dashboard, open terminal
pnpm prisma db push
```

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import `BigLittleBusiness/GetItDone`
4. Set root directory to `/get-it-done-app`
5. Framework preset: Vite

### Step 2: Configure Environment Variables

Add in Vercel dashboard:

```
VITE_API_URL=https://your-project.railway.app/api
VITE_GOOGLE_CLIENT_ID=(same as backend)
VITE_MICROSOFT_CLIENT_ID=(same as backend)
```

### Step 3: Deploy

1. Click "Deploy"
2. Vercel builds and deploys automatically
3. Note your app URL: `https://your-app.vercel.app`

### Step 4: Update Backend CORS

Go back to Railway and update:
```
FRONTEND_URL=https://your-app.vercel.app
```

---

## Part 3: Google Calendar OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project: "Get It Done"
3. Enable Google Calendar API

### Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in:
   - App name: Get It Done!
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. Add test users (your email)

### Step 3: Create OAuth Credentials

1. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
2. Application type: Web application
3. Name: Get It Done Web
4. Authorized redirect URIs:
   - `http://localhost:3001/api/calendar/google/callback` (dev)
   - `https://your-project.railway.app/api/calendar/google/callback` (prod)
5. Copy Client ID and Client Secret

### Step 4: Add to Environment Variables

Update Railway and Vercel with your Google credentials.

---

## Part 4: Microsoft Outlook OAuth Setup

### Step 1: Register App in Azure

1. Go to [portal.azure.com](https://portal.azure.com)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Name: Get It Done
5. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
6. Redirect URI: Web, `https://your-project.railway.app/api/calendar/outlook/callback`

### Step 2: Configure API Permissions

1. Go to "API permissions" → "Add a permission"
2. Select "Microsoft Graph"
3. Choose "Delegated permissions"
4. Add:
   - `Calendars.ReadWrite`
   - `offline_access`
5. Grant admin consent

### Step 3: Create Client Secret

1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Description: Production
4. Expires: 24 months
5. Copy the secret value (only shown once!)

### Step 4: Add to Environment Variables

Update Railway and Vercel with your Microsoft credentials.

---

## Part 5: Custom Domain (Optional)

### Frontend Domain

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your domain: `getitdone.app`
3. Add DNS records as instructed by Vercel
4. Wait for SSL certificate (automatic)

### Backend Domain

1. In Railway dashboard, go to "Settings" → "Domains"
2. Add custom domain: `api.getitdone.app`
3. Add CNAME record pointing to Railway
4. Update all environment variables with new domain

---

## Part 6: Post-Deployment Checklist

### Backend

- [ ] API responds at `/health` endpoint
- [ ] Database connection working
- [ ] User registration works
- [ ] JWT authentication works
- [ ] Tasks CRUD operations work
- [ ] Calendar OAuth redirects work
- [ ] CORS allows frontend domain

### Frontend

- [ ] App loads without errors
- [ ] Onboarding flow works
- [ ] Login/logout works
- [ ] Dashboard loads tasks
- [ ] Task creation works
- [ ] Calendar connection button works
- [ ] No console errors

### Security

- [ ] JWT secrets are strong (32+ characters)
- [ ] Environment variables not committed to Git
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS restricted to frontend domain only
- [ ] Rate limiting enabled
- [ ] Database backups configured

---

## Monitoring & Maintenance

### Railway Monitoring

- View logs in Railway dashboard
- Set up alerts for errors
- Monitor database usage
- Check response times

### Vercel Analytics

- Enable Vercel Analytics (free)
- Monitor page load times
- Track user visits
- Check build success rate

### Error Tracking (Optional)

Add Sentry for error tracking:

```bash
# Backend
pnpm add @sentry/node

# Frontend
pnpm add @sentry/react
```

---

## Scaling

### Database

- Railway free tier: 500MB storage
- Upgrade to Pro: $5/month for 8GB
- Add read replicas for high traffic

### Backend

- Railway auto-scales based on traffic
- Add Redis for caching (optional)
- Enable CDN for static assets

### Frontend

- Vercel auto-scales globally
- No configuration needed
- Automatic edge caching

---

## Costs

### Free Tier (Sufficient for MVP)

- Vercel: Free (100GB bandwidth/month)
- Railway: $5/month credit (includes PostgreSQL)
- **Total: ~$0-5/month**

### Paid Tier (For Growth)

- Vercel Pro: $20/month (1TB bandwidth)
- Railway Pro: $20/month (8GB database)
- **Total: ~$40/month**

---

## Rollback Procedure

### Backend (Railway)

1. Go to "Deployments"
2. Find previous working deployment
3. Click "Redeploy"

### Frontend (Vercel)

1. Go to "Deployments"
2. Find previous working deployment
3. Click "Promote to Production"

---

## Troubleshooting

### "CORS Error" in Browser

- Check `FRONTEND_URL` in backend env vars
- Verify frontend domain matches exactly
- Check for trailing slashes

### "Database Connection Failed"

- Verify `DATABASE_URL` is set
- Check database is running in Railway
- Run `pnpm prisma db push` to sync schema

### "OAuth Redirect Mismatch"

- Verify redirect URIs in Google/Microsoft consoles
- Check they match backend env vars exactly
- Include `https://` protocol

### "Build Failed" on Vercel

- Check build logs for errors
- Verify all dependencies in package.json
- Check Node version compatibility

---

## CI/CD Pipeline

### Automatic Deployments

Both Vercel and Railway deploy automatically on push to main:

1. Push code to GitHub
2. Vercel builds frontend
3. Railway builds backend
4. Both deploy if builds succeed

### Manual Deployments

```bash
# Frontend (Vercel CLI)
cd get-it-done-app
vercel --prod

# Backend (Railway CLI)
cd backend
railway up
```

---

## Backup Strategy

### Database Backups

Railway automatically backs up PostgreSQL:
- Daily backups retained for 7 days
- Manual backups available anytime

### Code Backups

- GitHub is primary source of truth
- Tag releases: `git tag v1.0.0`
- Keep production branch separate from main

---

## Security Best Practices

1. **Rotate secrets regularly** (every 90 days)
2. **Monitor failed login attempts**
3. **Enable 2FA on all accounts** (GitHub, Vercel, Railway)
4. **Review OAuth scopes** (request minimum necessary)
5. **Update dependencies** (monthly security patches)
6. **Set up alerts** for unusual activity

---

## Next Steps After Deployment

1. **Test thoroughly** - Complete user journey
2. **Monitor for 24 hours** - Watch for errors
3. **Soft launch** - Invite beta users
4. **Gather feedback** - Fix critical bugs
5. **Announce launch** - Marketing push
6. **Scale as needed** - Upgrade plans when limits reached

---

## Support Resources

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Google OAuth:** https://developers.google.com/identity
- **Microsoft Graph:** https://docs.microsoft.com/graph

---

## Files Created

- `/backend/vercel.json` - Vercel config (alternative to Railway)
- `/backend/railway.json` - Railway config
- `/backend/Dockerfile` - Docker config (alternative deployment)
- `/backend/.env.production.example` - Production env template
- `/get-it-done-app/vercel.json` - Frontend Vercel config

---

## Estimated Deployment Time

- **Backend setup:** 30 minutes
- **Frontend setup:** 15 minutes
- **OAuth configuration:** 45 minutes
- **Testing:** 30 minutes
- **Total:** ~2 hours

---

## Production Checklist

- [ ] Backend deployed to Railway
- [ ] Database created and migrated
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Google OAuth configured
- [ ] Microsoft OAuth configured
- [ ] Custom domains configured (optional)
- [ ] SSL certificates active
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] End-to-end testing complete
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

**Your Get It Done! app is now live! 🎉**

