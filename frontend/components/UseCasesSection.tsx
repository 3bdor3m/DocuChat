import React from 'react';
import TiltedCard from './TiltedCard';

// تعريف نوع البيانات لكل بطاقة (لضمان كتابة كود نظيف مع TypeScript)
interface UseCase {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

// بيانات القسم - يمكنك تعديلها أو إضافة المزيد هنا بسهولة
const useCasesData: UseCase[] = [
  {
    icon: StudentIcon,
    title: 'للطلاب والباحثين',
    description: 'حوّل محاضراتك وأوراقك البحثية إلى ملخصات ذكية، واحصل على إجابات فورية لتسريع دراستك وكتابة أبحاثك.',
  },
  {
    icon: BusinessIcon,
    title: 'للمدراء والمحللين',
    description: 'استخلص الأفكار الرئيسية من تقارير العمل وتحليلات السوق في ثوانٍ لاتخاذ قرارات أسرع وأكثر ذكاءً.',
  },
  {
    icon: LegalIcon,
    title: 'للمحامين والمستشارين',
    description: 'راجع العقود والمستندات القانونية بكفاءة. استخرج البنود والمعلومات الهامة بدقة وسرعة عبر حوار تفاعلي.',
  },
];

// المكون الرئيسي للقسم
const UseCasesSection: React.FC = () => {
  return (
    <section className="relative z-10 snap-start py-20 bg-gray-950/10 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* عنوان القسم */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            مصمم خصيصاً ليلبي احتياجاتك
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
            اكتشف كيف يمكن لـ DucoChat أن يصبح مساعدك الذكي في مختلف المجالات.
          </p>
        </div>

        {/* شبكة البطاقات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCasesData.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <TiltedCard
                key={index}
                imageSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23000000'/%3E%3C/svg%3E"
                altText={useCase.title}
                containerHeight="350px"
                containerWidth="100%"
                imageHeight="100%"
                imageWidth="100%"
                scaleOnHover={1.05}
                rotateAmplitude={10}
                showMobileWarning={false}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-black/80 backdrop-blur-sm border border-gray-800 rounded-lg">
                    <div className="w-16 h-16 bg-[#2873ec]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-[#2873ec]" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white">{useCase.title}</h3>
                    <p className="text-gray-400">{useCase.description}</p>
                  </div>
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;


// --- أيقونات SVG كمكونات ---
// يمكنك وضعها في نفس الملف أو استيرادها من ملفات منفصلة

function StudentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.905 59.905 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5z" />
    </svg>
  );
}

function BusinessIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-2.25M21 12l-3.75 2.25" />
    </svg>
  );
}

function LegalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
  );
}
