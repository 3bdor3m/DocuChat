import { useState } from 'react';
import { Header } from '../components/Header';
import { FaCheck } from 'react-icons/fa';
import Magnet from '../components/Magnet';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'مجاني',
      price: '0',
      yearlyPrice: '0',
      currency: '$',
      period: '/ شهرياً',
      description: 'للبدء وتجربة المنصة',
      features: ['وصول محدود', 'دعم فني عبر البريد', 'تحديثات دورية', 'مستخدم واحد'],
      buttonText: 'ابدأ الآن',
      highlighted: false,
    },
    {
      name: 'احترافي',
      price: '29',
      yearlyPrice: '24',
      currency: '$',
      period: '/ شهرياً',
      description: 'للأفراد والشركات الصغيرة',
      features: ['كل ميزات المجاني', 'وصول غير محدود', 'دعم فني مباشر', 'تحليلات متقدمة', 'حتى 5 مستخدمين'],
      buttonText: 'اشترك الآن',
      highlighted: true,
    },
    {
      name: 'مؤسسات',
      price: 'مخصص',
      yearlyPrice: 'مخصص',
      currency: '',
      period: '',
      description: 'للشركات الكبيرة والفرق',
      features: ['كل ميزات الاحترافي', 'حلول مخصصة', 'مدير حساب خاص', 'دعم 24/7', 'تكامل API كامل'],
      buttonText: 'تواصل معنا',
      highlighted: false,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white selection:bg-[#2873ec]/30">
      <div className="pt-4 flex justify-center px-4 relative z-10">
        <Header />
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2873ec]/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1a5bb8]/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-6 py-20 max-w-6xl relative z-10 ">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            خطط تناسب الجميع
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
            اختر الخطة المثالية لاحتياجاتك وابدأ في تنمية أعمالك اليوم
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-white' : 'text-gray-400'}`}>
              شهرياً
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-16 h-8 bg-white/10 rounded-full p-1 transition-colors hover:bg-white/20 focus:outline-none cursor-pointer"
            >
              <div
                className={`w-6 h-6 bg-[#2873ec] rounded-full shadow-md transition-transform duration-300 ${isYearly ? '-translate-x-8' : 'translate-x-0'
                  }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-white' : 'text-gray-400'}`}>
                سنوياً
              </span>
              <span className="bg-[#2873ec]/20 text-[#4a8fff] text-xs px-2 py-1 rounded-full border border-[#2873ec]/20">
                وفر 20%
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 ${plan.highlighted
                ? 'bg-white/5 border-[#2873ec]/50 animate-pulse-glow'
                : 'bg-white/2 border-white/10 hover:border-white/20 hover:bg-white/4'
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-[#2873ec] to-[#1a5bb8] text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                  الأكثر شيوعاً
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-medium text-gray-300 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">
                    {plan.currency}
                    {isYearly ? plan.yearlyPrice : plan.price}
                  </span>
                  <span className="text-gray-500">
                    {plan.period}
                    {isYearly && plan.price !== '0' && plan.price !== 'مخصص' && (
                      <span className="block text-xs mt-1">يُدفع سنوياً</span>
                    )}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300 text-sm">
                    <span className={`p-1 rounded-full ${plan.highlighted ? 'bg-[#2873ec]/20 text-[#4a8fff]' : 'bg-white/10 text-gray-400'}`}>
                      <FaCheck size={10} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Magnet padding={100} disabled={false} magnetStrength={10}>
                <button
                  onClick={() => navigate('/signup')}
                  className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 cursor-pointer ${plan.highlighted
                    ? 'bg-linear-to-r from-[#2873ec] to-[#1a5bb8] hover:opacity-90 text-white shadow-lg shadow-[#2873ec]/25'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    }`}
                >
                  {plan.buttonText}
                </button>
              </Magnet>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
