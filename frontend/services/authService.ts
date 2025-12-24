import api from '../config/api';

// --- الأنواع (Interfaces) المطلوبة للصفحات القديمة ---
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  subscriptionTier: string;
}

export interface AuthResponse {
  status: string;
  token?: string;
  data: {
    user: User;
  };
}
// -----------------------------------------------------

export const authService = {
  // تسجيل الدخول
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    return response.data;
  },

  // إنشاء حساب
  register: async (credentials: RegisterCredentials) => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  // الخروج
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // جلب المستخدم الحالي
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // التحقق من الدخول
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};