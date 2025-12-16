import { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheck, FaCheckDouble, FaTrash } from 'react-icons/fa';
import { notificationService, Notification } from '../services/notificationService';
import { useToast } from '../context/ToastContext';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Load notifications and unread count
  useEffect(() => {
    loadUnreadCount();
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadUnreadCount = async () => {
    try {
      const { count } = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications(1, 10);
      setNotifications(response.items);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('خطأ', 'فشل تحميل الإشعارات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('خطأ', 'فشل تحديث الإشعار');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('تم', 'تم تحديث جميع الإشعارات');
    } catch (error) {
      toast.error('خطأ', 'فشل تحديث الإشعارات');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      const notification = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success('تم', 'تم حذف الإشعار');
    } catch (error) {
      toast.error('خطأ', 'فشل حذف الإشعار');
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "flex-shrink-0";
    switch (type) {
      case 'success':
        return <FaCheck className={`${iconClass} text-green-400`} size={14} />;
      case 'error':
        return <FaTrash className={`${iconClass} text-red-400`} size={14} />;
      case 'warning':
        return <FaBell className={`${iconClass} text-yellow-400`} size={14} />;
      case 'info':
      default:
        return <FaBell className={`${iconClass} text-blue-400`} size={14} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
      >
        <FaBell className="text-white" size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-semibold">الإشعارات</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-[#2873ec] hover:text-[#4a8fff] transition-colors flex items-center gap-1"
              >
                <FaCheckDouble size={12} />
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2873ec] mx-auto"></div>
                <p className="mt-2 text-sm">جاري التحميل...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <FaBell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                    !notification.isRead ? 'bg-[#2873ec]/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-white text-sm font-medium">{notification.title}</h4>
                        {!notification.isRead && (
                          <span className="flex-shrink-0 w-2 h-2 bg-[#2873ec] rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-500 text-xs">{formatTime(notification.createdAt)}</span>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-[#2873ec] hover:text-[#4a8fff] transition-colors"
                            >
                              تحديد كمقروء
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10 text-center">
              <button className="text-xs text-[#2873ec] hover:text-[#4a8fff] transition-colors">
                عرض جميع الإشعارات
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
