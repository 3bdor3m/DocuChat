import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { config } from '../../config/index.js';
import { AppError } from '../../common/utils/AppError.js';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

interface AIRequest {
  chatId: string;
  fileId: string | null;
  userMessage: string;
  chatHistory: any[];
}

export class AIService {
  private model: any;

  constructor() {
    if (!config.geminiApiKey) {
      console.warn('⚠️ Gemini API Key missing!');
    }
    // إعداد النموذج
    this.model = genAI.getGenerativeModel({
      model: config.geminiModel || 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7, // توازن بين الإبداع والدقة
        maxOutputTokens: 2048,
      },
    });
  }

  // الوظيفة الرئيسية: توليد الرد
  async generateResponse(req: AIRequest) {
    try {
      const { fileId, userMessage, chatHistory } = req;
      
      const parts: Part[] = [];
      let hasFileContext = false;

      // 1. إذا كان هناك ملف، نجلبه من البيانات المخزنة
      if (fileId) {
        const file = await prisma.file.findUnique({ where: { id: fileId } });
        
        // نتأكد أن الملف تمت معالجته وله URI من Gemini
        if (file && file.status === 'completed' && file.metadata) {
          const metadata = file.metadata as any;
          if (metadata.geminiFileUri) {
            parts.push({
              fileData: {
                mimeType: metadata.geminiMimeType,
                fileUri: metadata.geminiFileUri,
              },
            });
            hasFileContext = true;
          }
        }
      }

      // 2. بناء تعليمات النظام (System Prompt)
      const systemInstruction = `
        أنت مساعد ذكي متخصص في تحليل المستندات.
        ${hasFileContext 
          ? 'لديك ملف مرفق. أجب عن أسئلة المستخدم بناءً عليه بدقة. إذا كانت المعلومة غير موجودة في الملف، قل ذلك بوضوح.' 
          : 'أجب عن الأسئلة العامة بدقة واختصار.'}
      `;

      // 3. دمج تاريخ المحادثة للسياق
      let fullPrompt = `${systemInstruction}\n\n`;
      
      // نأخذ آخر 5 رسائل فقط لتوفير التوكنز
      chatHistory.slice(-5).forEach(msg => {
        const role = msg.messageType === 'user' ? 'المستخدم' : 'المساعد';
        fullPrompt += `${role}: ${msg.content}\n`;
      });

      fullPrompt += `المستخدم: ${userMessage}\nالمساعد:`;

      // 4. إضافة النص للطلب
      parts.push({ text: fullPrompt });

      // 5. الإرسال لـ Gemini
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts }],
      });

      const response = result.response;
      return {
        content: response.text(),
        metadata: {
          model: config.geminiModel,
          hasFileContext,
        },
      };

    } catch (error: any) {
      console.error('AI Generation Error:', error);
      throw new AppError('فشل في توليد الرد من الذكاء الاصطناعي', 500);
    }
  }
  
  // وظيفة إضافية: اقتراح عنوان للمحادثة من أول رسالة
  async generateTitle(firstMessage: string): Promise<string> {
    try {
      const result = await this.model.generateContent(`
        لخص الجملة التالية في عنوان قصير جداً (3-5 كلمات) للمحادثة:
        "${firstMessage}"
        العنوان:
      `);
      return result.response.text().trim();
    } catch (e) {
      return 'محادثة جديدة';
    }
  }
}

export const aiService = new AIService();