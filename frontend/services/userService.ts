import api from '../config/api';

export const userService = {
  // تحديث الملف الشخصي
updateProfile: async (data: { firstName: string; lastName: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data.data; 
  },

  // تحديث صورة البروفايل
  updateProfileImage: async (image: string) => {
    const response = await api.put('/users/profile-image', { image });
    return response.data;
  },

  // تغيير كلمة المرور
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // تصدير البيانات
  exportData: async () => {
    const response = await api.get('/users/export-data');
    return response.data;
  },

  // حذف الحساب
  deleteAccount: async (password: string, reason: string) => {
    const response = await api.delete('/users/delete-account', {
      data: { password, reason }, // نرسل السبب مع كلمة المرور
    });
    return response.data;
  },

  deleteProfileImage: async () => {
    const response = await api.delete('/users/profile-image');
    return response.data;
  },
};