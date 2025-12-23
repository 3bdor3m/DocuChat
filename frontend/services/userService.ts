import api from '../config/api';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  subscriptionTier: string;
}

export interface UserStats {
  filesCount: number;
  chatsCount: number;
  // يمكن إضافة المزيد هنا مستقبلاً
}

export const userService = {
  // جلب بيانات المستخدم الحالي
  getMe: async () => {
    const response = await api.get<UserProfile>('/users/me');
    return response.data;
  },

  // تحديث البروفايل
  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await api.put<{ status: string; data: UserProfile }>('/users/profile', data);
    return response.data;
  },

  // جلب الإحصائيات (عدد الملفات والمحادثات)
  getStats: async () => {
    const response = await api.get<UserStats>('/users/stats');
    return response.data;
  },

  // تغيير كلمة المرور
  changePassword: async (data: any) => {
    return await api.put('/users/password', data);
  },

  // حذف الحساب
  deleteAccount: async () => {
    return await api.delete('/users/account');
  }
};