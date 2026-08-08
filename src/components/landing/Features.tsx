'use client';

import { useEffect, useRef, useState } from 'react';

const features = [
  {
    number: '01',
    title: 'Real code execution',
    description:
      'Your solution actually runs in the browser, against real test cases, not just AI commentary on text.',
  },
  {
    number: '02',
    title: 'Live voice interview',
    description:
      'The AI speaks questions and feedback and listens to you talk through your approach, like a real call.',
  },
  {
    number: '03',
    title: 'Visible reasoning',
    description:
      "Watch the interviewer's analysis happen in real time: tracing your logic, checking complexity, forming feedback.",
  },
  {
    number: '04',
    title: 'Honest final report',
    description:
      'A real, AI-written assessment from the full transcript and code: strengths, gaps, and a verdict, not a fake scorecard.',
  },
];

function FeatureRow({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        className="flex flex-col lg:flex-row gap-6 lg:gap-16 py-12 lg:py-16"
        style={{ borderBottom: '1px solid var(--color-dove)' }}
      >
        <div className="shrink-0">
          <span className="font-mono text-sm text-[var(--color-pewter)]">{feature.number}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-display text-3xl lg:text-4xl mb-3">{feature.title}</h3>
          <p className="text-lg text-[var(--color-fog)] leading-relaxed max-w-xl">{feature.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-28 lg:py-36">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-[var(--color-fog)] mb-8">
            <span className="w-8 h-px bg-[var(--color-jet-ink)]/30" />
            Capabilities
          </span>
          <h2
            className={`font-display text-4xl lg:text-6xl tracking-tight transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            An interview, not a demo.
          </h2>
        </div>

        <div>
          {features.map((feature, index) => (
            <FeatureRow key={feature.number} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
