import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Chat, Message, UploadedFile } from '../types/chat';
import { chatService } from '../services/chatService';
import { fileService } from '../services/fileService';

interface ChatContextType {
  chats: Chat[];
  activeChatId: string | null;
  messages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  uploadedFile: UploadedFile | null;
  uploadProgress: number;
  isUploading: boolean;
  searchMode: boolean;
  creativityLevel: number;
  createNewChat: () => Promise<void>;
  selectChat: (chatId: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  toggleSearchMode: () => void;
  deleteChat: (chatId: string) => Promise<void>;
  renameChat: (chatId: string, newTitle: string) => Promise<void>;
  stopGenerating: () => void;
  setCreativityLevel: (level: number) => void;
  loadChats: () => Promise<void>;
  clearUploadedFile: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [creativityLevel, setCreativityLevel] = useState(50);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // تحميل قائمة المحادثات عند بدء التشغيل
  useEffect(() => {
    loadChats();
  }, []);

  // تحميل تفاصيل المحادثة عند اختيار واحدة
  useEffect(() => {
    if (activeChatId) {
      loadActiveChatDetails(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  // دالة لجلب كل المحادثات
  const loadChats = async () => {
    try {
      const data = await chatService.getChats();
      // التعامل مع اختلاف هيكلية الرد (مصفوفة أو كائن)
      const items = Array.isArray(data) ? data : (data.chats || []);

      const formattedChats: Chat[] = items.map((chat: any) => ({
        id: chat.id,
        title: chat.title || 'محادثة جديدة',
        date: new Date(chat.createdAt || new Date()),
        messages: [],
        fileId: chat.fileId,
      }));
      setChats(formattedChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  // دالة لجلب رسائل المحادثة الحالية
  // دالة لجلب تفاصيل المحادثة عند اختيارها
  const loadActiveChatDetails = async (chatId: string) => {
    try {
      setIsLoading(true);
      // 1. تنظيف أي ملف سابق معلق
      setUploadedFile(null);

      // 2. جلب بيانات المحادثة من السيرفر
      const chatData = await chatService.getChat(chatId);

      // 3. معالجة الرسائل
      const serverMessages = chatData.messages || [];
      const formattedMessages: Message[] = serverMessages.map((msg: any) => ({
        id: msg.id,
        type: msg.messageType === 'user' ? 'user' : 'bot',
        content: msg.content || "",
        timestamp: new Date(msg.createdAt || new Date()),
        sources: msg.sources,
      }));
      setMessages(formattedMessages);

      // 4. 🔥 الخطوة الجديدة: استرجاع الملف إذا وجد
      // نفحص الكائن `file` القادم من الباك إند
      if (chatData.file) {
        const recoveredFile: UploadedFile = {
          id: chatData.file.id,
          name: chatData.file.originalFilename || chatData.file.filename || 'ملف مرفق',
          size: Number(chatData.file.fileSize || 0), // تحويل من BigInt إن لزم
          type: chatData.file.fileType || 'application/pdf',
          progress: 100, // لأنه مرفوع سابقاً
          status: 'completed'
        };
        setUploadedFile(recoveredFile);
      }

    } catch (error) {
      console.error('Failed to load chat details:', error);
      // في حال الخطأ، نضمن تنظيف الملف
      setUploadedFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. تعديل دالة إنشاء محادثة فارغة
  const createNewChat = async () => {
    try {
      // 🔥 تنظيف الملف القديم فوراً
      // هذا يضمن أن المحادثة الجديدة تبدأ نظيفة تماماً
      setUploadedFile(null);
      setUploadProgress(0);

      // استدعاء السيرفر لإنشاء محادثة (بدون تمرير أي ملف)
      const newChatData = await chatService.createChat();

      const newChat: Chat = {
        id: newChatData.id,
        title: newChatData.title || 'محادثة جديدة',
        date: new Date(newChatData.createdAt || new Date()),
        messages: [],
        fileId: undefined, // تأكيد أن لا يوجد ملف
      };

      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChatData.id);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create chat:', error);
      alert('فشل إنشاء المحادثة');
    }
  };

  const selectChat = (chatId: string | null) => {
    setActiveChatId(chatId);

    // 🔥 تنظيف الملف المرفوع عند التنقل بين المحادثات
    // حتى لا يظهر شريط ملف سابق وأنت تتصفح محادثة أخرى
    setUploadedFile(null);
  };

  // دالة الإرسال (النسخة النظيفة والمبسطة)
  const sendMessage = async (content: string) => {
    if (!activeChatId) return;

    // 1. عرض رسالة المستخدم
    const userMessage: Message = {
      id: 'temp-' + Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    const controller = new AbortController();
    setAbortController(controller);
    setIsTyping(true);

    try {
      // ✅ التعديل هنا: نرسل المحتوى فقط
      // لم نعد بحاجة لحساب targetFileId وإرساله
      // داخل دالة sendMessage
      const response = await chatService.sendMessage(activeChatId, content, creativityLevel);

      if (controller.signal.aborted) return;

      // استخراج الرد
      const rawContent = response.botMsg?.content || response.content || response.response;
      const safeBotContent = typeof rawContent === 'string' ? rawContent : "";
      const botId = response.botMsg?.id || response.id || 'bot-' + Date.now();

      // عرض رد البوت
      const botMessage: Message = {
        id: botId,
        type: 'bot',
        content: safeBotContent,
        timestamp: new Date(),
        sources: response.botMsg?.sources || []
      };

      setMessages(prev => [...prev, botMessage]);
      loadChats();

    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        type: 'bot',
        content: `عذراً، حدث خطأ: ${error.message || 'فشل الاتصال'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setAbortController(null);
    }
  };

  const stopGenerating = () => {
    if (abortController) {
      abortController.abort();
      setIsTyping(false);
      setAbortController(null);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // ✅ الخطوة المفقودة:
    // إنشاء كائن ملف "مؤقت" ليظهر الشريط فوراً في الواجهة
    const tempFile: UploadedFile = {
      id: 'temp-' + Date.now(), // معرف مؤقت
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading'
    };
    setUploadedFile(tempFile); // الآن سيظهر الشريط للمستخدم

    try {
      // محاكاة حركة الشريط ليعرف المستخدم أن هناك عملية جارية
      // (لأن الـ axios الحالي لا يدعم onUploadProgress بدون تعديل)
      const progressInterval = setInterval(() => {
        setUploadedFile(prev => {
          if (!prev || prev.progress >= 90) return prev;
          return { ...prev, progress: prev.progress + 10 };
        });
      }, 500);

      // 1. رفع الملف الفعلي
      const uploadedData = await fileService.uploadFile(file);

      clearInterval(progressInterval); // إيقاف المحاكاة
      setUploadProgress(100);

      if (!uploadedData || !uploadedData.id) {
        throw new Error("لم يتم العثور على معرف الملف في رد السيرفر");
      }

      const fileId = uploadedData.id;

      // تحديث الحالة النهائية للملف (مكتمل 100%)
      const newUploadedFile: UploadedFile = {
        id: fileId,
        name: uploadedData.filename || file.name,
        size: file.size,
        type: file.type,
        progress: 100,
        status: 'completed'
      };
      setUploadedFile(newUploadedFile);

      // 2. إنشاء المحادثة وربطها بالملف
      const newChatData = await chatService.createChat(fileId);

      const newChat: Chat = {
        id: newChatData.id,
        title: newChatData.title || file.name,
        date: new Date(),
        messages: [],
        fileId: fileId
      };

      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChatData.id);
      setMessages([]);

    } catch (error: any) {
      console.error('Failed to upload file:', error);
      alert(error.message || 'فشل رفع الملف');
      setUploadedFile(null); // إخفاء الشريط عند الفشل
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleSearchMode = () => {
    setSearchMode(prev => !prev);
  };

  const deleteChat = async (chatId: string) => {
    try {
      await chatService.deleteChat(chatId);
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const renameChat = async (chatId: string, newTitle: string) => {
    try {
      // await chatService.updateChat(chatId, { title: newTitle }); // فعلها إذا وفرها الباك إند
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c));
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
  };

  const setCreativityLevelHandler = (level: number) => {
    setCreativityLevel(level);
  };

  return (
    <ChatContext.Provider value={{
      chats,
      activeChatId,
      messages,
      isTyping,
      isLoading,
      uploadedFile,
      uploadProgress,
      isUploading,
      searchMode,
      creativityLevel,
      createNewChat,
      selectChat,
      sendMessage,
      uploadFile,
      toggleSearchMode,
      deleteChat,
      renameChat,
      stopGenerating,
      setCreativityLevel: setCreativityLevelHandler,
      loadChats,
      clearUploadedFile
    }}>
      {children}
    </ChatContext.Provider>
  );
};