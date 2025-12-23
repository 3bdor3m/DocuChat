import api from '../config/api';

// تعريف الواجهة كما هي
export interface Notification {
  id: string;
  userId: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

// تعريف المسار الأساسي للإشعارات
const NOTIFICATIONS_URL = '/notifications';

class NotificationService {
  
  // 1. جلب الإشعارات
  async getNotifications(page = 1, limit = 20, unreadOnly = false): Promise<{
    items: Notification[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    // لاحظ كيف نمرر المعاملات بشكل أنظف باستخدام params
    const response = await api.get(NOTIFICATIONS_URL, {
      params: {
        page,
        limit,
        unreadOnly
      }
    });

    return response.data;
  }

  // 2. جلب عدد غير المقروء
  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get(`${NOTIFICATIONS_URL}/unread-count`);
    return response.data;
  }

  // 3. تحديد إشعار كمقروء
  async markAsRead(id: string): Promise<Notification> {
    const response = await api.put(`${NOTIFICATIONS_URL}/${id}/read`);
    return response.data;
  }

  // 4. تحديد الكل كمقروء
  async markAllAsRead(): Promise<void> {
    await api.put(`${NOTIFICATIONS_URL}/read-all`);
  }

  // 5. حذف إشعار واحد
  async deleteNotification(id: string): Promise<void> {
    await api.delete(`${NOTIFICATIONS_URL}/${id}`);
  }

  // 6. حذف جميع الإشعارات المقروءة
  async deleteAllRead(): Promise<void> {
    await api.delete(`${NOTIFICATIONS_URL}/read`);
  }
}

export const notificationService = new NotificationService();