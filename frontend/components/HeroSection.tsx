import GlareHover from './GlareHover'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserDashboard } from './UserDashboard'

export const HeroSection: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // If user is logged in, show dashboard instead
  if (isAuthenticated) {
    return <UserDashboard />;
  }

  // Default hero section for non-logged-in users
  return (
    <section className="flex-1 flex flex-col items-center justify-center px-4 min-h-screen">
      <div className="text-center max-w-7xl mx-auto">
        <h1 className="text-white font-bold text-4xl md:text-6xl lg:text-8xl mb-6 bg-linear-to-r from-blue-400 via-blue-200 to-blue-400 bg-clip-text animate-pulse">
          حوّل مستنداتك إلى حوار ذكي
        </h1>
        <p className="text-gray-300 text-lg mt-20 md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto">
          ارفع ملفاتك وابدأ محادثة ذكية معها باستخدام Google Gemini 2.5 Pro
        </p>
        <div className="flex gap-4 justify-center flex-wrap mt-15">
          <GlareHover
            glareColor="#ffffff"
            glareOpacity={0.5}
            glareAngle={-30}
            glareSize={200}
            width='auto'
            height='auto'
            borderRadius='9999px'
            transitionDuration={1000}
            playOnce={false}
            background='transparent'
            borderColor='transparent'
            className='inline-flex'
          >
            <Link to="/signup" className="text-white bg-[#2873ec] hover:bg-[#4a8fff] font-bold rounded-full text-base lg:text-xl px-6 lg:px-8 py-3 lg:py-4 transition-all duration-300 shadow-[0_0_20px_rgba(40,115,236,0.3)] hover:shadow-[0_0_30px_rgba(74,143,255,0.5)] border border-white/10">
              ابدأ الآن مجاناً
            </Link>
          </GlareHover>
          <Link to="/pricing" className="text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm font-bold rounded-full text-base lg:text-xl px-6 lg:px-8 py-3 lg:py-4 transition-all duration-300 border border-white/20 hover:border-white/30">
            عرض الأسعار
          </Link>
        </div>
      </div>
    </section>
  )
}