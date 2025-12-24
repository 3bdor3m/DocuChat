import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/utils/AppError.js';
import { aiService } from '../ai/ai.service.js';

const prisma = new PrismaClient();

export class ChatService {
  
  // إنشاء محادثة جديدة
  async createChat(userId: string, fileId?: string | null) {
    return await prisma.chat.create({
      data: {
        userId,
        fileId: fileId || null,
        title: 'محادثة جديدة',
      },
    });
  }

  // جلب محادثات المستخدم
  async getUserChats(userId: string) {
    return await prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { 
        file: { select: { originalFilename: true } } // هنا نحن نختار الاسم فقط، لذا لا توجد مشكلة BigInt
      }
    });
  }

  // جلب محادثة واحدة بالتفصيل
  async getChat(chatId: string, userId: string) {
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: { 
        messages: { orderBy: { createdAt: 'asc' } },
        file: true // هنا المشكلة! هذا يجلب fileSize وهو BigInt
      },
    });

    if (!chat) throw new AppError('المحادثة غير موجودة', 404);

    // 🔥 الحل: تحويل BigInt إلى Number قبل الإرسال
    if (chat.file) {
      return {
        ...chat,
        file: {
          ...chat.file,
          fileSize: Number(chat.file.fileSize) // التحويل هنا
        }
      };
    }

    return chat;
  }

  // إرسال رسالة
  async sendMessage(chatId: string, userId: string, content: string) {
    // 1. التحقق من وجود المحادثة
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: { messages: true, file: true }, // نحتاج الملف أيضاً هنا لتمريره
    });

    if (!chat) throw new AppError('المحادثة غير موجودة', 404);

    // 2. حفظ رسالة المستخدم
    const userMsg = await prisma.message.create({
      data: {
        chatId,
        content,
        messageType: 'user',
      },
    });

    // 3. تحديث عنوان المحادثة إذا كانت الرسالة الأولى
    if (chat.messages.length === 0) {
      const newTitle = await aiService.generateTitle(content);
      await prisma.chat.update({
        where: { id: chatId },
        data: { title: newTitle },
      });
    }

    // 4. إرسال للذكاء الاصطناعي والحصول على الرد
    // نمرر fileId الموجود في المحادثة (الباك إند هو سيد الموقف الآن)
    const aiResponse = await aiService.generateResponse({
      chatId,
      fileId: chat.fileId, 
      userMessage: content,
      chatHistory: chat.messages,
    });

    // 5. حفظ رد البوت
    const botMsg = await prisma.message.create({
      data: {
        chatId,
        content: aiResponse.content,
        messageType: 'bot',
        metadata: aiResponse.metadata || {},
      },
    });

    // تحديث وقت المحادثة
    await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
    });

    return { userMsg, botMsg };
  }

  // حذف محادثة
  async deleteChat(chatId: string, userId: string) {
    const chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
    if (!chat) throw new AppError('المحادثة غير موجودة', 404);
    await prisma.chat.delete({ where: { id: chatId } });
  }
}

export const chatService = new ChatService();