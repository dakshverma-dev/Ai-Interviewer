'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import BreathingOrb from './BreathingOrb';

const words = ['listens', 'codes', 'judges', 'reports'];

export default function Hero() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => setIsVisible(true), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden noise-overlay">
      <div className="absolute right-[4%] top-[16%] w-[200px] h-[200px] lg:w-[260px] lg:h-[260px] pointer-events-none">
        <BreathingOrb />
      </div>

      <div className="landing-grid">
        {[...Array(6)].map((_, i) => (
          <span
            key={`h-${i}`}
            style={{ height: '1px', top: `${16.6 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <span
            key={`v-${i}`}
            style={{ width: '1px', left: `${10 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-12 pt-40 pb-32 lg:pt-48 lg:pb-40 w-full">
        <div
          className={`mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-[var(--color-fog)]">
            <span className="w-8 h-px bg-[var(--color-jet-ink)]/30" />
            A real interview, conducted by AI
          </span>
        </div>

        <div className="mb-14">
          <h1
            className={`font-display text-[clamp(2.75rem,9vw,7.5rem)] leading-[0.95] tracking-tight transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="block">The interviewer that</span>
            <span className="block">
              actually{' '}
              <span className="relative inline-block">
                <span key={wordIndex} className="inline-flex">
                  {words[wordIndex].split('').map((char, i) => (
                    <span
                      key={`${wordIndex}-${i}`}
                      className="inline-block"
                      style={{
                        animation: 'char-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                        animationDelay: `${i * 40}ms`,
                        opacity: 0,
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-[var(--color-sand)] -z-10" />
              </span>
            </span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-24 items-end">
          <p
            className={`text-xl lg:text-2xl text-[var(--color-fog)] leading-relaxed max-w-xl transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            No practice mode, no scripted questions. Just a live coding interview with real
            execution, real voice, and real feedback from start to finish.
          </p>

          <div
            className={`flex flex-col sm:flex-row items-start gap-4 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button onClick={() => router.push('/interviewer')} className="btn-primary text-base h-14 px-8 flex items-center gap-2 group">
              Create an interview
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={() => router.push('/interviewee')} className="btn-ghost text-base h-14 px-8">
              Join with a code
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
