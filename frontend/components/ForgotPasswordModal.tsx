import { useState, useRef } from "react";
import { FaTimes, FaEnvelope, FaLock, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import Magnet from "./Magnet";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numbers
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const code = codeDigits.join("");
    if (code.length < 4) {
      setError("يرجى إدخال الرمز المكون من 4 أرقام");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Here you would typically redirect to reset password or show success
      onClose();
      // Reset state after closing
      setTimeout(() => {
        setStep(1);
        setEmail("");
        setCodeDigits(["", "", "", ""]);
      }, 300);
    }, 1500);
  };

  const handleResend = () => {
    setCodeDigits(["", "", "", ""]);
    setError("");
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Show success message or toast
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Background Glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[#2873ec]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-[#1a5bb8]/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
        >
          <FaTimes />
        </button>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#2873ec]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#2873ec]/20 text-[#2873ec]">
              {step === 1 ? <FaEnvelope size={24} /> : <FaLock size={24} />}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {step === 1 ? "نسيت كلمة المرور؟" : "تحقق من بريدك"}
            </h2>
            <p className="text-gray-400 text-sm">
              {step === 1
                ? "أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق"
                : `تم إرسال رمز التحقق إلى ${email}`
              }
            </p>
          </div>

          <form onSubmit={step === 1 ? handleSendCode : handleVerifyCode} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#2873ec]/50 focus:ring-1 focus:ring-[#2873ec]/50 transition-all text-right"
                  placeholder="name@example.com"
                  autoFocus
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* 4 Digit Input Boxes */}
                <div className="flex justify-center gap-3" dir="ltr">
                  {codeDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl text-white text-2xl font-semibold text-center focus:outline-none focus:border-[#2873ec] focus:ring-2 focus:ring-[#2873ec]/20 transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-xs text-center animate-pulse">
                {error}
              </p>
            )}

            <div className="flex justify-center">
              <Magnet padding={10} disabled={isLoading} magnetStrength={5}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[200px] bg-linear-to-r from-[#2873ec] to-[#1a5bb8] text-white font-medium py-3.5 px-8 rounded-xl shadow-lg shadow-[#2873ec]/25 hover:opacity-90 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {step === 1 ? "إرسال الرمز" : "تحقق"}
                      <FaArrowRight className="rotate-180" />
                    </>
                  )}
                </button>
              </Magnet>
            </div>
          </form>

          {step === 2 && (
            <div className="mt-6 space-y-4 text-center">
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                لم تستلم البريد؟{" "}
                <span className="text-[#2873ec] hover:underline">
                  إعادة الإرسال
                </span>
              </button>

              <button
                onClick={onClose}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mx-auto"
              >
                <FaArrowLeft />
                <span>العودة لتسجيل الدخول</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
