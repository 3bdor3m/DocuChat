import api from '../config/api';

export const chatService = {
  // إنشاء محادثة
  createChat: async (fileId?: string) => {
    const response = await api.post('/chats', { fileId });
    return response.data;
  },

  // جلب المحادثات
  getChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  // جلب محادثة واحدة
  getChat: async (id: string) => {
    const response = await api.get(`/chats/${id}`);
    return response.data;
  },

  // ✅ التعديل هنا: أضفنا fileId كخيار إضافي عند إرسال الرسالة
  sendMessage: async (chatId: string, content: string, fileId?: string) => {
    const payload: any = { content };
    
    // إذا كان هناك ملف مرفق، نرسل معرفه مع الرسالة
    if (fileId) {
      payload.fileId = fileId;
    }

    const response = await api.post(`/chats/${chatId}/messages`, payload);
    return response.data;
  },

  // حذف محادثة
  deleteChat: async (id: string) => {
    await api.delete(`/chats/${id}`);
  }
};