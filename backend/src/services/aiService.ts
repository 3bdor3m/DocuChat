import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';
import { getGeminiFileInfo } from './fileService.js';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

interface AIRequest {
  chatId: string;
  fileId: string | null;
  userMessage: string;
  chatHistory: any[];
  settings?: {
    creativity_level?: number;
    search_mode?: boolean;
  };
}

interface AIResponse {
  content: string;
  sources?: {
    fileContentId: string;
    relevanceScore: number;
  }[];
  metadata?: any;
}

/**
 * Generate AI response using Gemini with direct file context (Long Context approach)
 * This replaces the old RAG/embedding approach
 */
export const generateAIResponse = async (request: AIRequest): Promise<AIResponse> => {
  try {
    const { fileId, userMessage, chatHistory, settings } = request;

    // Check if Gemini API key is configured
    if (!config.geminiApiKey) {
      return {
        content: 'عذراً، لم يتم تكوين مفتاح API الخاص بـ Gemini. يرجى التواصل مع المسؤول.',
        metadata: {
          error: 'GEMINI_API_KEY not configured',
        },
      };
    }

    // Get the model with appropriate settings
    const model = genAI.getGenerativeModel({
      model: config.geminiModel,
      generationConfig: {
        temperature: (settings?.creativity_level || 50) / 100,
        maxOutputTokens: 8192,
        topP: 0.95,
        topK: 40,
      },
    });

    // Build the content parts for the request
    const parts: Part[] = [];
    let hasFileContext = false;

    // If there's a file associated with this chat, include it in the context
    if (fileId) {
      const geminiFileInfo = await getGeminiFileInfo(fileId);
      
      if (geminiFileInfo) {
        // Add the file as a part using its URI
        parts.push({
          fileData: {
            mimeType: geminiFileInfo.mimeType,
            fileUri: geminiFileInfo.uri,
          },
        });
        hasFileContext = true;
        console.log(`Including file in context: ${geminiFileInfo.uri}`);
      }
    }

    // Build conversation history for context
    const conversationHistory = buildConversationHistory(chatHistory);

    // Build the system instruction
    const systemInstruction = buildSystemInstruction(hasFileContext, settings);

    // Build the user prompt with conversation context
    let userPrompt = '';
    
    if (conversationHistory) {
      userPrompt += `سياق المحادثة السابقة:\n${conversationHistory}\n\n`;
    }
    
    userPrompt += `السؤال الحالي: ${userMessage}`;

    // Add the text prompt
    parts.push({ text: userPrompt });

    // Generate response
    console.log(`Generating response for: "${userMessage.substring(0, 50)}..."`);
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      systemInstruction: systemInstruction,
    });

    const response = result.response;
    const text = response.text();

    console.log(`Response generated successfully (${text.length} chars)`);

    return {
      content: text,
      metadata: {
        model: config.geminiModel,
        creativity_level: settings?.creativity_level || 50,
        hasFileContext,
        timestamp: new Date().toISOString(),
        promptTokens: response.usageMetadata?.promptTokenCount,
        responseTokens: response.usageMetadata?.candidatesTokenCount,
        totalTokens: response.usageMetadata?.totalTokenCount,
      },
    };

  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('SAFETY')) {
        return {
          content: 'عذراً، لا أستطيع الإجابة على هذا السؤال لأسباب تتعلق بالسلامة.',
          metadata: { error: 'safety_filter' },
        };
      }
      
      if (error.message.includes('quota') || error.message.includes('rate')) {
        return {
          content: 'عذراً، تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً.',
          metadata: { error: 'rate_limit' },
        };
      }

      if (error.message.includes('not found') || error.message.includes('expired')) {
        return {
          content: 'عذراً، يبدو أن الملف لم يعد متاحاً. يرجى إعادة رفع الملف.',
          metadata: { error: 'file_expired' },
        };
      }
    }

    throw new Error('فشل في توليد الرد من الذكاء الاصطناعي');
  }
};

/**
 * Build conversation history string from previous messages
 */
const buildConversationHistory = (chatHistory: any[]): string => {
  if (!chatHistory || chatHistory.length === 0) {
    return '';
  }

  // Take last 6 messages (3 exchanges) for context
  const recentMessages = chatHistory.slice(-6);
  
  return recentMessages
    .map(msg => {
      const role = msg.messageType === 'user' ? 'المستخدم' : 'المساعد';
      return `${role}: ${msg.content}`;
    })
    .join('\n\n');
};

/**
 * Build system instruction based on context
 */
const buildSystemInstruction = (hasFileContext: boolean, settings?: { creativity_level?: number; search_mode?: boolean }): string => {
  let instruction = `أنت مساعد ذكي متخصص في الإجابة على الأسئلة باللغة العربية.

قواعد الإجابة الأساسية:
1. أجب دائماً باللغة العربية بشكل واضح ومفصل
2. كن دقيقاً ومفيداً في إجاباتك
3. استخدم التنسيق المناسب (عناوين، قوائم، فقرات) لتنظيم الإجابة
4. إذا لم تكن متأكداً من شيء، قل ذلك بوضوح`;

  if (hasFileContext) {
    instruction += `

قواعد خاصة بالمستند المرفق:
5. المستند المرفق هو المصدر الرئيسي للمعلومات - استخدمه للإجابة على الأسئلة
6. إذا كان السؤال يتعلق بمحتوى المستند، أجب بناءً على ما هو موجود فيه فقط
7. إذا لم تجد الإجابة في المستند، قل ذلك بوضوح: "لم أجد هذه المعلومة في المستند المرفق"
8. يمكنك اقتباس أجزاء من المستند لدعم إجابتك
9. إذا كان السؤال عاماً ولا يتعلق بالمستند، يمكنك الإجابة من معرفتك العامة مع التوضيح`;
  } else {
    instruction += `

5. لا يوجد مستند مرفق حالياً - أجب من معرفتك العامة
6. إذا طلب المستخدم معلومات من مستند، اطلب منه رفع الملف أولاً`;
  }

  if (settings?.creativity_level !== undefined) {
    const level = settings.creativity_level;
    if (level < 30) {
      instruction += `\n\nمستوى الإبداع: منخفض - كن دقيقاً ومباشراً في إجاباتك`;
    } else if (level > 70) {
      instruction += `\n\nمستوى الإبداع: عالي - يمكنك أن تكون أكثر إبداعاً وتفصيلاً في إجاباتك`;
    }
  }

  return instruction;
};

/**
 * Generate a title for a chat based on the first message
 */
export const generateChatTitle = async (firstMessage: string): Promise<string> => {
  try {
    if (!config.geminiApiKey) {
      return 'محادثة جديدة';
    }

    const model = genAI.getGenerativeModel({
      model: config.geminiModel,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 50,
      },
    });

    const prompt = `بناءً على الرسالة التالية، اقترح عنواناً قصيراً ومناسباً للمحادثة (3-5 كلمات فقط):

الرسالة: "${firstMessage}"

العنوان:`;

    const result = await model.generateContent(prompt);
    const title = result.response.text().trim();
    
    // Clean up the title
    return title.replace(/["']/g, '').substring(0, 50) || 'محادثة جديدة';

  } catch (error) {
    console.error('Error generating chat title:', error);
    return 'محادثة جديدة';
  }
};
