import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as authController from '../controllers/authController';
import * as taskController from '../controllers/taskController';
import * as statsController from '../controllers/statsController';

const router = Router();

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);
router.get('/auth/me', authenticate, authController.getMe);
router.put('/auth/me', authenticate, authController.updateMe);

// Task routes
router.get('/tasks', authenticate, taskController.getTasks);
router.post('/tasks', authenticate, taskController.createTask);
router.get('/tasks/today', authenticate, taskController.getTodayTasks);
router.get('/tasks/week', authenticate, taskController.getWeekTasks);
router.get('/tasks/:id', authenticate, taskController.getTask);
router.put('/tasks/:id', authenticate, taskController.updateTask);
router.delete('/tasks/:id', authenticate, taskController.deleteTask);
router.post('/tasks/:id/complete', authenticate, taskController.completeTask);
router.post('/tasks/:id/uncomplete', authenticate, taskController.uncompleteTask);

// Stats routes
router.get('/stats', authenticate, statsController.getStats);
router.get('/stats/streak', authenticate, statsController.getStreak);
router.get('/achievements', authenticate, statsController.getAchievements);
router.post('/achievements/check', authenticate, statsController.checkAchievements);

export default router;

