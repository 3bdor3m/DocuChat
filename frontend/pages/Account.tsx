import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from 'react-easy-crop';
import { getCroppedImg } from "../src/utils/canvasUtils.ts";
import { Header } from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userService } from "../services/userService";
import { activationCodeService } from "../services/activationCodeService";
import { FaCamera, FaTrash, FaCrown, FaKey, FaLock, FaSignOutAlt, FaUserSlash, FaDownload, FaTimes, FaSave, FaExclamationTriangle } from "react-icons/fa";
import SpotlightCard from "../components/SpotlightCard";

const Account = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States الأساسية
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '' });

  // States الصور والقص
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // States كلمات المرور والتفعيل
  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // 🔥 States الحذف (مع الاستبيان)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  // 🔥 States تسجيل الخروج (مع التأكيد)
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutConfirmation, setLogoutConfirmation] = useState('');

  // أسباب الحذف المقترحة
  const deleteReasons = [
    "الخدمة باهظة الثمن",
    "صعوبة في الاستخدام",
    "وجدت بديلاً أفضل",
    "لا أحتاج الخدمة حالياً",
    "أخرى"
  ];

  // تحميل البيانات
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || user.fullName?.split(' ')[0] || '',
        lastName: user.lastName || user.fullName?.split(' ').slice(1).join(' ') || '',
      });
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  const subscriptionTiers = {
    free: { name: 'مجاني', color: 'gray', limit: 5, features: ['5 ملفات', '10 محادثات', 'دعم أساسي'] },
    basic: { name: 'أساسي', color: 'blue', limit: 20, features: ['20 ملف', '50 محادثة', 'دعم سريع', 'بدون إعلانات'] },
    premium: { name: 'مميز', color: 'yellow', limit: 100, features: ['ملفات غير محدودة', 'محادثات غير محدودة', 'دعم أولوية', 'ميزات متقدمة'] },
  };
  const currentTier = subscriptionTiers[user?.subscriptionTier as keyof typeof subscriptionTiers] || subscriptionTiers.free;
  const usagePercentage = ((user?.filesCount || 0) / currentTier.limit) * 100;

  // --- دوال الصور ---
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => { setTempImage(reader.result as string); setShowCropModal(true); setZoom(1); });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => { setCroppedAreaPixels(croppedAreaPixels); }, []);

  const handleCropSave = async () => {
    if (!tempImage || !croppedAreaPixels) return;
    try {
      const croppedImageBase64 = await getCroppedImg(tempImage, croppedAreaPixels);
      await userService.updateProfileImage(croppedImageBase64);
      setProfileImage(croppedImageBase64);
      if (user) updateUser({ ...user, profileImage: croppedImageBase64 });
      setShowCropModal(false); setTempImage(null); toast.success('تم!', 'تم تحديث الصورة الشخصية');
    } catch (e: any) { toast.error('خطأ', 'فشل حفظ الصورة'); }
  };

  const handleDeleteImage = async () => {
    try { await userService.deleteProfileImage(); setProfileImage(null); if (user) updateUser({ ...user, profileImage: null }); toast.success('تم!', 'تم الحذف'); }
    catch (e) { toast.error('خطأ', 'فشل الحذف'); }
  };

  // --- دوال الإجراءات ---
  const handleSaveProfile = async () => { setIsSaving(true); try { const u = await userService.updateProfile(formData); updateUser(u); setIsEditing(false); toast.success('تم', 'تم التحديث'); } catch (e) { toast.error('خطأ', 'فشل التحديث'); } finally { setIsSaving(false); } };
  // Account.tsx

  const handleActivateCode = async () => {
    // التحقق من الطول
    if (activationCode.length !== 10) {
      toast.error('خطأ', 'الكود يجب أن يكون 10 أرقام');
      return;
    }

    setIsActivating(true);
    try {
      // 1. إرسال طلب التفعيل واستقبال الرد
      const response = await activationCodeService.activate(activationCode);

      // 2. تحديث بيانات المستخدم في المتصفح فوراً (بدون ريلود)
      // السيرفر يرجع لنا object اسمه user بداخله subscriptionTier الجديد
      if (response.user && user) {
        updateUser({ ...user, subscriptionTier: response.user.subscriptionTier });
      }

      toast.success('تم!', 'مبروك! تم ترقية باقتك بنجاح 🎉');
      setActivationCode('');

      // ❌ احذف هذا السطر (لا نريد إعادة تحميل الصفحة)
      // window.location.reload();

    } catch (e: any) {
      console.error(e);
      // عرض رسالة الخطأ القادمة من السيرفر (مثل: الكود مستخدم، منتهي...)
      const errorMessage = e.response?.data?.error || 'كود التفعيل غير صحيح';
      toast.error('خطأ', errorMessage);
    } finally {
      setIsActivating(false);
    }
  };
  const handleChangePassword = async () => { if (!passwords.current || !passwords.new) return; try { await userService.changePassword(passwords.current, passwords.new); toast.success('تم', 'تم التغيير'); setShowPasswordModal(false); } catch (e) { toast.error('خطأ', 'فشل التغيير'); } };

  // 🔥🔥🔥 دالة التصدير المعدلة (تعمل الآن) 🔥🔥🔥
  const handleExportData = async () => {
    try {
      const response = await userService.exportData();

      // التأكد من أننا نأخذ البيانات الصحيحة سواء جاءت في data أو مباشرة
      const dataToExport = response.data || response;

      // إنشاء ملف JSON في المتصفح
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `docuchat-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();

      // تنظيف الذاكرة
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('تم!', 'تم تصدير بياناتك بنجاح');
    } catch (e: any) {
      console.error(e);
      toast.error('خطأ', 'فشل تصدير البيانات');
    }
  };

  // 🔥 دالة تسجيل الخروج الجديدة مع التحقق
  const handleLogoutAction = () => {
    if (logoutConfirmation === 'تسجيل خروج') {
      logout();
      toast.success('إلى اللقاء!', 'تم تسجيل الخروج بنجاح');
      navigate('/');
    } else {
      toast.error('خطأ', 'يرجى كتابة "تسجيل خروج" للتأكيد');
    }
  };

  // 🔥 دالة حذف الحساب الجديدة
  const handleDeleteAccount = async () => {
    if (!deletePassword) { toast.error('خطأ', 'كلمة المرور مطلوبة'); return; }
    if (!deleteReason) { toast.error('خطأ', 'يرجى اختيار سبب المغادرة'); return; }

    try {
      await userService.deleteAccount(deletePassword, deleteReason);
      toast.success('تم!', 'تم حذف حسابك');
      logout();
      navigate('/');
    } catch (e: any) {
      toast.error('خطأ', 'فشل حذف الحساب (تأكد من كلمة المرور)');
    }
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-black text-white selection:bg-[#2873ec]/30 overflow-hidden relative">
      <div className="pt-4 flex justify-center px-4 relative z-20"><Header /></div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2873ec]/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1a5bb8]/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">حسابي</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.4)">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full w-full">
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#2873ec]/30 bg-gradient-to-br from-[#2873ec]/20 to-[#1a5bb8]/20 flex items-center justify-center">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl font-bold text-[#2873ec]">
                          {formData.firstName?.charAt(0) || 'U'}{formData.lastName?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-[#2873ec] hover:bg-[#1a5bb8] text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110"><FaCamera size={16} /></button>
                    {profileImage && (<button onClick={handleDeleteImage} className="absolute bottom-0 left-0 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110"><FaTrash size={16} /></button>)}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  <h2 className="mt-4 text-xl font-bold">{user.firstName} {user.lastName}</h2>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(255, 200, 0, 0.2)">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full w-full">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><FaCrown className="text-yellow-400" /> الباقة الحالية</h3>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">{currentTier.name}</span>
                <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min(usagePercentage, 100)}%` }} />
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.4)">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full w-full">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><FaKey className="text-yellow-400" /> كود التفعيل 🔑</h3>
                <div className="flex gap-2">
                  <input type="text" value={activationCode} onChange={(e) => setActivationCode(e.target.value)} placeholder="أدخل الكود" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white" />
                  <button onClick={handleActivateCode} disabled={isActivating} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl">تفعيل</button>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Left Column (Forms) */}
          <div className="lg:col-span-2 space-y-6">
            <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.4)">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full w-full">
                <div className="flex justify-between mb-6">
                  <h3 className="text-xl font-bold">معلومات الحساب</h3>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="text-[#2873ec]">تعديل</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={handleSaveProfile} disabled={isSaving} className="bg-[#2873ec] text-white px-4 py-2 rounded-lg">{isSaving ? '...' : 'حفظ'}</button>
                      <button onClick={() => setIsEditing(false)} className="bg-white/10 text-white px-4 py-2 rounded-lg">إلغاء</button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">الاسم الأول</label>
                    <input type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} disabled={!isEditing} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#2873ec] outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">الاسم الأخير</label>
                    <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} disabled={!isEditing} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#2873ec] outline-none" />
                  </div>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.4)">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full w-full">
                <h3 className="text-xl font-bold mb-4">الأمان والإجراءات</h3>
                <div className="space-y-3">
                  <button onClick={() => setShowPasswordModal(true)} className="w-full flex justify-between p-3 bg-white/5 rounded-xl"><div className="flex gap-3"><FaLock className="text-[#2873ec]" /> تغيير كلمة المرور</div><span>←</span></button>
                  <button onClick={handleExportData} className="w-full flex justify-between p-3 bg-white/5 rounded-xl"><div className="flex gap-3"><FaDownload className="text-green-400" /> تصدير بياناتي</div><span>←</span></button>
                  <button onClick={() => setShowLogoutModal(true)} className="w-full flex justify-between p-3 bg-white/5 rounded-xl"><div className="flex gap-3"><FaSignOutAlt className="text-blue-400" /> تسجيل خروج</div><span>←</span></button>
                  <button onClick={() => setShowDeleteModal(true)} className="w-full flex justify-between p-3 bg-red-500/10 rounded-xl text-red-400"><div className="flex gap-3"><FaUserSlash /> حذف الحساب</div><span>←</span></button>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>

      {/* 🔥🔥🔥 MODAL تسجيل الخروج الجديد 🔥🔥🔥 */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-2">تأكيد تسجيل الخروج</h3>
            <p className="text-gray-400 text-sm mb-4">للتأكيد، يرجى كتابة <span className="text-white font-bold">"تسجيل خروج"</span> في المربع أدناه.</p>

            <input
              type="text"
              value={logoutConfirmation}
              onChange={(e) => setLogoutConfirmation(e.target.value)}
              placeholder="تسجيل خروج"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:border-[#2873ec] outline-none text-center"
            />

            <div className="flex gap-3">
              <button
                onClick={handleLogoutAction}
                disabled={logoutConfirmation !== 'تسجيل خروج'}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                خروج
              </button>
              <button onClick={() => { setShowLogoutModal(false); setLogoutConfirmation(''); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-medium transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥🔥🔥 MODAL حذف الحساب الجديد مع الاستبيان 🔥🔥🔥 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-red-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-2 text-red-500">
              <FaExclamationTriangle />
              <h3 className="text-xl font-bold">حذف الحساب نهائياً</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">يؤسفنا رؤيتك تغادر. هذا الإجراء لا يمكن التراجع عنه.</p>

            <div className="space-y-4 mb-6">
              {/* الاستبيان */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">لماذا قررت المغادرة؟</label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none appearance-none"
                >
                  <option value="">-- اختر سبباً --</option>
                  {deleteReasons.map((reason, idx) => (
                    <option key={idx} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              {/* كلمة المرور */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">أدخل كلمة المرور للتأكيد</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={!deletePassword || !deleteReason}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                حذف نهائي
              </button>
              <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteReason(''); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-medium transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* باقي المودالز (Password, Crop) كما هي... */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4">تغيير كلمة المرور</h3>
            <div className="space-y-4">
              <div><label className="block text-sm text-gray-400 mb-2">كلمة المرور الحالية</label><input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 transition-all" /></div>
              <div><label className="block text-sm text-gray-400 mb-2">كلمة المرور الجديدة</label><input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 transition-all" /></div>
              <div><label className="block text-sm text-gray-400 mb-2">تأكيد كلمة المرور</label><input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 transition-all" /></div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={handleChangePassword} className="flex-1 bg-[#2873ec] hover:bg-[#1a5bb8] text-white py-2.5 rounded-xl font-medium transition-all">حفظ</button><button onClick={() => { setShowPasswordModal(false); setPasswords({ current: '', new: '', confirm: '' }); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-medium transition-all">إلغاء</button></div>
          </div>
        </div>
      )}

      {showCropModal && tempImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-white/10"><h3 className="text-lg font-bold">قص الصورة الشخصية</h3><button onClick={() => setShowCropModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button></div>
            <div className="relative w-full h-[350px] bg-black">
              <Cropper image={tempImage} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>
            <div className="p-6 space-y-6">
              <div><label className="text-xs text-gray-400 mb-2 block flex justify-between"><span>التقريب (Zoom)</span><span>{(zoom * 100).toFixed(0)}%</span></label><input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#2873ec]" /></div>
              <div className="flex gap-3"><button onClick={handleCropSave} className="flex-1 bg-[#2873ec] hover:bg-[#1a5bb8] text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"><FaSave /> حفظ الصورة</button><button onClick={() => setShowCropModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-all">إلغاء</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;