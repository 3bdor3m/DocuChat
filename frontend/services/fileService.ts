import api from '../config/api';

// تعريف الواجهات (Interfaces) لضمان التعامل السليم مع البيانات
export interface FileItem {
  id: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  status: 'processing' | 'completed' | 'error';
  createdAt: string;
  errorMessage?: string;
}

export interface FilesResponse {
  items: FileItem[];
  total: number;
  page: number;
  pages: number;
}

export const fileService = {
  // 1. رفع ملف
  uploadFile: async (file: File): Promise<FileItem> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/upload', formData, {
      headers: {
        // نترك المتصفح يحدد الـ Content-Type والـ Boundary تلقائياً
        'Content-Type': 'multipart/form-data', 
      }
    });
    
    // الباك إند يعيد البيانات داخل: { status: 'success', data: { ...FileItem } }
    return response.data.data; 
  },

  // 2. جلب قائمة الملفات
  getFiles: async (page = 1, limit = 20): Promise<FilesResponse> => {
    const response = await api.get(`/files?page=${page}&limit=${limit}`);
    
    // الباك إند الجديد يعيد: { status: 'success', data: { items: [], total: ... } }
    return response.data.data; 
  },

  // 3. التحقق من حالة الملف (جديد 🔥)
  // هذه الدالة ستستخدمها الداشبورد لعمل Polling وتحديث الحالة
  getFileStatus: async (id: string): Promise<{ status: string; errorMessage?: string }> => {
    const response = await api.get(`/files/${id}/status`);
    return response.data.data;
  },

  // 4. حذف ملف
  deleteFile: async (id: string) => {
    await api.delete(`/files/${id}`);
  }
};