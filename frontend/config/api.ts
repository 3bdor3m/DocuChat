import axios from 'axios';

// 1. رابط الباك إند
export const API_URL = 'http://localhost:8000/api/v1';

// 2. قائمة الروابط (نحتفظ بها للتنظيم فقط، وليس كترقيع)
export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  USER: '/users/me',
  CHANGE_PASSWORD: '/users/password',
  FILES: '/files',
  UPLOAD: '/files/upload',
  CHAT: '/chats',
};

// 3. إعداد Axios (المحرك الرئيسي)
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // للسماح بالكوكيز
  headers: {
    'Content-Type': 'application/json',
  },
});

// 4. Request Interceptor (إرسال التوكن تلقائياً)
// هذا يغنينا عن دالة getAuthHeaders
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 5. Response Interceptor (معالجة انتهاء الجلسة)
// حارس الاستجابة: طرد المستخدم إذا انتهت الجلسة
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // التوكن منتهي أو غير صالح
      localStorage.removeItem('token');
      // توجيه إجباري لصفحة الدخول
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;