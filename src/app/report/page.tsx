'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { InterviewReport } from '@/lib/interviewState';

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('interviewData');
    if (!raw) {
      setNotFound(true);
      return;
    }
    try {
      const data = JSON.parse(raw) as { report: InterviewReport };
      setReport(data.report);
    } catch {
      setNotFound(true);
    }
  }, []);

  if (notFound) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[var(--color-fog)]">No interview report found.</p>
        <button onClick={() => router.push('/')} className="btn-primary">
          Start a New Interview
        </button>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-fog)]">Loading report...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      <h1 className="text-4xl font-normal tracking-tight mb-2">Interview Report</h1>
      <p className="text-lg text-[var(--color-fog)] mb-8">{report.overallVerdict}</p>

      <div className="card p-6 mb-6">
        <h2 className="text-sm font-medium text-[var(--color-fog)] mb-2">Summary</h2>
        <p className="text-sm leading-relaxed">{report.overallSummary}</p>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-sm font-medium text-[var(--color-fog)] mb-4">Per-Problem Results</h2>
        <div className="flex flex-col gap-4">
          {report.perProblem.map((p, i) => (
            <div key={i} className="pb-4" style={{ borderBottom: i < report.perProblem.length - 1 ? '1px solid var(--color-dove)' : 'none' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{p.problemTitle}</span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-[var(--radius-full)]"
                  style={{
                    background: p.passed ? 'rgba(40, 200, 64, 0.1)' : 'rgba(255, 95, 87, 0.1)',
                    color: p.passed ? 'var(--color-sprout)' : 'var(--color-ember)',
                  }}
                >
                  {p.passed ? 'Passed' : 'Incomplete'}
                </span>
              </div>
              <p className="text-sm text-[var(--color-steel)]">{p.codeQuality}</p>
              <p className="text-sm text-[var(--color-steel)]">{p.complexityNote}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="card p-6">
          <h2 className="text-sm font-medium text-[var(--color-fog)] mb-3">Strengths</h2>
          <ul className="flex flex-col gap-2">
            {report.strengths.map((s, i) => (
              <li key={i} className="text-sm">
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-sm font-medium text-[var(--color-fog)] mb-3">Areas to Improve</h2>
          <ul className="flex flex-col gap-2">
            {report.weaknesses.map((w, i) => (
              <li key={i} className="text-sm">
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button onClick={() => router.push('/')} className="btn-ghost">
        Start a New Interview
      </button>
    </main>
  );
}
