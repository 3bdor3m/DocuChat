import api from '../config/api';

export const userService = {
  // تحديث الملف الشخصي
  updateProfile: async (data: { firstName: string; lastName: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
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
  deleteAccount: async (password: string) => {
    const response = await api.delete('/users/delete-account', {
      data: { password }, // في طلبات DELETE، البادئ يرسل داخل data
    });
    return response.data;
  },
};