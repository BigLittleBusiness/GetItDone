const prisma = require('../utils/db');

const getStats = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        tasksCompleted: true,
        currentStreak: true,
        longestStreak: true,
        lastTaskDate: true,
        totalPoints: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get this week's stats
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekTasks = await prisma.task.findMany({
      where: {
        userId: req.user.userId,
        completedAt: {
          gte: weekAgo,
        },
      },
    });

    const weekCompleted = weekTasks.filter(t => t.completed).length;
    const weekTotal = weekTasks.length;
    const completionRate = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

    // Calculate time saved (assuming 5 min per task)
    const timeSaved = Math.round((weekCompleted * 5) / 60 * 10) / 10; // hours

    res.json({
      tasksCompleted: user.tasksCompleted,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastTaskDate: user.lastTaskDate,
      totalPoints: user.totalPoints,
      thisWeek: {
        completed: weekCompleted,
        total: weekTotal,
        completionRate,
        timeSaved,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStreak = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastTaskDate: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determine milestone emojis
    const emojis = [];
    if (user.currentStreak >= 7) emojis.push('🔥');
    if (user.currentStreak >= 30) emojis.push('⭐');
    if (user.currentStreak >= 100) emojis.push('🏆');

    // Determine celebration message
    let message = '';
    if (user.currentStreak === 7) message = '🎆 One week streak! Keep it up!';
    else if (user.currentStreak === 30) message = '🎆 One month streak! Amazing!';
    else if (user.currentStreak === 100) message = '🎆 100 day streak! Legendary!';

    res.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastTaskDate: user.lastTaskDate,
      emojis,
      message,
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAchievements = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const achievements = await prisma.achievement.findMany({
      where: { userId: req.user.userId },
      orderBy: { unlockedAt: 'desc' },
    });

    // Get user stats to determine available achievements
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Define achievement types
    const achievementTypes = [
      { type: 'streak_7', name: 'Early Bird', emoji: '🏆', requirement: user.currentStreak >= 7 },
      { type: 'streak_30', name: 'Dedicated', emoji: '⭐', requirement: user.currentStreak >= 30 },
      { type: 'streak_100', name: 'Legendary', emoji: '👑', requirement: user.currentStreak >= 100 },
      { type: 'tasks_10', name: 'Getting Started', emoji: '🎯', requirement: user.tasksCompleted >= 10 },
      { type: 'tasks_50', name: 'Productive', emoji: '💪', requirement: user.tasksCompleted >= 50 },
      { type: 'tasks_100', name: 'Powerhouse', emoji: '⚡', requirement: user.tasksCompleted >= 100 },
    ];

    const result = achievementTypes.map(at => {
      const unlocked = achievements.find(a => a.achievementType === at.type);
      return {
        type: at.type,
        name: at.name,
        emoji: at.emoji,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt || null,
        progress: at.requirement ? 100 : 0,
      };
    });

    res.json({ achievements: result });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const checkAchievements = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newAchievements = [];

    // Check streak achievements
    const streakChecks = [
      { type: 'streak_7', requirement: user.currentStreak >= 7 },
      { type: 'streak_30', requirement: user.currentStreak >= 30 },
      { type: 'streak_100', requirement: user.currentStreak >= 100 },
    ];

    for (const check of streakChecks) {
      if (check.requirement) {
        const existing = await prisma.achievement.findUnique({
          where: {
            userId_achievementType: {
              userId: req.user.userId,
              achievementType: check.type,
            },
          },
        });

        if (!existing) {
          const achievement = await prisma.achievement.create({
            data: {
              userId: req.user.userId,
              achievementType: check.type,
            },
          });
          newAchievements.push(achievement);
        }
      }
    }

    // Check task count achievements
    const taskChecks = [
      { type: 'tasks_10', requirement: user.tasksCompleted >= 10 },
      { type: 'tasks_50', requirement: user.tasksCompleted >= 50 },
      { type: 'tasks_100', requirement: user.tasksCompleted >= 100 },
    ];

    for (const check of taskChecks) {
      if (check.requirement) {
        const existing = await prisma.achievement.findUnique({
          where: {
            userId_achievementType: {
              userId: req.user.userId,
              achievementType: check.type,
            },
          },
        });

        if (!existing) {
          const achievement = await prisma.achievement.create({
            data: {
              userId: req.user.userId,
              achievementType: check.type,
            },
          });
          newAchievements.push(achievement);
        }
      }
    }

    res.json({ newAchievements });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getStats,
  getStreak,
  getAchievements,
  checkAchievements,
};

