import api from '../config/api';

// تعريف أنواع البيانات (مطابق لما عملناه في الباك إند)
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
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
  token?: string; // التوكن قد يأتي في الرد أو الكوكيز
  data: {
    user: User;
  };
}

export const authService = {
  // تسجيل الدخول
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // حفظ التوكن وبيانات المستخدم عند النجاح
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
    
    return response.data;
  },

  // إنشاء حساب جديد
  register: async (credentials: RegisterCredentials) => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  // تسجيل الخروج
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // يمكن استدعاء API خروج في الباك إند إذا أردت مسح الكوكيز أيضاً
    // api.post('/auth/logout'); 
  },

  // الحصول على المستخدم الحالي من التخزين المحلي
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  // التحقق هل المستخدم مسجل دخول
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};