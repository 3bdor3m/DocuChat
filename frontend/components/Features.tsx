import SpotlightCard from './SpotlightCard'

export const Features = () => {
  return (
    <section className="relative z-10 snap-start py-20 bg-gray-950/60 backdrop-blur-md border border-gray-800/50">
      <div className="container mx-auto px-6 max-w-6xl">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">الميزات الرئيسية</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)">
            <div className="bg-gray-800/30 backdrop-blur p-6 rounded-lg border border-gray-800 hover:border-[#2873ec] transition-all duration-300 group">
              <svg className="w-10 h-10 text-[#2873ec] mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold mb-3 text-white">دعم ملفات متعددة</h3>
              <p className="text-gray-400">
                يدعم PDF, DOCX, Markdown مع استخراج نص ذكي وOCR
              </p>
            </div>
          </SpotlightCard>


          {/* Feature 2 */}
          <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)">
            <div className="bg-gray-800/30 backdrop-blur p-6 rounded-lg border border-gray-800 hover:border-[#2873ec] transition-all duration-300 group">
              <svg className="w-10 h-10 text-[#2873ec] mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-xl font-semibold mb-3 text-white">محادثة ذكية</h3>
              <p className="text-gray-400">
                تفاعل مع مستنداتك من خلال محادثة طبيعية وذكية
              </p>
            </div>
          </SpotlightCard>

          {/* Feature 3 */}
          <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)">
            <div className="bg-gray-800/30 backdrop-blur p-6 rounded-lg border border-gray-800 hover:border-[#2873ec] transition-all duration-300 group">
              <svg className="w-10 h-10 text-[#2873ec] mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-xl font-semibold mb-3 text-white">ميزة "اختبرني"</h3>
              <p className="text-gray-400">
                اختبر معرفتك بالمستند من خلال أسئلة تفاعلية
              </p>
            </div>
          </SpotlightCard>

          {/* Feature 4 */}
          <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)">
            <div className="bg-gray-800/30 backdrop-blur p-6 rounded-lg  border border-gray-800 hover:border-[#2873ec] transition-all duration-300 group">
              <svg className="w-10 h-10 text-[#2873ec] mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-semibold mb-3 text-white">البحث عبر الإنترنت</h3>
              <p className="text-gray-400">
                احصل على معلومات إضافية من الإنترنت لإثراء الإجابات
              </p>
            </div>
          </SpotlightCard>

          {/* Feature 5 */}
          <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)">
            <div className="bg-gray-800/30 backdrop-blur p-6 rounded-lg border border-gray-800 hover:border-[#2873ec] transition-all duration-300 group">
              <svg className="w-10 h-10 text-[#2873ec] mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <h3 className="text-xl font-semibold mb-3 text-white">عملية التفكير</h3>
              <p className="text-gray-400">
                شاهد كيف يفكر الذكاء الاصطناعي ويصل للإجابة
              </p>
            </div>
          </SpotlightCard>

          {/* Feature 6 */}
          <SpotlightCard spotlightColor="rgba(40, 115, 236, 0.8)">
            <div className="bg-gray-800/30 backdrop-blur p-6 rounded-lg  border border-gray-800 hover:border-[#2873ec] transition-all duration-300 group">
              <svg className="w-10 h-10 text-[#2873ec] mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <h3 className="text-xl font-semibold mb-3 text-white">تصدير وأرشفة</h3>
              <p className="text-gray-400">
                صدّر محادثاتك بصيغة PDF أو Markdown أو TXT
              </p>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  )
}
