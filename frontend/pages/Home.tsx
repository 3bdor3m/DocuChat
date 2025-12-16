import LightRays from '../components/LightRays';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { HowItWorks } from '../components/HowItWorks';
import { Features } from '../components/Features';
import { Footer } from '../components/Footer';
import UseCasesSection from '../components/UseCasesSection';
import ScrollToTopButton from '../components/ScrollToTopButton';


const Home = () => {
  return (
    <div className="w-full min-h-screen relative bg-black text-white">
      <div className="fixed inset-0 z-0">
        <LightRays
          raysOrigin="bottom-right"
          raysColor="#2873ec"
          raysSpeed={0.1}
          fadeDistance={2}
          lightSpread={2}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.5}
          noiseAmount={0.25}
          pulsating={true}
        />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col">
        {/* Header في الأعلى */}
        <div className="pt-4 px-4">
          <Header />
        </div>
        {/* Hero Section */}
        <HeroSection />
        {/* How It Works Section */}
        <HowItWorks />
        {/* Use Cases Section */}
        <UseCasesSection />
        {/* Features Section */}
        <Features />
        {/* Footer */}
        <Footer />
      </div>
      <ScrollToTopButton />
    </div>
  )
}

export default Home