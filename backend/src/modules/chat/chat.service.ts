import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/utils/AppError.js';
import { aiService } from '../ai/ai.service.js';

const prisma = new PrismaClient();

export class ChatService {
  
  async createChat(userId: string, fileId?: string | null) {
    return await prisma.chat.create({
      data: {
        userId,
        fileId: fileId || null,
        title: 'محادثة جديدة',
      },
    });
  }

  async getUserChats(userId: string) {
    return await prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { 
        file: { select: { originalFilename: true } } 
      }
    });
  }

  async getChat(chatId: string, userId: string) {
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: { 
        messages: { orderBy: { createdAt: 'asc' } },
        file: true 
      },
    });
    if (!chat) throw new AppError('المحادثة غير موجودة', 404);
    return chat;
  }

  // 🔥 التعديل هنا: إضافة temperature كمعامل اختياري
  async sendMessage(chatId: string, userId: string, content: string, temperature?: number) {
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: { messages: true }, 
    });

    if (!chat) throw new AppError('المحادثة غير موجودة', 404);

    const userMsg = await prisma.message.create({
      data: {
        chatId,
        content,
        messageType: 'user',
      },
    });

    if (chat.messages.length === 0) {
      const newTitle = await aiService.generateTitle(content);
      await prisma.chat.update({
        where: { id: chatId },
        data: { title: newTitle },
      });
    }

    // 🔥 نمرر درجة الإبداع للخدمة
    const aiResponse = await aiService.generateResponse({
      chatId,
      fileId: chat.fileId,
      userMessage: content,
      chatHistory: chat.messages,
      temperature, // تمرير القيمة
    });

    const botMsg = await prisma.message.create({
      data: {
        chatId,
        content: aiResponse.content,
        messageType: 'bot',
        metadata: aiResponse.metadata || {},
      },
    });

    await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
    });

    return { userMsg, botMsg };
  }

  async deleteChat(chatId: string, userId: string) {
    const chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
    if (!chat) throw new AppError('المحادثة غير موجودة', 404);
    await prisma.chat.delete({ where: { id: chatId } });
  }
}

export const chatService = new ChatService();