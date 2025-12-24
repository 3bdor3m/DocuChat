import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import Magnet from "../components/Magnet";
import { FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import { authService } from "../services/authService";
import { useToast } from "../context/ToastContext";

const Signup = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreed: false,
  });

  const [errors, setErrors] = useState({
    email: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "";
    if (!regex.test(email)) {
      return "يرجى إدخال بريد إلكتروني صحيح";
    }
    return "";
  };

  // --- التعديل هنا: تحديث الشروط لتطابق الـ Backend (إضافة شرط الرقم) ---
  const passwordRequirements = [
    { id: 1, text: "8 أحرف على الأقل", met: formData.password.length >= 8 },
    { id: 2, text: "حرف كبير واحد على الأقل", met: /[A-Z]/.test(formData.password) },
    { id: 3, text: "رقم واحد على الأقل", met: /\d/.test(formData.password) }, // عدلنا هذا الشرط ليطلب رقم
    { id: 4, text: "أحرف إنجليزية فقط", met: /^[\x00-\x7F]*$/.test(formData.password) && formData.password.length > 0 },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
    setErrorMessage(""); 

    if (id === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const emailError = validateEmail(formData.email);
    const allRequirementsMet = passwordRequirements.every(req => req.met);
    
    // تنظيف المدخلات من المسافات الزائدة
    const cleanFirstName = formData.firstName.trim();
    const cleanLastName = formData.lastName.trim();

    if (emailError || !allRequirementsMet || !cleanFirstName || !cleanLastName || !formData.agreed) {
      setErrors({ email: emailError });
      
      // --- التعديل هنا: شروط أكثر دقة للاسم ---
      if (!cleanFirstName) {
        setErrorMessage("يرجى إدخال الاسم الأول");
      } else if (cleanFirstName.length < 2) {
        setErrorMessage("الاسم الأول يجب أن يكون حرفين على الأقل");
      } else if (!cleanLastName) {
        setErrorMessage("يرجى إدخال الاسم الأخير");
      } else if (cleanLastName.length < 2) {
        setErrorMessage("الاسم الأخير يجب أن يكون حرفين على الأقل");
      } 
      // ----------------------------------------
      
      else if (!allRequirementsMet) setErrorMessage("كلمة المرور لا تستوفي المتطلبات");
      else if (!formData.agreed) setErrorMessage("يجب الموافقة على الشروط والأحكام");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const fullName = `${cleanFirstName} ${cleanLastName}`;
      
      // Register
      await authService.register({
        email: formData.email,
        password: formData.password,
        firstName: cleanFirstName,
        lastName: cleanLastName,
      });
      
      // Show success toast
      toast.success('تم التسجيل!', 'تم إنشاء حسابك بنجاح. مرحباً بك!');
      
      // Auto login after registration
      await authService.login({
        email: formData.email,
        password: formData.password,
      });
      
      // Start countdown
      setShowCountdown(true);
      let timeLeft = 10;
      setCountdown(timeLeft);

      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          navigate('/chat');
        }
      }, 1000);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      setErrorMessage(error.message || "فشل التسجيل");
      toast.error('خطأ', error.message || "فشل التسجيل");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white selection:bg-[#2873ec]/30 overflow-hidden relative">
      <div className="pt-4 flex justify-center px-4 relative z-20">
        <Header />
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2873ec]/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1a5bb8]/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-[#2873ec]/10 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
              إنشاء حساب جديد
            </h1>
            <p className="text-gray-400">انضم إلينا وابدأ رحلتك اليوم</p>
          </div>

          <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Countdown Display */}
              {showCountdown && countdown > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-green-400 text-center font-medium mb-2">
                    سوف يتم تحويلك إلى حسابك خلال {countdown} {countdown === 1 ? 'ثانية' : 'ثواني'}
                  </p>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(countdown / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* الاسم الأول والأخير - جنب بعض */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block" htmlFor="firstName">
                    الاسم الأول
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isLoading || showCountdown}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="أحمد"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block" htmlFor="lastName">
                    الاسم الأخير
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isLoading || showCountdown}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="محمد"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block" htmlFor="email">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading || showCountdown}
                  className={`w-full bg-black/20 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.email
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/10 focus:border-[#2873ec]/50 focus:ring-[#2873ec]/50"
                    }`}
                  placeholder="name@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block" htmlFor="password">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    disabled={isLoading || showCountdown}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Password Requirements */}
                {isPasswordFocused && (
                  <div className="mt-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    {passwordRequirements.map((req) => (
                      <div key={req.id} className={`flex items-center gap-2 text-xs transition-colors ${req.met ? 'text-green-400' : 'text-gray-500'}`}>
                        {req.met ? <FaCheck size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-600" />}
                        <span>{req.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="relative flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    id="agreed"
                    checked={formData.agreed}
                    onChange={handleChange}
                    disabled={isLoading || showCountdown}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${formData.agreed
                    ? "bg-linear-to-r from-[#2873ec] to-[#1a5bb8] border-transparent shadow-[0_0_10px_rgba(40,115,236,0.3)]"
                    : "bg-white/5 border-white/10 group-hover:border-[#2873ec]/50"
                    }`}>
                    <FaCheck size={10} className={`text-white transition-all duration-300 ${formData.agreed ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
                  </div>
                </label>
                <label htmlFor="agreed" className="text-xs text-gray-400 select-none cursor-pointer">
                  أوافق على <a href="#" className="text-[#2873ec] hover:underline">شروط الاستخدام</a> و <a href="#" className="text-[#2873ec] hover:underline">سياسة الخصوصية</a>
                </label>
              </div>

              <div className="flex justify-center mt-6">
                <Magnet padding={10} disabled={!formData.agreed || isLoading || showCountdown} magnetStrength={5}>
                  <button
                    type="submit"
                    disabled={!formData.agreed || isLoading || showCountdown}
                    className={`min-w-[200px] font-medium py-3.5 px-8 rounded-xl shadow-lg transition-all duration-300 transform ${formData.agreed && !isLoading && !showCountdown
                      ? "bg-linear-to-r from-[#2873ec] to-[#1a5bb8] text-white shadow-[#2873ec]/25 hover:opacity-90 hover:-translate-y-0.5 cursor-pointer"
                      : "bg-gray-600 text-gray-300 cursor-not-allowed opacity-50"
                      }`}
                  >
                    {isLoading ? "جاري إنشاء الحساب..." : showCountdown ? `التحويل بعد ${countdown}...` : "إنشاء حساب"}
                  </button>
                </Magnet>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-gray-400">
              لديك حساب بالفعل؟{' '}
              <a href="/login" className="text-[#2873ec] hover:text-[#4a8fff] font-medium transition-colors">
                تسجيل الدخول
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;