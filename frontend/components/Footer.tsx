import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="relative z-10 py-12 bg-gray-950/60 backdrop-blur-md border-t border-gray-800/50 snap-start">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-4xl font-bold bg-linear-to-r from-[#2873ec] to-[#4a8fff] bg-clip-text text-transparent">
                DucoChat
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              حوّل مستنداتك إلى حوار ذكي
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href='/' className="hover:text-[#2873ec] transition-colors">الرئيسية
                </a>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-[#2873ec] transition-colors">الأسعار
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-white">الدعم</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-[#2873ec] transition-colors">الدعم الفني</a></li>
              <li><a href="#" className="hover:text-[#2873ec] transition-colors">أرسل رأيك</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-white">قانوني</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-[#2873ec] transition-colors">شروط الاستخدام</a></li>
              <li><a href="#" className="hover:text-[#2873ec] transition-colors">سياسة الخصوصية</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>© 2025 DucoChat. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>

  )
}
