'use client';

import { useEffect, useRef, useState } from 'react';

const points = [
  {
    label: 'The problem',
    title: "Interview prep tools don't actually interview you.",
    body: "Most \"practice\" platforms are static problem lists with canned hints, or a chatbot that comments on code it never runs. There's no live back-and-forth, no real execution, no honest read on how you actually did.",
  },
  {
    label: 'Our solution',
    title: 'A single AI that runs the whole interview, live.',
    body: 'One model conducts the conversation, watches you code, actually executes it against real test cases, and writes the report afterward. The same AI, start to finish, with nothing faked in between.',
  },
];

export default function AboutSolution() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-28 lg:py-36">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div
          className={`grid lg:grid-cols-2 gap-16 lg:gap-24 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {points.map((point, i) => (
            <div key={point.label} style={{ transitionDelay: `${i * 120}ms` }}>
              <span className="inline-flex items-center gap-3 text-sm font-mono text-[var(--color-fog)] mb-8">
                <span className="w-8 h-px bg-[var(--color-jet-ink)]/30" />
                {point.label}
              </span>
              <h2 className="font-display text-3xl lg:text-4xl tracking-tight mb-6 leading-tight">
                {point.title}
              </h2>
              <p className="text-lg text-[var(--color-fog)] leading-relaxed">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
