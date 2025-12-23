import api from '../config/api';

export const fileService = {
  // رفع ملف
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // نرسل الطلب ونلغي الـ Header ليحدده المتصفح تلقائياً
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': undefined as unknown as string
      }
    });
    
    // 🔥 التعديل الجوهري هنا:
    // الباك إند يعيد: { status: "success", data: { id: "...", ... } }
    // ونحن نريد الوصول إلى ما بداخل data مباشرة
    return response.data.data; 
  },

  getFiles: async (page = 1) => {
    const response = await api.get(`/files?page=${page}`);
    // دعم لاحتمالين في هيكلية الرد لضمان عدم حدوث خطأ
    return response.data.data?.files || response.data.data || []; 
  },

  deleteFile: async (id: string) => {
    await api.delete(`/files/${id}`);
  }
};