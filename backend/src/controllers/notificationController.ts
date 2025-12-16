import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

// Get all notifications for current user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 20, unreadOnly = 'false' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { userId };

    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      items: notifications,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new AppError('فشل جلب الإشعارات', 500);
  }
};

// Get unread count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw new AppError('فشل جلب عدد الإشعارات', 500);
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new AppError('الإشعار غير موجود', 404);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error marking notification as read:', error);
    throw new AppError('فشل تحديث الإشعار', 500);
  }
};

// Mark all as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'تم تحديث جميع الإشعارات' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw new AppError('فشل تحديث الإشعارات', 500);
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new AppError('الإشعار غير موجود', 404);
    }

    await prisma.notification.delete({ where: { id } });

    res.json({ message: 'تم حذف الإشعار' });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error deleting notification:', error);
    throw new AppError('فشل حذف الإشعار', 500);
  }
};

// Delete all read notifications
export const deleteAllRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    await prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });

    res.json({ message: 'تم حذف جميع الإشعارات المقروءة' });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    throw new AppError('فشل حذف الإشعارات', 500);
  }
};

// Helper function to create notification (used by other services)
export const createNotification = async (
  userId: string,
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message: string,
  metadata?: any
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata,
      },
    });

    // Emit socket event if available
    const io = (global as any).io;
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
