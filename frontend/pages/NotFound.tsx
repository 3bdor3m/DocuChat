import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaHome } from "react-icons/fa";
import Magnet from "../components/Magnet";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2873ec]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1a5bb8]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Large 404 Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <h1 className="text-[280px] md:text-[400px] font-black text-white/3 leading-none">
          404
        </h1>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          لقد ضاعت هذه الصفحة
        </h2>
        <p className="text-gray-400 text-lg mb-12 max-w-md mx-auto">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Go Back Button */}
          <button
            onClick={handleGoBack}
            className="min-w-[160px] bg-white/5 border border-white/10 text-white font-medium py-3.5 px-8 rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 justify-center"
          >
            <FaArrowRight className="rotate-180" />
            <span>العودة للخلف</span>
          </button>

          {/* Go Home Button */}
          <Magnet padding={10} magnetStrength={5}>
            <button
              onClick={handleGoHome}
              className="min-w-[160px] bg-linear-to-r from-[#2873ec] to-[#1a5bb8] text-white font-medium py-3.5 px-8 rounded-xl shadow-lg shadow-[#2873ec]/25 hover:opacity-90 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 justify-center"
            >
              <FaHome />
              <span>الصفحة الرئيسية</span>
            </button>
          </Magnet>
        </div>
      </div>
    </div>
  );
}
