import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/notifications - Get all notifications
router.get('/', getNotifications);

// GET /api/v1/notifications/unread-count - Get unread count
router.get('/unread-count', getUnreadCount);

// PUT /api/v1/notifications/:id/read - Mark as read
router.put('/:id/read', markAsRead);

// PUT /api/v1/notifications/read-all - Mark all as read
router.put('/read-all', markAllAsRead);

// DELETE /api/v1/notifications/:id - Delete notification
router.delete('/:id', deleteNotification);

// DELETE /api/v1/notifications/read - Delete all read
router.delete('/read', deleteAllRead);

export default router;
