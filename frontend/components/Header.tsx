import { useState, useEffect } from 'react'
import GlareHover from './GlareHover'
import NavBar from './NavBar'
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

export const Header = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 500);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('تم تسجيل الخروج', 'نراك قريباً!');
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const navLinks = [
    { id: 'home', label: 'الرئيسية', href: '/' },
    { id: 'chat', label: 'محادثة', href: '/chat' },
    { id: 'pricing', label: 'الأسعار', href: '/pricing' }
  ];

  return (
    <div
      className={`sticky top-4 z-30 mx-auto bg-gray-950/80 backdrop-blur-md
      flex items-center justify-between w-full max-w-7xl rounded-full transition-all duration-500 px-4 md:px-6 py-3 border border-[#2873ec]/10
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      style={{
        boxShadow: '0 0 30px rgba(40, 115, 236, 0.10), 0 0 50px rgba(40, 115, 236, 0.05)'
      }}
    >
      <nav className='flex items-center justify-between w-full gap-4 relative' role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <div className='shrink-0'>
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
            <a href="/">
              <Logo />
            </a>
          </GlareHover>
        </div>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center flex-1 justify-center'>
          <NavBar items={navLinks} initialActiveIndex={0} />
        </div>

        {/* Mobile Menu Button */}
        <button
          className='md:hidden text-[#2873ec] hover:text-[#4a8fff] transition-colors p-2'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Right Side - Notification Bell & User Menu or Sign Up Button */}
        <div className="shrink-0 hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2873ec]/10 hover:bg-[#2873ec]/20 border border-[#2873ec]/30 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2873ec] to-[#4a8fff] flex items-center justify-center text-sm font-bold">
                    {user.firstName?.charAt(0).toUpperCase() || user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white font-medium max-w-[100px] truncate">
                    {user.firstName || user.fullName?.split(' ')[0]}
                  </span>
                  <FaChevronDown className={`text-gray-400 text-xs transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-gray-950/95 backdrop-blur-md rounded-xl border border-[#2873ec]/20 shadow-[0_0_20px_rgba(40,115,236,0.2)] overflow-hidden animate-fadeIn">
                    <Link
                      to="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#2873ec]/10 transition-colors"
                    >
                      <FaUser className="text-[#2873ec]" />
                      <span>حسابي</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-red-400"
                    >
                      <FaSignOutAlt />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
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
              <Link to="/Signup" className="text-white bg-[#2873ec] hover:bg-[#4a8fff] box-border border border-white/10 
              font-bold leading-5 rounded-full text-base lg:text-xl px-4 lg:px-6 py-2 lg:py-3 
              focus:outline-none focus:ring-2 focus:ring-[#4a8fff] focus:ring-offset-2 focus:ring-offset-gray-950
              transition-all duration-300
              shadow-[0_0_20px_rgba(40,115,236,0.3)] hover:shadow-[0_0_30px_rgba(74,143,255,0.5)]"
                aria-label="Get started with our service">
                جرب مجاناً
              </Link>
            </GlareHover>
          )}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className='md:hidden absolute top-full left-0 right-0 mt-2 mx-4 bg-gray-950/95 backdrop-blur-md rounded-2xl border border-[#2873ec]/20 shadow-[0px_0px_20px] shadow-[#2873ec]/20 overflow-hidden animate-fadeIn'>
          <div className='flex flex-col py-2 px-2'>
            <NavBar items={navLinks} initialActiveIndex={0} vertical={true} />

            {/* Mobile User Menu */}
            {isAuthenticated && user && (
              <div className="border-t border-[#2873ec]/20 mt-2 pt-2">
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#2873ec]/10 transition-colors rounded-lg"
                >
                  <FaUser className="text-[#2873ec]" />
                  <span>حسابي</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-red-400 rounded-lg"
                >
                  <FaSignOutAlt />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}