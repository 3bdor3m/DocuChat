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
    // استخدام الموديل المحدد في الإعدادات أو العودة للنسخة المستقرة 1.5
    const modelName = config.geminiModel || 'gemini-1.5-flash';
    
    this.model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });
    console.log(`🤖 AI Service initialized with model: ${modelName}`);
  }

  // الوظيفة الرئيسية: توليد الرد
  async generateResponse(req: AIRequest) {
    try {
      const { fileId, userMessage, chatHistory } = req;
      
      const parts: Part[] = [];
      let hasFileContext = false;

      // 1. التعامل مع الملفات
      if (fileId) {
        const file = await prisma.file.findUnique({ where: { id: fileId } });
        
        if (file) {
          if (file.status === 'processing') {
            return {
              content: "عذراً، ما زلت أقوم بقراءة وتحليل الملف.. ⏳\nيرجى الانتظار بضع ثوانٍ ثم المحاولة مرة أخرى.",
              metadata: { hasFileContext: false }
            };
          }

          if (file.status === 'error') {
            return {
              content: `واجهت مشكلة في قراءة محتوى الملف. يرجى محاولة رفعه مرة أخرى.`,
              metadata: { hasFileContext: false }
            };
          }

          if (file.status === 'completed' && file.metadata) {
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
      }

      // 2. التعليمات
      const systemInstruction = `
        أنت مساعد ذكي متخصص في تحليل المستندات.
        ${hasFileContext 
          ? 'لديك ملف مرفق. أجب عن أسئلة المستخدم بناءً عليه بدقة.' 
          : 'أجب عن الأسئلة العامة بدقة واختصار.'}
      `;

      // 3. بناء السياق
      let fullPrompt = `${systemInstruction}\n\n`;
      chatHistory.slice(-5).forEach(msg => {
        const role = msg.messageType === 'user' ? 'المستخدم' : 'المساعد';
        fullPrompt += `${role}: ${msg.content}\n`;
      });
      fullPrompt += `المستخدم: ${userMessage}\nالمساعد:`;

      parts.push({ text: fullPrompt });

      // 4. الإرسال لـ Gemini (مع معالجة الأخطاء)
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

      // 🔥 معالجة خطأ الكوتة (429) بشكل خاص
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota exceeded')) {
        return {
          content: "عذراً، السيرفر مشغول جداً حالياً (تجاوزنا الحد المسموح من الطلبات 🚦). يرجى الانتظار دقيقة واحدة والمحاولة مجدداً.",
          metadata: { error: 'rate_limit' }
        };
      }

      throw new AppError('فشل في توليد الرد من الذكاء الاصطناعي', 500);
    }
  }
  
  async generateTitle(firstMessage: string): Promise<string> {
    try {
      // نستخدم نموذجاً أخف أو نفس النموذج لتوليد العنوان
      const result = await this.model.generateContent(`
        لخص الجملة التالية في عنوان (3-5 كلمات): "${firstMessage}"
      `);
      return result.response.text().trim();
    } catch (e) {
      // في حال الفشل، لا نوقف التطبيق، بل نعيد عنواناً افتراضياً
      return 'محادثة جديدة';
    }
  }
}

export const aiService = new AIService();