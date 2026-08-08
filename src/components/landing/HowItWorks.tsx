'use client';

import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    number: 'I',
    title: 'Create a session',
    description:
      'The interviewer picks the interview type, problem set, language, and difficulty, and generates a one-time join code.',
    snippet: `session = create_interview(
    kind="technical",
    problems="dsa-core",
    difficulty="Medium",
)

# code: 7K2M9P`,
  },
  {
    number: 'II',
    title: 'Candidate joins',
    description:
      'The candidate enters the code and drops straight into a live coding environment. No accounts, no setup.',
    snippet: `join_interview("7K2M9P")

# connecting...
# candidate joined session`,
  },
  {
    number: 'III',
    title: 'AI conducts the interview',
    description:
      'The AI greets the candidate, watches them code in real time, runs their solution against real test cases, and asks follow-up questions like a real interviewer.',
    snippet: `run_code(solution)
# 4/4 test cases passed

interviewer.analyze(solution)
# thinking through complexity...`,
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-28 lg:py-36"
      style={{ background: 'var(--color-jet-ink)', color: 'var(--color-paper)' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span
            className="inline-flex items-center gap-3 text-sm font-mono mb-8"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <span className="w-8 h-px" style={{ background: 'rgba(255,255,255,0.3)' }} />
            Process
          </span>
          <h2
            className={`font-display text-4xl lg:text-6xl tracking-tight transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Three steps.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>One real interview.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
          <div>
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className="w-full text-left py-8 transition-all duration-500 group"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  opacity: activeStep === index ? 1 : 0.4,
                }}
              >
                <div className="flex items-start gap-6">
                  <span className="font-display text-3xl" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {step.number}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display text-2xl lg:text-3xl mb-3">{step.title}</h3>
                    <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:sticky lg:top-32 self-start">
            <div style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
                </div>
                <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  interview.py
                </span>
              </div>
              <div className="p-8 font-mono text-sm min-h-[220px]">
                <pre style={{ color: 'rgba(255,255,255,0.7)' }}>{steps[activeStep].snippet}</pre>
              </div>
              <div
                className="px-6 py-4 flex items-center gap-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-sprout)' }} />
                <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
