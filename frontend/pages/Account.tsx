import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userService } from "../services/userService";
import { activationCodeService } from "../services/activationCodeService";
import { FaCamera, FaTrash, FaCrown, FaKey, FaLock, FaSignOutAlt, FaUserSlash, FaDownload, FaCheck, FaUser, FaEnvelope } from "react-icons/fa";
import SpotlightCard from "../components/SpotlightCard";

const Account = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs للحسابات الدقيقة
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });

  // تحديث البيانات عند تحميل المستخدم
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || user.fullName?.split(' ')[0] || '',
        lastName: user.lastName || user.fullName?.split(' ').slice(1).join(' ') || '',
      });
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropData, setCropData] = useState({ x: 0, y: 0, size: 0 }); // نبدأ بـ 0 وسيتم الحساب عند التحميل
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // State لبقية المدخلات
  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
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

  // اختيار الصورة
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('خطأ', 'يرجى اختيار صورة صحيحة');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setTempImage(event.target?.result as string);
      setShowCropModal(true);
      // ملاحظة: لا نحدد cropData هنا، بل ننتظر حدث onLoad للصورة في الأسفل
    };
    reader.readAsDataURL(file);
  };

  // 🔥 دالة ذكية تعمل عند اكتمال تحميل الصورة داخل المودال
  const onImageLoad = () => {
    if (!imgRef.current || !containerRef.current) return;

    const img = imgRef.current;
    const container = containerRef.current;

    // حساب الأبعاد الظاهرة للصورة (قد تكون أصغر من الحاوية بسبب object-contain)
    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // حساب الإزاحة (كم تبعد الصورة عن حواف الحاوية)
    const offsetLeft = imgRect.left - containerRect.left;
    const offsetTop = imgRect.top - containerRect.top;

    // تحديد حجم القص ليكون 80% من البعد الأصغر للصورة
    const initialSize = Math.min(imgRect.width, imgRect.height) * 0.8;

    // توسيط دائرة القص داخل الصورة بالضبط
    setCropData({
      x: offsetLeft + (imgRect.width - initialSize) / 2,
      y: offsetTop + (imgRect.height - initialSize) / 2,
      size: initialSize
    });
  };

  // التعامل مع سحب القص
  const handleCropMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    // نحفظ نقطة البداية بالنسبة لموقع الدائرة الحالي
    setDragStart({ x: e.clientX - cropData.x, y: e.clientY - cropData.y });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imgRef.current || !containerRef.current) return;

    const imgRect = imgRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // حدود الصورة بالنسبة للحاوية
    const minX = imgRect.left - containerRect.left;
    const minY = imgRect.top - containerRect.top;
    const maxX = minX + imgRect.width - cropData.size;
    const maxY = minY + imgRect.height - cropData.size;

    // حساب الموقع الجديد مع التقيد بحدود الصورة فقط
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    setCropData({ ...cropData, x: newX, y: newY });
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
  };

  // حفظ الصورة المقصوصة
  // حفظ الصورة المقصوصة (نسخة محسنة ومحمية من الأخطاء)
  const handleCropSave = async () => {
    // 1. فحوصات الأمان الأولية
    if (!canvasRef.current || !tempImage || !imgRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imgEl = imgRef.current;
    const container = containerRef.current;

    if (!ctx) return;

    // التأكد من أن الأبعاد صالحة لمنع القسمة على صفر
    const imgRect = imgEl.getBoundingClientRect();
    if (imgRect.width === 0 || imgRect.height === 0) {
      toast.error('خطأ', 'تعذر تحديد أبعاد الصورة');
      return;
    }

    const img = new Image();
    // تفعيل CORS إذا كانت الصورة من مصدر خارجي
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      try {
        // حساب الإزاحة
        const containerRect = container.getBoundingClientRect();
        const offsetLeft = imgRect.left - containerRect.left;
        const offsetTop = imgRect.top - containerRect.top;

        // حساب الإحداثيات النسبية
        const relativeX = cropData.x - offsetLeft;
        const relativeY = cropData.y - offsetTop;

        // حساب نسبة التكبير (مع الحماية من القيم غير المنطقية)
        const scaleX = img.naturalWidth / imgRect.width;
        const scaleY = img.naturalHeight / imgRect.height;

        // إعداد الكانفاس بحجم ثابت ومناسب (300px كافية جداً للبروفايل)
        canvas.width = 300;
        canvas.height = 300;

        // تنظيف الكانفاس قبل الرسم
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // الرسم النهائي
        ctx.drawImage(
          img,
          relativeX * scaleX,
          relativeY * scaleY,
          cropData.size * scaleX,
          cropData.size * scaleY,
          0, 0, 300, 300
        );

        // تقليل الجودة قليلاً (0.7) لتقليل حجم النص المرسل وتجنب خطأ 400
        const croppedImage = canvas.toDataURL('image/jpeg', 0.7);

        // التحقق من أن السلسلة الناتجة ليست فارغة
        if (croppedImage.length < 100) {
          throw new Error("فشل إنشاء الصورة");
        }

        console.log("Image Size:", Math.round(croppedImage.length / 1024), "KB"); // للمراقبة في الكونسول

        // الإرسال للسيرفر
        await userService.updateProfileImage(croppedImage);

        // تحديث الواجهة
        setProfileImage(croppedImage);
        if (user) updateUser({ ...user, profileImage: croppedImage });

        setShowCropModal(false);
        setTempImage(null);
        toast.success('تم!', 'تم تحديث الصورة الشخصية');

      } catch (error: any) {
        console.error("Crop Error:", error);
        // عرض رسالة أوضح حسب نوع الخطأ
        if (error.response && error.response.status === 400) {
          toast.error('خطأ', 'حجم الصورة كبير جداً أو التنسيق غير مقبول');
        } else {
          toast.error('خطأ', 'فشل معالجة الصورة');
        }
      }
    };

    img.src = tempImage;
  };

  // بقية الدوال كما هي (Delete, SaveProfile, Activate, Password, Logout, Export, DeleteAccount)
  const handleDeleteImage = async () => {
    try {
      await userService.updateProfileImage('');
      setProfileImage(null);
      if (user) updateUser({ ...user, profileImage: null });
      toast.success('تم!', 'تم حذف الصورة الشخصية');
    } catch (error: any) {
      toast.error('خطأ', error.message || 'فشل حذف الصورة');
    }
  };

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

  const handleLogoutAction = () => {
    logout();
    toast.success('تم!', 'تم تسجيل الخروج بنجاح');
    navigate('/');
  };

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

  if (!user) return null;

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
            <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.4)">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full w-full relative overflow-hidden">
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
                  <h2 className="mt-4 text-xl font-bold">{user.firstName} {user.lastName}</h2>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(255, 200, 0, 0.2)">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full w-full relative overflow-hidden">
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
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.4)">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full w-full relative overflow-hidden">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <FaKey className="text-yellow-400" />
                  كود التفعيل 🔑
                </h3>
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
            </SpotlightCard>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* ... بطاقات معلومات الحساب والأمان والإجراءات كما هي (لم تتغير) ... */}
            {/* سأختصرها هنا لتوفير المساحة، انسخ نفس الجزء من الكود السابق إذا لزم الأمر، أو أخبرني لأعيده كاملاً */}
            {/* لكن للأمان، سأضع البطاقات الثلاثة الأساسية هنا كاملة */}

            <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.4)">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full w-full relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">معلومات الحساب</h3>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="text-[#2873ec] hover:text-[#1a5bb8] text-sm font-medium transition-colors">تعديل</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={handleSaveProfile} disabled={isSaving} className="bg-[#2873ec] hover:bg-[#1a5bb8] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50">{isSaving ? 'جاري الحفظ...' : 'حفظ'}</button>
                      <button onClick={() => { setIsEditing(false); setFormData({ firstName: user?.firstName || '', lastName: user?.lastName || '' }); }} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">إلغاء</button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">الاسم الأول</label>
                    <div className="relative"><FaUser className="absolute right-3 top-3.5 text-gray-500" /><input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} disabled={!isEditing} className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 transition-all disabled:opacity-50" /></div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">الاسم الأخير</label>
                    <div className="relative"><FaUser className="absolute right-3 top-3.5 text-gray-500" /><input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} disabled={!isEditing} className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 transition-all disabled:opacity-50" /></div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">البريد الإلكتروني</label>
                    <div className="relative"><FaEnvelope className="absolute right-3 top-3.5 text-gray-500" /><input type="email" value={user?.email} disabled className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-gray-500 cursor-not-allowed" /></div>
                  </div>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.4)">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full w-full relative overflow-hidden">
                <h3 className="text-xl font-bold mb-4">الأمان</h3>
                <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-all group">
                  <div className="flex items-center gap-3"><FaLock className="text-[#2873ec]" /><span>تغيير كلمة المرور</span></div><span className="text-gray-400 group-hover:text-white transition-colors">←</span>
                </button>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.4)">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full w-full relative overflow-hidden">
                <h3 className="text-xl font-bold mb-4">إجراءات الحساب</h3>
                <div className="space-y-3">
                  <button onClick={handleLogoutAction} className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-all group"><div className="flex items-center gap-3"><FaSignOutAlt className="text-blue-400" /><span>تسجيل الخروج</span></div><span className="text-gray-400 group-hover:text-white transition-colors">←</span></button>
                  <button onClick={handleExportData} className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-all group"><div className="flex items-center gap-3"><FaDownload className="text-green-400" /><span>تصدير بياناتي</span></div><span className="text-gray-400 group-hover:text-white transition-colors">←</span></button>
                  <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center justify-between bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 transition-all group"><div className="flex items-center gap-3"><FaUserSlash className="text-red-400" /><span className="text-red-400">حذف الحساب</span></div><span className="text-red-400 group-hover:text-red-300 transition-colors">←</span></button>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>

      {/* Modals - Same as before */}
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-red-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-red-400">حذف الحساب</h3>
            <p className="text-gray-400 text-sm mb-4">هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.</p>
            <div className="mb-4"><label className="block text-sm text-gray-400 mb-2">أدخل كلمة المرور للتأكيد</label><input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="كلمة المرور" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-all" /></div>
            <div className="flex gap-3"><button onClick={handleDeleteAccount} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition-all">حذف الحساب</button><button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-medium transition-all">إلغاء</button></div>
          </div>
        </div>
      )}

      {/* 🔥 الجزء المعدل جذرياً لإصلاح مشكلة القص */}
      {showCropModal && tempImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4">قص الصورة</h3>

            {/* Container */}
            <div
              ref={containerRef}
              className="relative w-full overflow-hidden mb-4 cursor-move bg-black rounded-xl flex items-center justify-center"
              style={{ minHeight: '300px', flex: 1 }}
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
            >
              {/* Image with onLoad to calculate initial crop */}
              <img
                ref={imgRef}
                src={tempImage}
                alt="Crop"
                onLoad={onImageLoad} // 🔥 هنا يكمن السحر
                className="max-w-full max-h-full object-contain pointer-events-none select-none"
                style={{ maxHeight: '60vh' }}
              />

              {/* Crop Circle */}
              <div
                className="absolute border-2 border-[#2873ec] rounded-full pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
                style={{
                  left: `${cropData.x}px`,
                  top: `${cropData.y}px`,
                  width: `${cropData.size}px`,
                  height: `${cropData.size}px`,
                }}
              />
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-3 mt-auto">
              <button onClick={handleCropSave} className="flex-1 bg-[#2873ec] hover:bg-[#1a5bb8] text-white py-2.5 rounded-xl font-medium transition-all">حفظ</button>
              <button onClick={() => { setShowCropModal(false); setTempImage(null); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-medium transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;