import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateAIResponse } from '../services/aiService.js';

const prisma = new PrismaClient();

// Send message and get AI response
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    if (!content || !content.trim()) {
      throw new AppError('محتوى الرسالة مطلوب', 400);
    }

    // Verify chat ownership
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: { file: true },
    });

    if (!chat) {
      throw new AppError('المحادثة غير موجودة', 404);
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        messageType: 'user',
        content: content.trim(),
      },
    });

    // Get chat history for context
    const previousMessages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      take: 10, // Last 10 messages for context
    });

    // Generate AI response using Gemini Long Context
    const aiResponse = await generateAIResponse({
      chatId,
      fileId: chat.fileId,
      userMessage: content.trim(),
      chatHistory: previousMessages,
      settings: chat.settings as any,
    });

    // Save bot message
    const botMessage = await prisma.message.create({
      data: {
        chatId,
        messageType: 'bot',
        content: aiResponse.content,
        metadata: aiResponse.metadata,
      },
    });

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({
      userMessage: {
        id: userMessage.id,
        chatId: userMessage.chatId,
        messageType: userMessage.messageType,
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
      botMessage: {
        id: botMessage.id,
        chatId: botMessage.chatId,
        messageType: botMessage.messageType,
        content: botMessage.content,
        metadata: aiResponse.metadata,
        createdAt: botMessage.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error sending message:', error);
    throw new AppError('خطأ في إرسال الرسالة', 500);
  }
};

// Get messages for a chat
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify chat ownership
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new AppError('المحادثة غير موجودة', 404);
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: { chatId } }),
    ]);

    const items = messages.map(msg => ({
      id: msg.id,
      messageType: msg.messageType,
      content: msg.content,
      metadata: msg.metadata,
      createdAt: msg.createdAt,
    }));

    res.json({
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('خطأ في جلب الرسائل', 500);
  }
};
