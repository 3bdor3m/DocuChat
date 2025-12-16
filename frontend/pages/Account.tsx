import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userService } from "../services/userService";
import { activationCodeService } from "../services/activationCodeService";
import { FaCamera, FaTrash, FaCrown, FaKey, FaLock, FaSignOutAlt, FaUserSlash, FaDownload, FaCheck } from "react-icons/fa";

const Account = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || user?.fullName?.split(' ')[0] || '',
    lastName: user?.lastName || user?.fullName?.split(' ').slice(1).join(' ') || '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropData, setCropData] = useState({ x: 0, y: 0, size: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const subscriptionTiers = {
    free: { name: 'مجاني', color: 'gray', limit: 5, features: ['5 ملفات', '10 محادثات', 'دعم أساسي'] },
    basic: { name: 'أساسي', color: 'blue', limit: 20, features: ['20 ملف', '50 محادثة', 'دعم سريع', 'بدون إعلانات'] },
    premium: { name: 'مميز', color: 'yellow', limit: 100, features: ['ملفات غير محدودة', 'محادثات غير محدودة', 'دعم أولوية', 'ميزات متقدمة'] },
  };

  const currentTier = subscriptionTiers[user?.subscriptionTier as keyof typeof subscriptionTiers] || subscriptionTiers.free;
  const usagePercentage = ((user?.filesCount || 0) / currentTier.limit) * 100;

  // Handle image select
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('خطأ', 'يرجى اختيار صورة صحيحة');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setTempImage(event.target?.result as string);
        const size = Math.min(img.width, img.height);
        setCropData({ x: (img.width - size) / 2, y: (img.height - size) / 2, size });
        setShowCropModal(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle crop drag
  const handleCropMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropData.x, y: e.clientY - cropData.y });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tempImage) return;
    
    const img = new Image();
    img.src = tempImage;
    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, img.width - cropData.size));
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y, img.height - cropData.size));
    setCropData({ ...cropData, x: newX, y: newY });
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
  };

  // Crop and save image
  const handleCropSave = async () => {
    if (!canvasRef.current || !tempImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = async () => {
      canvas.width = 200;
      canvas.height = 200;
      ctx.drawImage(img, cropData.x, cropData.y, cropData.size, cropData.size, 0, 0, 200, 200);
      
      const croppedImage = canvas.toDataURL('image/jpeg', 0.8);
      
      try {
        await userService.updateProfileImage(croppedImage);
        setProfileImage(croppedImage);
        updateUser({ ...user, profileImage: croppedImage });
        setShowCropModal(false);
        setTempImage(null);
        toast.success('تم!', 'تم تحديث الصورة الشخصية');
      } catch (error: any) {
        toast.error('خطأ', error.message || 'فشل تحديث الصورة');
      }
    };
    img.src = tempImage;
  };

  // Delete profile image
  const handleDeleteImage = async () => {
    try {
      await userService.updateProfileImage('');
      setProfileImage(null);
      updateUser({ ...user, profileImage: null });
      toast.success('تم!', 'تم حذف الصورة الشخصية');
    } catch (error: any) {
      toast.error('خطأ', error.message || 'فشل حذف الصورة');
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('خطأ', 'جميع الحقول مطلوبة');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await userService.updateProfile(formData);
      updateUser(updated);
      setIsEditing(false);
      toast.success('تم!', 'تم تحديث المعلومات الشخصية');
    } catch (error: any) {
      toast.error('خطأ', error.message || 'فشل تحديث المعلومات');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle activation code
  const handleActivateCode = async () => {
    if (activationCode.length !== 10 || !/^\d+$/.test(activationCode)) {
      toast.error('خطأ', 'الكود يجب أن يكون 10 أرقام');
      return;
    }

    setIsActivating(true);
    try {
      await activationCodeService.activate(activationCode);
      toast.success('تم التفعيل!', 'تم ترقية حسابك بنجاح');
      setActivationCode('');
      window.location.reload();
    } catch (error: any) {
      toast.error('خطأ', error.message || 'كود التفعيل غير صحيح');
    } finally {
      setIsActivating(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error('خطأ', 'جميع الحقول مطلوبة');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error('خطأ', 'كلمتا المرور غير متطابقتين');
      return;
    }

    if (passwords.new.length < 8) {
      toast.error('خطأ', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    try {
      await userService.changePassword(passwords.current, passwords.new);
      toast.success('تم!', 'تم تغيير كلمة المرور بنجاح');
      setShowPasswordModal(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error('خطأ', error.message || 'فشل تغيير كلمة المرور');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success('تم!', 'تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  // Handle export data
  const handleExportData = async () => {
    try {
      const data = await userService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `docuchat-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('تم!', 'تم تصدير بياناتك');
    } catch (error: any) {
      toast.error('خطأ', error.message || 'فشل تصدير البيانات');
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('خطأ', 'يرجى إدخال كلمة المرور');
      return;
    }

    try {
      await userService.deleteAccount(deletePassword);
      toast.success('تم!', 'تم حذف حسابك');
      logout();
      navigate('/');
    } catch (error: any) {
      toast.error('خطأ', error.message || 'فشل حذف الحساب');
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white selection:bg-[#2873ec]/30 overflow-hidden relative">
      <div className="pt-4 flex justify-center px-4 relative z-20">
        <Header />
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2873ec]/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1a5bb8]/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-[#2873ec]/10 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            حسابي
          </h1>
          <p className="text-gray-400">إدارة معلوماتك الشخصية وإعداداتك</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-[#2873ec]/30 transition-all duration-300">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#2873ec]/30 bg-gradient-to-br from-[#2873ec]/20 to-[#1a5bb8]/20 flex items-center justify-center">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-bold text-[#2873ec]">
                        {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-[#2873ec] hover:bg-[#1a5bb8] text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
                  >
                    <FaCamera size={16} />
                  </button>
                  {profileImage && (
                    <button
                      onClick={handleDeleteImage}
                      className="absolute bottom-0 left-0 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
                    >
                      <FaTrash size={16} />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <h2 className="mt-4 text-xl font-bold">{formData.firstName} {formData.lastName}</h2>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-[#2873ec]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FaCrown className="text-yellow-400" />
                  الباقة الحالية
                </h3>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                  {currentTier.name}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {currentTier.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                    <FaCheck className="text-green-400" size={12} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>الاستخدام</span>
                  <span>{user?.filesCount || 0} / {currentTier.limit}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>

              {user?.subscriptionTier !== 'premium' && (
                <Link to="/pricing">
                  <button className="w-full mt-4 bg-gradient-to-r from-[#2873ec] to-[#1a5bb8] text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-all">
                    ترقية الباقة
                  </button>
                </Link>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-[#2873ec]/30 transition-all duration-300">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <FaKey className="text-yellow-400" />
                كود التفعيل 🔑
              </h3>
              <p className="text-xs text-gray-400 mb-3">{activationCode || '4353524252'}</p>
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="أدخل الكود (10 أرقام)"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all mb-3"
              />
              <button
                onClick={handleActivateCode}
                disabled={activationCode.length !== 10 || isActivating}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isActivating ? 'جاري التفعيل...' : 'تفعيل'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-[#2873ec]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">معلومات الحساب</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[#2873ec] hover:text-[#1a5bb8] text-sm font-medium transition-colors"
                  >
                    تعديل
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-[#2873ec] hover:bg-[#1a5bb8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          firstName: user?.firstName || user?.fullName?.split(' ')[0] || '',
                          lastName: user?.lastName || user?.fullName?.split(' ').slice(1).join(' ') || '',
                        });
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">الاسم الأول</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">الاسم الأخير</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">لا يمكن تعديل البريد الإلكتروني</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-[#2873ec]/30 transition-all duration-300">
              <h3 className="text-xl font-bold mb-4">الأمان</h3>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <FaLock className="text-[#2873ec]" />
                  <span>تغيير كلمة المرور</span>
                </div>
                <span className="text-gray-400 group-hover:text-white transition-colors">←</span>
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-[#2873ec]/30 transition-all duration-300">
              <h3 className="text-xl font-bold mb-4">إجراءات الحساب</h3>
              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FaSignOutAlt className="text-blue-400" />
                    <span>تسجيل الخروج</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-white transition-colors">←</span>
                </button>

                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FaDownload className="text-green-400" />
                    <span>تصدير بياناتي</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-white transition-colors">←</span>
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-between bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FaUserSlash className="text-red-400" />
                    <span className="text-red-400">حذف الحساب</span>
                  </div>
                  <span className="text-red-400 group-hover:text-red-300 transition-colors">←</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4">تغيير كلمة المرور</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all"
                />
              </div>
              <Link to="/forgot-password" className="text-sm text-[#2873ec] hover:text-[#1a5bb8] transition-colors block">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleChangePassword}
                className="flex-1 bg-[#2873ec] hover:bg-[#1a5bb8] text-white py-2.5 rounded-xl font-medium transition-all"
              >
                حفظ
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswords({ current: '', new: '', confirm: '' });
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-medium transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-red-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-red-400">حذف الحساب</h3>
            <p className="text-gray-400 text-sm mb-4">هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.</p>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">أدخل كلمة المرور للتأكيد</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition-all"
              >
                حذف الحساب
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-medium transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showCropModal && tempImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 max-w-2xl w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4">قص الصورة</h3>
            <div 
              className="relative w-full h-96 bg-black rounded-xl overflow-hidden mb-4 cursor-move"
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
            >
              <img src={tempImage} alt="Crop" className="absolute inset-0 w-full h-full object-contain" />
              <div 
                className="absolute border-4 border-[#2873ec] rounded-full pointer-events-none"
                style={{
                  left: `${cropData.x}px`,
                  top: `${cropData.y}px`,
                  width: `${cropData.size}px`,
                  height: `${cropData.size}px`,
                }}
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-3">
              <button
                onClick={handleCropSave}
                className="flex-1 bg-[#2873ec] hover:bg-[#1a5bb8] text-white py-2.5 rounded-xl font-medium transition-all"
              >
                حفظ
              </button>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setTempImage(null);
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-medium transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
