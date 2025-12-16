import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

// Create new chat
export const createChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { title, fileId, settings } = req.body;

    const chat = await prisma.chat.create({
      data: {
        userId,
        title: title || 'محادثة جديدة',
        fileId: fileId || null,
        settings: settings || { creativity_level: 50, search_mode: false },
      },
    });

    res.status(201).json(chat);
  } catch (error) {
    throw new AppError('خطأ في إنشاء المحادثة', 500);
  }
};

// Get all chats
export const getChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      prisma.chat.findMany({
        where: { userId },
        include: {
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.chat.count({ where: { userId } }),
    ]);

    const items = chats.map(chat => ({
      id: chat.id,
      title: chat.title,
      fileId: chat.fileId,
      messageCount: chat._count.messages,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    }));

    res.json({
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    throw new AppError('خطأ في جلب المحادثات', 500);
  }
};

// Get chat by ID
export const getChatById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.userId;

    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new AppError('المحادثة غير موجودة', 404);
    }

    res.json(chat);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في جلب المحادثة', 500);
  }
};

// Update chat
export const updateChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.userId;
    const { title, settings } = req.body;

    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new AppError('المحادثة غير موجودة', 404);
    }

    const updated = await prisma.chat.update({
      where: { id: chatId },
      data: {
        ...(title && { title }),
        ...(settings && { settings }),
      },
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في تحديث المحادثة', 500);
  }
};

// Delete chat
export const deleteChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.userId;

    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new AppError('المحادثة غير موجودة', 404);
    }

    await prisma.chat.delete({ where: { id: chatId } });

    res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في حذف المحادثة', 500);
  }
};
