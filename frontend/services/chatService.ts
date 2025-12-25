import api from '../config/api';

export const chatService = {
  // إنشاء محادثة (هنا نحتاج fileId لربط الملف لأول مرة)
  createChat: async (fileId?: string) => {
    const response = await api.post('/chats', { fileId });
    return response.data;
  },

  getChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  getChat: async (id: string) => {
    const response = await api.get(`/chats/${id}`);
    return response.data;
  },

  // ✅ التعديل هنا: حذفنا fileId لأنه غير مطلوب، الباك إند يعرفه من الـ chatId
sendMessage: async (chatId: string, content: string, creativity: number) => {
    // نحول القيمة من 0-100 إلى 0.0-1.0
    const temperature = creativity / 100; 
    const response = await api.post(`/chats/${chatId}/messages`, { content, temperature });
    return response.data;
  },

  deleteChat: async (id: string) => {
    await api.delete(`/chats/${id}`);
  }
};