import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { fileService, FileItem } from '../services/fileService';
import { chatService } from '../services/chatService';
import { FaFileAlt, FaComments, FaEnvelope, FaDatabase, FaUpload, FaPlus, FaFolder, FaUser, FaSearch } from 'react-icons/fa';
import SpotlightCard from './SpotlightCard';
import TextPressure from '../src/component/TextPressure';
import { Header } from './Header';

export const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // مرجع للتايمر للتحديث التلقائي
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const [stats, setStats] = useState({
    totalFiles: 0,
    activeChats: 0,
    totalMessages: 0,
    storageUsed: 0
  });

  useEffect(() => {
    fetchDashboardData();
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  // مراقبة الملفات قيد المعالجة لتحديث حالتها
  useEffect(() => {
    const processingFiles = recentFiles.filter(f => f.status === 'processing');
    if (processingFiles.length > 0) {
      if (!pollingInterval.current) {
        pollingInterval.current = setInterval(checkFileStatuses, 3000);
      }
    } else {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    }
  }, [recentFiles]);

  const checkFileStatuses = async () => {
    const processingFiles = recentFiles.filter(f => f.status === 'processing');
    for (const file of processingFiles) {
      try {
        const { status } = await fileService.getFileStatus(file.id);
        if (status !== 'processing') {
          setRecentFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: status as any } : f
          ));
        }
      } catch (error) {
        console.error(`Error checking status for ${file.id}`, error);
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [userData, filesRaw, chatsRaw] = await Promise.all([
        authService.getCurrentUser(),
        fileService.getFiles().catch(() => ({ items: [] })),
        chatService.getChats().catch(() => [])
      ]);

      const filesData = (filesRaw as any)?.items || [];
      const chatsData = Array.isArray(chatsRaw) ? chatsRaw : (chatsRaw as any)?.items || [];

      setUser(userData);

      const totalMessages = chatsData.reduce((sum: number, chat: any) => sum + (chat.messages?.length || 0), 0);
      const storageUsed = filesData.reduce((sum: number, file: any) => sum + Number(file.fileSize || 0), 0);
      const storagePercentage = Math.min((storageUsed / (1024 * 1024 * 1024)) * 100, 100);

      setStats({
        totalFiles: filesData.length,
        activeChats: chatsData.length,
        totalMessages,
        storageUsed: Math.round(storagePercentage)
      });

      setRecentFiles(filesData);
      setRecentChats(chatsData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'سهرة سعيدة';
  };

  const filteredFiles = recentFiles.filter(f => 
    f.originalFilename.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const filteredChats = recentChats.filter(c => 
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

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
    <div className="w-full min-h-screen bg-transparent relative flex flex-col">
      
      {/* الهيدر */}
      <div className="pt-4 flex justify-center px-4 relative z-50">
         <Header />
      </div>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative">
        <div className="w-full max-w-6xl mx-auto z-10">

          {/* الترحيب */}
          <div className="text-center mb-8" dir="rtl">
            <h1 className="text-white font-bold text-4xl md:text-5xl lg:text-6xl mb-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-2">
              <span>{getGreeting()}،</span>
              <span dir="ltr" className="relative">
                <TextPressure
                  text={firstName}
                  flex={false}
                  alpha={false}
                  stroke={false}
                  width={false}
                  weight={true}
                  italic={true}
                  auto={true}
                  autoSpeed={1}
                  textColor="#2873ec"
                  strokeColor="#ff0000"
                  minFontSize={100}
                />
              </span>
              <span dir="ltr">! 👋</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl">
               إليك ملخص نشاطك اليوم
            </p>
          </div>

          {/* شريط البحث */}
          <div className="w-full max-w-2xl mx-auto mb-12 relative group">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 group-focus-within:text-[#2873ec] transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="ابحث عن ملف أو محادثة..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:shadow-[0_0_20px_rgba(40,115,236,0.2)] transition-all text-right"
            />
          </div>

          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

            <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)" className='rounded-3xl'>
              <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#2873ec]/20 shadow-[0_0_20px_rgba(40,115,236,0.1)] hover:shadow-[0_0_30px_rgba(40,115,236,0.2)] transition-all duration-300 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-orange-500/10 p-3 rounded-lg">
                    <FaDatabase className="text-orange-400 text-2xl" />
                  </div>
                  <span className="text-2xl font-bold text-white" dir="ltr">{stats.storageUsed}%</span>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-2 px-1">
                    <span>المستخدم</span>
                    <span dir="ltr">1 GB Max</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        stats.storageUsed > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                        stats.storageUsed > 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                        'bg-gradient-to-r from-green-400 to-[#2873ec]'
                      }`} 
                      style={{ width: `${stats.storageUsed}%` }}
                    />
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* الإجراءات السريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Link
              to="/chat"
              className="bg-linear-to-br from-[#2873ec] to-[#4a8fff] rounded-xl p-6 text-center hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(40,115,236,0.3)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <FaUpload className="text-white text-3xl mx-auto mb-3 relative z-10" />
              <span className="text-white font-bold relative z-10">رفع ملف جديد</span>
            </Link>

            <Link
              to="/chat"
              state={{ newChat: true }}
              className="bg-gray-900/50 backdrop-blur-md border border-[#2873ec]/20 rounded-xl p-6 text-center hover:scale-105 transition-transform duration-300 group"
            >
              <FaPlus className="text-[#2873ec] text-3xl mx-auto mb-3 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-white font-bold">بدء محادثة</span>
            </Link>

            <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)">
              <Link
                to="/chat"
                className="bg-gray-900/50 backdrop-blur-md border border-[#2873ec]/20 rounded-xl p-6 text-center h-full w-full block hover:bg-[#2873ec]/5 transition-colors"
              >
                <FaFolder className="text-[#2873ec] text-3xl mx-auto mb-3" />
                <span className="text-white font-bold">ملفاتي</span>
              </Link>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)">
              <Link
                to="/account"
                className="bg-gray-900/50 backdrop-blur-md border border-[#2873ec]/20 rounded-xl p-6 text-center h-full w-full block hover:bg-[#2873ec]/5 transition-colors"
              >
                <FaUser className="text-[#2873ec] text-3xl mx-auto mb-3" />
                <span className="text-white font-bold">حسابي</span>
              </Link>
            </SpotlightCard>
          </div>

          {/* آخر النشاطات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#2873ec]/20">
              <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <FaFileAlt className="text-[#2873ec]" />
                {searchQuery ? 'نتائج البحث في الملفات' : 'آخر الملفات'}
              </h3>

              {filteredFiles.length > 0 ? (
                <div className="space-y-3">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 transition-colors border border-transparent hover:border-[#2873ec]/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{file.originalFilename}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(file.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium mr-2 whitespace-nowrap ${
                          file.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          file.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' :
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
                <p className="text-gray-400 text-center py-8">
                  {searchQuery ? 'لا توجد ملفات تطابق بحثك' : 'لا توجد ملفات بعد'}
                </p>
              )}

              {!searchQuery && recentFiles.length > 0 && (
                <Link
                  to="/chat"
                  className="block text-center text-[#2873ec] hover:text-[#4a8fff] font-medium mt-4 transition-colors"
                >
                  عرض الكل →
                </Link>
              )}
            </div>

            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-[#2873ec]/20">
              <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <FaComments className="text-[#2873ec]" />
                {searchQuery ? 'نتائج البحث في المحادثات' : 'آخر المحادثات'}
              </h3>

              {filteredChats.length > 0 ? (
                <div className="space-y-3">
                  {filteredChats.map((chat) => (
                    <Link
                      key={chat.id}
                      to={`/chat?id=${chat.id}`}
                      className="block bg-gray-800/30 rounded-lg p-4 hover:bg-gray-800/50 transition-colors border border-transparent hover:border-[#2873ec]/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{chat.title || 'محادثة جديدة'}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(chat.updatedAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        <span className="text-[#2873ec] text-sm mr-2 whitespace-nowrap bg-[#2873ec]/10 px-2 py-1 rounded-md">
                          {chat.messages?.length || 0} رسالة
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  {searchQuery ? 'لا توجد محادثات تطابق بحثك' : 'لا توجد محادثات بعد'}
                </p>
              )}

              {!searchQuery && recentChats.length > 0 && (
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
    </div>
  );
};

export default UserDashboard;