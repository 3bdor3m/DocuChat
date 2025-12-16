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
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [creativityLevel, setCreativityLevel] = useState(50);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    }
  }, [activeChatId]);

  const messages = activeChatId
    ? chats.find(c => c.id === activeChatId)?.messages || []
    : [];

  const loadChats = async () => {
    try {
      const response = await chatService.getChats();
      const formattedChats: Chat[] = response.items.map(chat => ({
        id: chat.id,
        title: chat.title,
        date: new Date(chat.createdAt || new Date()),
        messages: [],
        fileId: chat.fileId,
      }));
      setChats(formattedChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await chatService.getMessages(chatId);
      const formattedMessages: Message[] = response.items.map(msg => ({
        id: msg.id,
        type: msg.messageType === 'user' ? 'user' : 'bot',
        content: msg.content,
        timestamp: new Date(msg.createdAt || new Date()),
        sources: msg.sources?.map(s => ({
          file: s.file,
          page: s.page,
          paragraph: s.paragraph,
        })),
      }));

      setChats(prev => prev.map(chat => {
        if (chat.id === chatId) {
          return { ...chat, messages: formattedMessages };
        }
        return chat;
      }));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const createNewChat = async () => {
    try {
      const newChat = await chatService.createChat({
        title: 'محادثة جديدة',
        fileId: uploadedFile?.id,
        settings: {
          creativity_level: creativityLevel,
          search_mode: searchMode,
        },
      });

      const formattedChat: Chat = {
        id: newChat.id,
        title: newChat.title,
        date: new Date(newChat.createdAt || new Date()),
        messages: [],
        fileId: newChat.fileId,
      };

      setChats(prev => [formattedChat, ...prev]);
      setActiveChatId(newChat.id);
    } catch (error) {
      console.error('Failed to create chat:', error);
      alert('فشل إنشاء المحادثة');
    }
  };

  const selectChat = (chatId: string | null) => {
    setActiveChatId(chatId);
  };

  const sendMessage = async (content: string) => {
    if (!activeChatId) return;

    const userMessage: Message = {
      id: 'temp-' + Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    // Add user message immediately
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return { ...chat, messages: [...chat.messages, userMessage] };
      }
      return chat;
    }));

    const controller = new AbortController();
    setAbortController(controller);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(activeChatId, { content });

      if (controller.signal.aborted) {
        setIsLoading(false);
        setAbortController(null);
        return;
      }

      setIsLoading(false);
      setIsTyping(true);

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!controller.signal.aborted) {
        const botMessage: Message = {
          id: response.botMessage.id,
          type: 'bot',
          content: response.botMessage.content,
          timestamp: new Date(response.botMessage.createdAt || new Date()),
          sources: response.botMessage.sources?.map(s => ({
            file: s.file,
            page: s.page,
            paragraph: s.paragraph,
          })),
        };

        // Replace temp user message with real one and add bot message
        setChats(prev => prev.map(chat => {
          if (chat.id === activeChatId) {
            const updatedMessages = chat.messages.filter(m => m.id !== userMessage.id);
            const realUserMessage: Message = {
              id: response.userMessage.id,
              type: 'user',
              content: response.userMessage.content,
              timestamp: new Date(response.userMessage.createdAt || new Date()),
            };
            return { ...chat, messages: [...updatedMessages, realUserMessage, botMessage] };
          }
          return chat;
        }));
        setIsTyping(false);
        setAbortController(null);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
      setIsTyping(false);
      setAbortController(null);

      // Add error message
      const errorMessage: Message = {
        id: 'error-' + Date.now().toString(),
        type: 'bot',
        content: `خطأ: ${error.message || 'فشل إرسال الرسالة'}`,
        timestamp: new Date(),
      };

      setChats(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          return { ...chat, messages: [...chat.messages, errorMessage] };
        }
        return chat;
      }));
    }
  };

  const stopGenerating = () => {
    if (abortController) {
      abortController.abort();
      setIsTyping(false);
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const uploadFile = async (file: File) => {
    const tempFile: UploadedFile = {
      id: 'temp-' + Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading'
    };
    setUploadedFile(tempFile);

    try {
      const uploadedFileData = await fileService.uploadFile(file, (progress) => {
        setUploadedFile(prev => prev ? { ...prev, progress } : null);
      });

      setUploadedFile({
        id: uploadedFileData.id,
        name: uploadedFileData.originalFilename ?? file.name,
        size: parseInt(uploadedFileData.fileSize ?? '0'),
        type: uploadedFileData.fileType ?? '',
        progress: 100,
        status: uploadedFileData.status === 'completed' ? 'completed' : 'processing'
      });

      // Poll for file status if still processing
      if (uploadedFileData.status === 'processing' && uploadedFileData.id) {
        pollFileStatus(uploadedFileData.id);
      }

      // Automatically create new chat if none active
      if (!activeChatId) {
        await createNewChat();
      }
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      setUploadedFile(prev => prev ? { ...prev, status: 'error' } : null);
      alert(error.message || 'فشل رفع الملف');
    }
  };

  const pollFileStatus = async (fileId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await fileService.getFileStatus(fileId);
        if (status.status === 'completed') {
          setUploadedFile(prev => prev ? { ...prev, status: 'completed' } : null);
          clearInterval(interval);
        } else if (status.status === 'error') {
          setUploadedFile(prev => prev ? { ...prev, status: 'error' } : null);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Failed to poll file status:', error);
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds
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
      alert('فشل حذف المحادثة');
    }
  };

  const renameChat = async (chatId: string, newTitle: string) => {
    try {
      await chatService.updateChat(chatId, { title: newTitle });
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: newTitle } : c));
    } catch (error) {
      console.error('Failed to rename chat:', error);
      alert('فشل تغيير اسم المحادثة');
    }
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
  };

  return (
    <ChatContext.Provider value={{
      chats,
      activeChatId,
      messages,
      isTyping,
      isLoading,
      uploadedFile,
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
      setCreativityLevel,
      loadChats,
      clearUploadedFile
    }}>
      {children}
    </ChatContext.Provider>
  );
};
