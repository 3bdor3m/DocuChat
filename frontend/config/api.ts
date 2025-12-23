import axios from 'axios';

// رابط الـ Backend
export const API_URL = 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
  CHATS: '/chats',
  CHAT_BY_ID: (chatId: string) => `/chats/${chatId}`,
  MESSAGES: (chatId: string) => `/chats/${chatId}/messages`,
  UPLOAD_FILE: '/files/upload',
  FILES: '/files',
  FILE_BY_ID: (fileId: string) => `/files/${fileId}`,
  FILE_STATUS: (fileId: string) => `/files/${fileId}/status`,
  NOTIFICATIONS: '/notifications',
  ACTIVATE_CODE: '/activation/activate',
};

export const getApiUrl = (endpoint: string) => `${API_URL}${endpoint}`;

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export const getAuthHeadersForUpload = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// إنشاء نسخة من Axios بإعداداتنا الخاصة
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ضروري جداً لكي تعمل الكوكيز (Cookies)
  headers: {
    'Content-Type': 'application/json',
  },
});

// اعتراض الطلب (Request Interceptor)
// لإضافة التوكن تلقائياً إذا كان محفوظاً في LocalStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// اعتراض الرد (Response Interceptor)
// لمعالجة انتهاء الجلسة أو الأخطاء العامة
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // إذا انتهت صلاحية الجلسة، احذف التوكن وحول المستخدم للدخول
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // window.location.href = '/login'; // (اختياري: التوجيه التلقائي)
    }
    return Promise.reject(error);
  }
);

export default api;