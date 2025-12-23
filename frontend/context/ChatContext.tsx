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
  const loadActiveChatDetails = async (chatId: string) => {
    try {
      setIsLoading(true);
      const chatData = await chatService.getChat(chatId);
      
      const serverMessages = chatData.messages || [];
      const formattedMessages: Message[] = serverMessages.map((msg: any) => ({
        id: msg.id,
        type: msg.role === 'user' ? 'user' : 'bot',
        // ✅ حماية ضد الخطأ: نضمن أن المحتوى نص دائماً وليس undefined
        content: msg.content || "", 
        timestamp: new Date(msg.createdAt || new Date()),
        sources: msg.sources,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load chat details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const newChatData = await chatService.createChat(uploadedFile?.id);
      
      const newChat: Chat = {
        id: newChatData.id,
        title: newChatData.title || 'محادثة جديدة',
        date: new Date(newChatData.createdAt || new Date()),
        messages: [],
        fileId: newChatData.fileId,
      };

      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChatData.id);
      setMessages([]); 
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const selectChat = (chatId: string | null) => {
    setActiveChatId(chatId);
  };

  // الدالة الأساسية لإرسال الرسائل (تم تحصينها بالكامل)
  // استبدل دالة sendMessage الحالية بهذه النسخة المعدلة
  const sendMessage = async (content: string) => {
    if (!activeChatId) return;

    // 1. إضافة رسالة المستخدم وهمياً
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
      // ✅ التغيير الجوهري هنا:
      // نرسل رقم الملف (إن وجد) مع الرسالة
      // هذا هو "الجسر" الذي سيخبر الذكاء الاصطناعي أن يقرأ الملف
      const currentFileId = uploadedFile?.id; 

      const response = await chatService.sendMessage(activeChatId, content, currentFileId);

      if (controller.signal.aborted) return;

      // استخراج الرد
      const rawContent = response.botMsg?.content || response.content || response.response;
      const safeBotContent = typeof rawContent === 'string' ? rawContent : "";
      const botId = response.botMsg?.id || response.id || 'bot-' + Date.now();

      // إضافة رد البوت
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
    setUploadProgress(10); 

    try {
      // 1. رفع الملف واستلام البيانات (التي تحتوي على ID)
      const uploadedData = await fileService.uploadFile(file);
      setUploadProgress(100);

      // التأكد من أن الـ ID موجود فعلاً
      if (!uploadedData || !uploadedData.id) {
        throw new Error("لم يتم العثور على معرف الملف في رد السيرفر");
      }

      const fileId = uploadedData.id; // هذا هو الـ UUID القادم من الباك إند

      // تحديث حالة الملف في الواجهة
      const newUploadedFile: UploadedFile = {
        id: fileId,
        name: uploadedData.filename || file.name,
        size: file.size,
        type: file.type,
        progress: 100,
        status: 'completed'
      };
      setUploadedFile(newUploadedFile);
      
      // 2. 🔥 الخطوة الحاسمة: إنشاء محادثة فوراً باستخدام هذا الـ ID
      // هذا يربط الملف بالمحادثة في قاعدة البيانات
      const newChatData = await chatService.createChat(fileId);
      
      const newChat: Chat = {
          id: newChatData.id,
          title: newChatData.title || file.name,
          date: new Date(),
          messages: [],
          fileId: fileId // نحتفظ به في الواجهة أيضاً
      };

      // 3. تفعيل المحادثة الجديدة
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChatData.id);
      setMessages([]); // تنظيف الشاشة للملف الجديد

    } catch (error: any) {
      console.error('Failed to upload file:', error);
      alert(error.message || 'فشل رفع الملف');
      setUploadedFile(null);
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