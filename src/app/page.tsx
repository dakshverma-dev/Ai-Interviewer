import LandingNav from '@/components/landing/LandingNav';
import Hero from '@/components/landing/Hero';
import AboutSolution from '@/components/landing/AboutSolution';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import FinalCta from '@/components/landing/FinalCta';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <LandingNav />
      <Hero />
      <AboutSolution />
      <div id="features">
        <Features />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <FinalCta />
      <LandingFooter />
    </main>
  );
}
