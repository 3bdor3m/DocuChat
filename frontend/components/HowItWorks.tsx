import Carousel, { CarouselItem } from './Carousel'

const items: CarouselItem[] = [
  {
    id: 1,
    title: <div dir="rtl" className="text-right">1. ارفع الملف</div>,
    description: <div dir="rtl" className="text-right">ارفع ملفاتك بصيغة PDF أو DOCX أو Markdown</div>,
    icon: (
      <svg className="w-10 h-10 text-[#2873ec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: <div dir="rtl" className="text-right">2. يحلله الذكاء الاصطناعي</div>,
    description: <div dir="rtl" className="text-right">يقوم الذكاء الاصطناعي بتحليل وفهم محتوى مستندك</div>,
    icon: (
      <svg className="w-10 h-10 text-[#2873ec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: <div dir="rtl" className="text-right">3. اسأل أسئلتك</div>,
    description: <div dir="rtl" className="text-right">احصل على إجابات دقيقة وتفاعلية من مستنداتك</div>,
    icon: (
      <svg className="w-10 h-10  text-[#2873ec]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

export const HowItWorks = () => {
  return (
    <section className="relative z-10 snap-start py-20 bg-gray-950/60 backdrop-blur-md border border-gray-800/50">
      <div className="container mx-auto pb-16 px-6 max-w-6xl">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">كيف يعمل؟</h2>
        <div style={{ height: '300px', position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }} dir="ltr">
          <Carousel
            items={items}
            baseWidth={400}
            autoplay={true}
            autoplayDelay={3000}
            loop={true}
            pauseOnHover={true}
            round={true}
          />
        </div>
      </div>
    </section>
  )
}
