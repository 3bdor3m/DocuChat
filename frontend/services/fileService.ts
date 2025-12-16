import { API_ENDPOINTS, getApiUrl, getAuthHeadersForUpload, getAuthHeaders } from '../config/api';
import { UploadedFile } from '../types/chat';

export interface FileStatus {
  status: 'processing' | 'completed' | 'error';
  errorMessage?: string | null;
  metadata?: {
    totalChunks?: number;
  };
}

class FileService {
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('فشل تحليل الاستجابة'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error || 'فشل رفع الملف'));
          } catch {
            reject(new Error('فشل رفع الملف'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('خطأ في الشبكة'));
      });

      const token = localStorage.getItem('accessToken');
      xhr.open('POST', getApiUrl(API_ENDPOINTS.UPLOAD_FILE));
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  async getFiles(page = 1, limit = 10): Promise<{
    items: UploadedFile[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const response = await fetch(
      getApiUrl(`${API_ENDPOINTS.FILES}?page=${page}&limit=${limit}`),
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('فشل جلب الملفات');
    }

    return response.json();
  }

  async getFileById(fileId: string): Promise<UploadedFile> {
    const response = await fetch(getApiUrl(API_ENDPOINTS.FILE_BY_ID(fileId)), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل جلب الملف');
    }

    return response.json();
  }

  async getFileStatus(fileId: string): Promise<FileStatus> {
    const response = await fetch(getApiUrl(API_ENDPOINTS.FILE_STATUS(fileId)), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل جلب حالة الملف');
    }

    return response.json();
  }

  async deleteFile(fileId: string): Promise<void> {
    const response = await fetch(getApiUrl(API_ENDPOINTS.FILE_BY_ID(fileId)), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل حذف الملف');
    }
  }
}

export const fileService = new FileService();
