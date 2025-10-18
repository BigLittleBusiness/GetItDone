const bcrypt = require('bcryptjs');
const prisma = require('../utils/db');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { email, password, name, roles, primaryRole, experienceLevel, motivationStyle, isAutistic } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        roles: JSON.stringify(roles || []),
        primaryRole: primaryRole || null,
        experienceLevel: experienceLevel || null,
        motivationStyle: motivationStyle || 'positive',
        isAutistic: isAutistic || false,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Return user data (without password hash)
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      user: {
        ...userWithoutPassword,
        roles: JSON.parse(user.roles),
        interests: JSON.parse(user.interests),
        gamingPreferences: JSON.parse(user.gamingPreferences),
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    // Return user data (without password hash)
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.json({
      user: {
        ...userWithoutPassword,
        roles: JSON.parse(user.roles),
        interests: JSON.parse(user.interests),
        gamingPreferences: JSON.parse(user.gamingPreferences),
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Generate new access token
    const accessToken = generateAccessToken({ userId: payload.userId, email: payload.email });

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        primaryRole: true,
        experienceLevel: true,
        motivationStyle: true,
        isAutistic: true,
        educationLevel: true,
        childAge: true,
        isCoParenting: true,
        industry: true,
        interests: true,
        gamingPreferences: true,
        calendarApp: true,
        notificationFreq: true,
        tasksCompleted: true,
        currentStreak: true,
        longestStreak: true,
        lastTaskDate: true,
        totalPoints: true,
        onboardingComplete: true,
        tourComplete: true,
        checklistDismissed: true,
        calendarConnected: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      ...user,
      roles: JSON.parse(user.roles),
      interests: JSON.parse(user.interests),
      gamingPreferences: JSON.parse(user.gamingPreferences),
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updates = {};
    
    // Only update fields that are provided
    const allowedFields = [
      'name', 'roles', 'primaryRole', 'experienceLevel', 'motivationStyle', 'isAutistic',
      'educationLevel', 'childAge', 'isCoParenting', 'industry', 'interests', 'gamingPreferences',
      'calendarApp', 'notificationFreq', 'onboardingComplete', 'tourComplete', 'checklistDismissed',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'roles' || field === 'interests' || field === 'gamingPreferences') {
          updates[field] = JSON.stringify(req.body[field]);
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updates,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.json({
      ...userWithoutPassword,
      roles: JSON.parse(user.roles),
      interests: JSON.parse(user.interests),
      gamingPreferences: JSON.parse(user.gamingPreferences),
    });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  refresh,
  getMe,
  updateMe,
};

