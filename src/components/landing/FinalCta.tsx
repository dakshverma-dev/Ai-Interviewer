'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function FinalCta() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div
          className={`relative transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ border: '1px solid var(--color-jet-ink)' }}
        >
          <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-24 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
            <div className="flex-1">
              <h2 className="font-display text-4xl lg:text-6xl tracking-tight mb-6 leading-[0.95]">
                Ready for a real
                <br />
                interview?
              </h2>
              <p className="text-xl text-[var(--color-fog)] mb-10 leading-relaxed max-w-xl">
                Interviewers configure a session in under a minute. Candidates just need the code.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <button
                  onClick={() => router.push('/interviewer')}
                  className="btn-primary text-base h-14 px-8 flex items-center gap-2 group"
                >
                  Create an interview
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button onClick={() => router.push('/interviewee')} className="btn-ghost text-base h-14 px-8">
                  Join with a code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
