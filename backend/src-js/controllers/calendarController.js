const { google } = require('googleapis');
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const prisma = require('../utils/db');

// Google Calendar OAuth
const getGoogleOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/calendar/google/callback'
  );
};

// Microsoft Graph OAuth
const getMicrosoftGraphClient = (accessToken) => {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
};

// Google Calendar: Get authorization URL
const getGoogleAuthUrl = (req, res) => {
  try {
    const oauth2Client = getGoogleOAuthClient();
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      state: req.user.userId, // Pass user ID in state
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Google auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
};

// Google Calendar: Handle OAuth callback
const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state; // User ID from state parameter

    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save connection to database
    await prisma.calendarConnection.create({
      data: {
        userId,
        provider: 'google',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expiry_date),
      },
    });

    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/settings?calendar=connected`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?calendar=error`);
  }
};

// Microsoft Outlook: Get authorization URL
const getOutlookAuthUrl = (req, res) => {
  try {
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${process.env.MICROSOFT_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3001/api/calendar/outlook/callback')}` +
      `&scope=${encodeURIComponent('Calendars.ReadWrite offline_access')}` +
      `&state=${req.user.userId}`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Outlook auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
};

// Microsoft Outlook: Handle OAuth callback
const outlookCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        code,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3001/api/calendar/outlook/callback',
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      throw new Error(tokens.error_description);
    }

    // Save connection to database
    await prisma.calendarConnection.create({
      data: {
        userId,
        provider: 'outlook',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    res.redirect(`${process.env.FRONTEND_URL}/settings?calendar=connected`);
  } catch (error) {
    console.error('Outlook callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?calendar=error`);
  }
};

// Get user's calendar connections
const getConnections = async (req, res) => {
  try {
    const connections = await prisma.calendarConnection.findMany({
      where: { userId: req.user.userId },
      select: {
        id: true,
        provider: true,
        createdAt: true,
        lastSyncedAt: true,
      },
    });

    res.json({ connections });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar connections' });
  }
};

// Disconnect calendar
const disconnect = async (req, res) => {
  try {
    const { connectionId } = req.params;

    // Verify connection belongs to user
    const connection = await prisma.calendarConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || connection.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    await prisma.calendarConnection.delete({
      where: { id: connectionId },
    });

    res.json({ message: 'Calendar disconnected successfully' });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect calendar' });
  }
};

// Sync tasks to calendar
const syncToCalendar = async (req, res) => {
  try {
    const { connectionId } = req.params;

    // Get connection
    const connection = await prisma.calendarConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || connection.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Get user's tasks with due dates
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.userId,
        dueDate: { not: null },
        completed: false,
      },
    });

    let syncedCount = 0;

    if (connection.provider === 'google') {
      const oauth2Client = getGoogleOAuthClient();
      oauth2Client.setCredentials({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      for (const task of tasks) {
        if (!task.calendarEventId) {
          // Create new calendar event
          const event = {
            summary: task.title,
            description: task.description,
            start: {
              dateTime: task.dueDate.toISOString(),
              timeZone: 'UTC',
            },
            end: {
              dateTime: new Date(task.dueDate.getTime() + (task.estimatedDuration || 30) * 60000).toISOString(),
              timeZone: 'UTC',
            },
          };

          const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
          });

          // Update task with calendar event ID
          await prisma.task.update({
            where: { id: task.id },
            data: { calendarEventId: response.data.id },
          });

          syncedCount++;
        }
      }
    } else if (connection.provider === 'outlook') {
      const graphClient = getMicrosoftGraphClient(connection.accessToken);

      for (const task of tasks) {
        if (!task.calendarEventId) {
          const event = {
            subject: task.title,
            body: {
              contentType: 'Text',
              content: task.description || '',
            },
            start: {
              dateTime: task.dueDate.toISOString(),
              timeZone: 'UTC',
            },
            end: {
              dateTime: new Date(task.dueDate.getTime() + (task.estimatedDuration || 30) * 60000).toISOString(),
              timeZone: 'UTC',
            },
          };

          const response = await graphClient.api('/me/events').post(event);

          await prisma.task.update({
            where: { id: task.id },
            data: { calendarEventId: response.id },
          });

          syncedCount++;
        }
      }
    }

    // Update last synced time
    await prisma.calendarConnection.update({
      where: { id: connectionId },
      data: { lastSyncedAt: new Date() },
    });

    res.json({ message: 'Sync completed', syncedCount });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Failed to sync calendar' });
  }
};

module.exports = {
  getGoogleAuthUrl,
  googleCallback,
  getOutlookAuthUrl,
  outlookCallback,
  getConnections,
  disconnect,
  syncToCalendar,
};

