import { API_ENDPOINTS, getApiUrl, getAuthHeaders } from '../config/api';

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

class NotificationService {
  async getNotifications(page = 1, limit = 20, unreadOnly = false): Promise<{
    items: Notification[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const url = getApiUrl(
      `${API_ENDPOINTS.NOTIFICATIONS}?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`
    );
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل جلب الإشعارات');
    }

    return response.json();
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await fetch(getApiUrl(`${API_ENDPOINTS.NOTIFICATIONS}/unread-count`), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل جلب عدد الإشعارات');
    }

    return response.json();
  }

  async markAsRead(id: string): Promise<Notification> {
    const response = await fetch(getApiUrl(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`), {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل تحديث الإشعار');
    }

    return response.json();
  }

  async markAllAsRead(): Promise<void> {
    const response = await fetch(getApiUrl(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`), {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل تحديث الإشعارات');
    }
  }

  async deleteNotification(id: string): Promise<void> {
    const response = await fetch(getApiUrl(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل حذف الإشعار');
    }
  }

  async deleteAllRead(): Promise<void> {
    const response = await fetch(getApiUrl(`${API_ENDPOINTS.NOTIFICATIONS}/read`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('فشل حذف الإشعارات');
    }
  }
}

export const notificationService = new NotificationService();
