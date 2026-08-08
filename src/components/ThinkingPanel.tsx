'use client';

import { useEffect, useState } from 'react';

const ANALYSIS_STEPS = [
  'Reading the submitted code...',
  'Tracing through the test cases...',
  'Estimating time and space complexity...',
  'Checking for edge cases and style...',
  'Forming feedback...',
];

interface ThinkingPanelProps {
  active: boolean;
}

export default function ThinkingPanel({ active }: ThinkingPanelProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1 < ANALYSIS_STEPS.length ? i + 1 : i));
    }, 700);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="text-xs font-mono px-4 py-3 rounded-[var(--radius-xl)] flex items-center gap-2"
      style={{ background: 'var(--color-sand)', color: 'var(--color-steel)' }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: 'var(--color-jet-ink)' }}
      />
      <span>{ANALYSIS_STEPS[stepIndex]}</span>
    </div>
  );
}
