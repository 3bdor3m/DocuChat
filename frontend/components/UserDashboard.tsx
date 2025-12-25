import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { fileService } from '../services/fileService';
import { chatService } from '../services/chatService';
import { FaFileAlt, FaComments, FaEnvelope, FaDatabase, FaUpload, FaPlus, FaFolder, FaUser } from 'react-icons/fa';
import SpotlightCard from './SpotlightCard';
import TextPressure from '../src/component/TextPressure';

export const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalFiles: 0,
    activeChats: 0,
    totalMessages: 0,
    storageUsed: 0
  });
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [userData, filesRaw, chatsRaw] = await Promise.all([
        authService.getCurrentUser(),
        fileService.getFiles().catch(() => []),
        chatService.getChats().catch(() => [])
      ]);

      const filesData = Array.isArray(filesRaw) ? filesRaw : (filesRaw as any)?.files || [];
      const chatsData = Array.isArray(chatsRaw) ? chatsRaw : (chatsRaw as any)?.items || [];

      setUser(userData);

      // حساب الإحصائيات
      const totalMessages = chatsData.reduce((sum: number, chat: any) => sum + (chat.messages?.length || 0), 0);
      const storageUsed = filesData.reduce((sum: number, file: any) => sum + Number(file.fileSize || 0), 0);
      const storagePercentage = Math.min((storageUsed / (1024 * 1024 * 1024)) * 100, 100);

      setStats({
        totalFiles: filesData.length,
        activeChats: chatsData.length,
        totalMessages,
        storageUsed: Math.round(storagePercentage)
      });

      setRecentFiles(filesData.slice(0, 3));
      setRecentChats(chatsData.slice(0, 3));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-black">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-[#2873ec] rounded-full mb-4 animate-bounce"></div>
          <div className="text-white text-xl">جاري تحميل بياناتك...</div>
        </div>
      </div>
    );
  }

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'مستخدم';

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 min-h-screen bg-transparent">
      <div className="w-full max-w-6xl mx-auto">

        {/* Welcome Message */}
        {/* إضافة dir="rtl" للحاوية الرئيسية لضمان الترتيب الصحيح */}
        <div className="text-center mb-12" dir="rtl">
          {/* استخدمنا flex-wrap للسماح بالالتفاف في الشاشات الصغيرة، و items-baseline لمحاذاة النصوص */}
          <h1 className="text-white font-bold text-4xl md:text-5xl lg:text-6xl mb-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2">
            <span>مرحباً بعودتك،</span>

            {/* 👇 التعديل الجذري هنا 👇 */}
            {/* أزلنا inline-block والارتفاع الثابت. تركنا فقط dir="ltr" لعزل الاسم */}
            <span dir="ltr" className="relative">
              <TextPressure
                text={firstName}
                flex={false}     // غيرناه لـ false لكي لا يحاول التمدد ويأخذ حجمه الطبيعي
                alpha={false}
                stroke={false}
                width={false}    // غيرناه لـ false أيضاً
                weight={true}
                italic={true}
                auto={true}
                autoSpeed={1}
                textColor="#2873ec"
                strokeColor="#ff0000"
                minFontSize={100} // حجم خط مناسب ليكون بارزاً
              />
            </span>

            {/* عزلنا علامة التعجب والإيموجي لضمان ظهورهم في النهاية بشكل صحيح */}
            <span dir="ltr">! 👋</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl">
            إليك ملخص نشاطك اليوم
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

          {/* Total Files */}
          <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)">
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#2873ec]/20 shadow-[0_0_20px_rgba(40,115,236,0.1)] hover:shadow-[0_0_30px_rgba(40,115,236,0.2)] transition-all duration-300 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <FaFileAlt className="text-blue-400 text-2xl" />
                </div>
                <span className="text-3xl font-bold text-white">{stats.totalFiles}</span>
              </div>
              <h3 className="text-gray-400 text-sm">إجمالي الملفات</h3>
            </div>
          </SpotlightCard>

          {/* Active Chats */}
          <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)">
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#2873ec]/20 shadow-[0_0_20px_rgba(40,115,236,0.1)] hover:shadow-[0_0_30px_rgba(40,115,236,0.2)] transition-all duration-300 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <FaComments className="text-green-400 text-2xl" />
                </div>
                <span className="text-3xl font-bold text-white">{stats.activeChats}</span>
              </div>
              <h3 className="text-gray-400 text-sm">المحادثات النشطة</h3>
            </div>
          </SpotlightCard>

          {/* Total Messages */}
          <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)">
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#2873ec]/20 shadow-[0_0_20px_rgba(40,115,236,0.1)] hover:shadow-[0_0_30px_rgba(40,115,236,0.2)] transition-all duration-300 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500/10 p-3 rounded-lg">
                  <FaEnvelope className="text-purple-400 text-2xl" />
                </div>
                <span className="text-3xl font-bold text-white">{stats.totalMessages}</span>
              </div>
              <h3 className="text-gray-400 text-sm">إجمالي الرسائل</h3>
            </div>
          </SpotlightCard>

          {/* Storage Used */}
          <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)" className='rounded-3xl'>
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#2873ec]/20 shadow-[0_0_20px_rgba(40,115,236,0.1)] hover:shadow-[0_0_30px_rgba(40,115,236,0.2)] transition-all duration-300 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-500/10 p-3 rounded-lg">
                  <FaDatabase className="text-orange-400 text-2xl" />
                </div>
                <span className="text-3xl font-bold text-white">{stats.storageUsed}%</span>
              </div>
              <h3 className="text-gray-400 text-sm">التخزين (1GB Max)</h3>
            </div>
          </SpotlightCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link
            to="/chat"
            className="bg-gradient-to-br from-[#2873ec] to-[#4a8fff] rounded-xl p-6 text-center hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(40,115,236,0.3)]"
          >
            <FaUpload className="text-white text-3xl mx-auto mb-3" />
            <span className="text-white font-bold">رفع ملف جديد</span>
          </Link>

          <Link
            to="/chat"
            state={{ newChat: true }}
            className="bg-gray-900/50 backdrop-blur-md border border-[#2873ec]/20 rounded-xl p-6 text-center hover:scale-105 transition-transform duration-300"
          >
            <FaPlus className="text-[#2873ec] text-3xl mx-auto mb-3" />
            <span className="text-white font-bold">بدء محادثة</span>
          </Link>

          {/* 🔥 تم إضافة SpotlightCard هنا لـ "ملفاتي" */}
          <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)">
            <Link
              to="/chat"
              // تمت إزالة hover:scale-105 وإضافة h-full w-full block
              className="bg-gray-900/50 backdrop-blur-md border border-[#2873ec]/20 rounded-xl p-6 text-center h-full w-full block"
            >
              <FaFolder className="text-[#2873ec] text-3xl mx-auto mb-3" />
              <span className="text-white font-bold">ملفاتي</span>
            </Link>
          </SpotlightCard>

          {/* 🔥 تم إضافة SpotlightCard هنا لـ "حسابي" */}
          <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)">
            <Link
              to="/account"
              // تمت إزالة hover:scale-105 وإضافة h-full w-full block
              className="bg-gray-900/50 backdrop-blur-md border border-[#2873ec]/20 rounded-xl p-6 text-center h-full w-full block"
            >
              <FaUser className="text-[#2873ec] text-3xl mx-auto mb-3" />
              <span className="text-white font-bold">حسابي</span>
            </Link>
          </SpotlightCard>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Files */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#2873ec]/20">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <FaFileAlt className="text-[#2873ec]" />
              آخر الملفات
            </h3>

            {recentFiles.length > 0 ? (
              <div className="space-y-3">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{file.originalFilename}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(file.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium mr-2 whitespace-nowrap ${file.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        file.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                        {file.status === 'completed' ? 'مكتمل' :
                          file.status === 'processing' ? 'قيد المعالجة' : 'خطأ'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">لا توجد ملفات بعد</p>
            )}

            {recentFiles.length > 0 && (
              <Link
                to="/chat"
                className="block text-center text-[#2873ec] hover:text-[#4a8fff] font-medium mt-4 transition-colors"
              >
                عرض الكل →
              </Link>
            )}
          </div>

          {/* Recent Chats */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#2873ec]/20">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
              <FaComments className="text-[#2873ec]" />
              آخر المحادثات
            </h3>

            {recentChats.length > 0 ? (
              <div className="space-y-3">
                {recentChats.map((chat) => (
                  <Link
                    key={chat.id}
                    to={`/chat?id=${chat.id}`}
                    className="block bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{chat.title || 'محادثة جديدة'}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(chat.updatedAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                      <span className="text-[#2873ec] text-sm mr-2 whitespace-nowrap">
                        {chat.messages?.length || 0} رسالة
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">لا توجد محادثات بعد</p>
            )}

            {recentChats.length > 0 && (
              <Link
                to="/chat"
                className="block text-center text-[#2873ec] hover:text-[#4a8fff] font-medium mt-4 transition-colors"
              >
                عرض الكل →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};