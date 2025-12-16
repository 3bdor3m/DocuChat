import { API_ENDPOINTS, getApiUrl, getAuthHeaders } from '../config/api';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  subscriptionTier: string;
  createdAt: string;
  profileImage?: string;
  filesCount?: number;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

class AuthService {
  async register(data: RegisterData): Promise<User> {
    const response = await fetch(getApiUrl(API_ENDPOINTS.REGISTER), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل التسجيل');
    }

    return response.json();
  }

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await fetch(getApiUrl(API_ENDPOINTS.LOGIN), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تسجيل الدخول');
    }

    const result: LoginResponse = await response.json();

    // Save token to localStorage
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('user', JSON.stringify(result.user));

    return result;
  }

  async getMe(): Promise<User> {
    const response = await fetch(getApiUrl(API_ENDPOINTS.ME), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل جلب بيانات المستخدم');
    }

    return response.json();
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

export const authService = new AuthService();
