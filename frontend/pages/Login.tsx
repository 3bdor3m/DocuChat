import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import Magnet from "../components/Magnet";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ForgotPasswordModal } from "../components/ForgotPasswordModal";
import { authService } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "";
    if (!regex.test(email)) {
      return "يرجى إدخال بريد إلكتروني صحيح";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrorMessage(""); // Clear error message on input change

    if (id === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const emailError = validateEmail(formData.email);
    if (emailError || !formData.password) {
      setErrors({ email: emailError });
      if (!formData.password) {
        setErrorMessage("يرجى إدخال كلمة المرور");
      }
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await authService.login({
        email: formData.email,
        password: formData.password,
      });
      
      // Redirect to account page
      navigate("/account");
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "فشل تسجيل الدخول");
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
              تسجيل الدخول
            </h1>
            <p className="text-gray-400">مرحباً بعودتك، سجل دخولك للمتابعة</p>
          </div>

          <div className="bg-white/3 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block" htmlFor="email">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
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
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-300 block" htmlFor="password">
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-xs text-[#2873ec] hover:text-[#4a8fff] transition-colors cursor-pointer"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
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
              </div>

              <div className="flex justify-center mt-6">
                <Magnet padding={10} disabled={isLoading} magnetStrength={5}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="cursor-pointer min-w-[200px] bg-linear-to-r from-[#2873ec] to-[#1a5bb8] text-white font-medium py-3.5 px-8 rounded-xl shadow-lg shadow-[#2873ec]/25 hover:opacity-90 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </button>
                </Magnet>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-gray-400">
              ليس لديك حساب؟{' '}
              <a href="/signup" className="text-[#2873ec] hover:text-[#4a8fff] font-medium transition-colors">
                إنشاء حساب
              </a>
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
};

export default Login;
