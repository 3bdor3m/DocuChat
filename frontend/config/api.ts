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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // إذا انتهت الجلسة (401)، نظف المتصفح
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // window.location.href = '/login'; // فعلها لاحقاً للتوجيه التلقائي
    }
    return Promise.reject(error);
  }
);

export default api;