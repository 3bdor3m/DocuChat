import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { fileService } from '../services/fileService';
import { chatService } from '../services/chatService';
import { FaFileAlt, FaComments, FaChartLine, FaClock, FaArrowRight } from 'react-icons/fa';

interface UserStats {
  filesCount: number;
  chatsCount: number;
  messagesCount: number;
  totalFileSize: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load stats
      const statsData = await userService.getStats();
      setStats(statsData);

      // Load recent files
      const filesData = await fileService.getFiles(1, 5);
      setRecentFiles(filesData.items);

      // Load recent chats
      const chatsData = await chatService.getChats(1, 5);
      setRecentChats(chatsData.items);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const subscriptionTiers = {
    free: { name: 'مجاني', color: 'gray', filesLimit: 5, chatsLimit: 10 },
    basic: { name: 'أساسي', color: 'blue', filesLimit: 20, chatsLimit: 50 },
    premium: { name: 'مميز', color: 'yellow', filesLimit: Infinity, chatsLimit: Infinity },
  };

  const currentTier = subscriptionTiers[user?.subscriptionTier as keyof typeof subscriptionTiers] || subscriptionTiers.free;
  const filesUsagePercent = currentTier.filesLimit === Infinity ? 0 : ((stats?.filesCount || 0) / currentTier.filesLimit) * 100;
  const chatsUsagePercent = currentTier.chatsLimit === Infinity ? 0 : ((stats?.chatsCount || 0) / currentTier.chatsLimit) * 100;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2873ec] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black text-white selection:bg-[#2873ec]/30 overflow-hidden relative">
      {/* Header */}
      <div className="pt-4 flex justify-center px-4 relative z-20">
        <Header />
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2873ec]/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1a5bb8]/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            مرحباً، {user?.firstName || user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400">إليك نظرة عامة على نشاطك</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Files Card */}
          <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FaFileAlt className="text-blue-400 text-2xl" />
              </div>
              <span className="text-3xl font-bold">{stats?.filesCount || 0}</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">الملفات</h3>
            {currentTier.filesLimit !== Infinity && (
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(filesUsagePercent, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Chats Card */}
          <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FaComments className="text-green-400 text-2xl" />
              </div>
              <span className="text-3xl font-bold">{stats?.chatsCount || 0}</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">المحادثات</h3>
            {currentTier.chatsLimit !== Infinity && (
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(chatsUsagePercent, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Messages Card */}
          <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <FaChartLine className="text-purple-400 text-2xl" />
              </div>
              <span className="text-3xl font-bold">{stats?.messagesCount || 0}</span>
            </div>
            <h3 className="text-gray-400 text-sm">الرسائل</h3>
          </div>

          {/* Storage Card */}
          <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <FaFileAlt className="text-yellow-400 text-2xl" />
              </div>
              <span className="text-2xl font-bold">{formatFileSize(stats?.totalFileSize || 0)}</span>
            </div>
            <h3 className="text-gray-400 text-sm">التخزين</h3>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Files */}
          <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaClock className="text-[#2873ec]" />
                آخر الملفات
              </h2>
              <Link
                to="/chat"
                className="text-[#2873ec] hover:text-[#4a8fff] text-sm flex items-center gap-1 transition-colors"
              >
                عرض الكل
                <FaArrowRight size={12} />
              </Link>
            </div>

            {recentFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FaFileAlt className="text-4xl mx-auto mb-2 opacity-50" />
                <p>لا توجد ملفات بعد</p>
                <Link
                  to="/chat"
                  className="inline-block mt-4 text-[#2873ec] hover:text-[#4a8fff] text-sm"
                >
                  ارفع ملفك الأول
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-black/20 rounded-xl hover:bg-black/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-[#2873ec]/20 rounded-lg">
                        <FaFileAlt className="text-[#2873ec]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.originalFilename}</p>
                        <p className="text-xs text-gray-400">
                          {formatFileSize(file.fileSize)} • {new Date(file.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        file.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : file.status === 'processing'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {file.status === 'completed' ? 'مكتمل' : file.status === 'processing' ? 'معالجة' : 'خطأ'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Chats */}
          <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaComments className="text-[#2873ec]" />
                آخر المحادثات
              </h2>
              <Link
                to="/chat"
                className="text-[#2873ec] hover:text-[#4a8fff] text-sm flex items-center gap-1 transition-colors"
              >
                عرض الكل
                <FaArrowRight size={12} />
              </Link>
            </div>

            {recentChats.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FaComments className="text-4xl mx-auto mb-2 opacity-50" />
                <p>لا توجد محادثات بعد</p>
                <Link
                  to="/chat"
                  className="inline-block mt-4 text-[#2873ec] hover:text-[#4a8fff] text-sm"
                >
                  ابدأ محادثتك الأولى
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentChats.map((chat) => (
                  <Link
                    key={chat.id}
                    to={`/chat?id=${chat.id}`}
                    className="flex items-center justify-between p-3 bg-black/20 rounded-xl hover:bg-black/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-[#2873ec]/20 rounded-lg">
                        <FaComments className="text-[#2873ec]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{chat.title}</p>
                        <p className="text-xs text-gray-400">
                          {chat.messageCount} رسالة • {new Date(chat.updatedAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>
                    <FaArrowRight className="text-gray-400" size={14} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/chat"
            className="bg-gradient-to-r from-[#2873ec] to-[#1a5bb8] rounded-3xl p-6 shadow-2xl hover:scale-105 transition-transform text-center"
          >
            <FaComments className="text-4xl mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">محادثة جديدة</h3>
            <p className="text-sm text-blue-100">ابدأ محادثة مع مستنداتك</p>
          </Link>

          <Link
            to="/chat"
            className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-transform text-center"
          >
            <FaFileAlt className="text-4xl mx-auto mb-3 text-[#2873ec]" />
            <h3 className="text-lg font-bold mb-2">رفع ملف</h3>
            <p className="text-sm text-gray-400">أضف مستند جديد</p>
          </Link>

          <Link
            to="/account"
            className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-transform text-center"
          >
            <div className="text-4xl mx-auto mb-3">⚙️</div>
            <h3 className="text-lg font-bold mb-2">إعدادات الحساب</h3>
            <p className="text-sm text-gray-400">إدارة حسابك</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
