import { Response } from 'express';
import prisma from '../utils/db';
import { AuthRequest } from '../middleware/auth';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { context, completed, limit = '50', offset = '0' } = req.query;

    const where: any = { userId: req.user.userId };
    
    if (context) {
      where.context = context as string;
    }
    
    if (completed !== undefined) {
      where.completed = completed === 'true';
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.task.count({ where });

    res.json({ tasks, total });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      title,
      description,
      context,
      category,
      priority,
      dueDate,
      estimatedDuration,
      createdVia,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = await prisma.task.create({
      data: {
        userId: req.user.userId,
        title,
        description: description || null,
        context: context || null,
        category: category || null,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedDuration: estimatedDuration || null,
        createdVia: createdVia || 'text',
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates: any = {};
    const allowedFields = [
      'title', 'description', 'context', 'category', 'priority',
      'dueDate', 'estimatedDuration', 'actualDuration', 'completed',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'dueDate' && req.body[field]) {
          updates[field] = new Date(req.body[field]);
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: updates,
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({ where: { id } });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const completeTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update task
    const task = await prisma.task.update({
      where: { id },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    });

    // Update user stats
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastTaskDate = user.lastTaskDate ? new Date(user.lastTaskDate) : null;
      let newStreak = user.currentStreak;

      if (!lastTaskDate || lastTaskDate < today) {
        // First task of the day
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastTaskDate && lastTaskDate.getTime() === yesterday.getTime()) {
          // Consecutive day
          newStreak = user.currentStreak + 1;
        } else if (!lastTaskDate || lastTaskDate < yesterday) {
          // Streak broken, start new
          newStreak = 1;
        }

        await prisma.user.update({
          where: { id: req.user.userId },
          data: {
            tasksCompleted: user.tasksCompleted + 1,
            currentStreak: newStreak,
            longestStreak: Math.max(user.longestStreak, newStreak),
            lastTaskDate: today,
            totalPoints: user.totalPoints + 10,
          },
        });
      } else {
        // Additional task today
        await prisma.user.update({
          where: { id: req.user.userId },
          data: {
            tasksCompleted: user.tasksCompleted + 1,
            totalPoints: user.totalPoints + 10,
          },
        });
      }
    }

    res.json(task);
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uncompleteTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Verify task belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        completed: false,
        completedAt: null,
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Uncomplete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTodayTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.userId,
        dueDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: [
        { completed: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get today tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWeekTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user.userId,
        dueDate: {
          gte: today,
          lt: nextWeek,
        },
      },
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { priority: 'desc' },
      ],
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get week tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

