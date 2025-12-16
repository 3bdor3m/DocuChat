import { API_BASE_URL } from '../config/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const userService = {
  // Get user stats
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('فشل في جلب الإحصائيات');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  },

  // Update profile
  async updateProfile(data: { firstName?: string; lastName?: string; email?: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في تحديث الملف الشخصي');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Update profile image
  async updateProfileImage(profileImage: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile-image`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ profileImage }),
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث الصورة الشخصية');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في تغيير كلمة المرور');
      }

      return await response.json();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Delete account
  async deleteAccount(password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/account`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في حذف الحساب');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  // Export user data
  async exportData() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/export-data`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('فشل في تصدير البيانات');
      }

      return await response.json();
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },
};
