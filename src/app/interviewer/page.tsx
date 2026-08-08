'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createSession,
  PROBLEM_SETS,
  LANGUAGE_OPTIONS,
  DIFFICULTY_OPTIONS,
  type InterviewSession,
} from '@/lib/session';

const KIND_OPTIONS = [
  { id: 'technical', label: 'Technical / DSA', available: true },
  { id: 'frontend', label: 'Frontend', available: false },
  { id: 'system-design', label: 'System Design', available: false },
  { id: 'behavioral', label: 'Behavioral', available: false },
];

export default function InterviewerDashboard() {
  const router = useRouter();
  const [problemSetId, setProblemSetId] = useState(PROBLEM_SETS[0].id);
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0]);
  const [difficulty, setDifficulty] = useState<InterviewSession['difficulty']>('Mixed');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const created = createSession({ problemSetId, language, difficulty });
    setSession(created);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(session.code);
      setCopied(true);
    } catch {
      // Clipboard access denied — the code is still visible on screen.
    }
  };

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <button onClick={() => router.push('/')} className="text-sm text-[var(--color-fog)] mb-8 hover:text-[var(--color-jet-ink)]">
        ← Back
      </button>

      <h1 className="text-4xl font-normal tracking-tight mb-2" style={{ letterSpacing: '-0.025em' }}>
        Create an Interview
      </h1>
      <p className="text-[var(--color-fog)] mb-10">
        Configure the session, then share the code with your candidate.
      </p>

      <div className="card p-6 mb-6">
        <h2 className="text-sm font-medium text-[var(--color-fog)] mb-3">Kind of interview</h2>
        <div className="grid grid-cols-2 gap-3">
          {KIND_OPTIONS.map((kind) => (
            <button
              key={kind.id}
              disabled={!kind.available}
              className="text-left px-4 py-3 rounded-[var(--radius-xl)] text-sm"
              style={{
                background: kind.available ? 'var(--color-sand)' : 'var(--color-paper)',
                boxShadow: 'var(--shadow-subtle)',
                color: kind.available ? 'var(--color-jet-ink)' : 'var(--color-pewter)',
                cursor: kind.available ? 'default' : 'not-allowed',
              }}
            >
              {kind.label}
              {!kind.available && <span className="block text-xs mt-1">Coming soon</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-sm font-medium text-[var(--color-fog)] mb-3">Which interview</h2>
        <div className="flex flex-col gap-2">
          {PROBLEM_SETS.map((set) => (
            <button
              key={set.id}
              onClick={() => setProblemSetId(set.id)}
              className="text-left px-4 py-3 rounded-[var(--radius-xl)]"
              style={{
                background: problemSetId === set.id ? 'var(--color-jet-ink)' : 'var(--color-sand)',
                color: problemSetId === set.id ? 'var(--color-paper)' : 'var(--color-jet-ink)',
              }}
            >
              <span className="block text-sm font-medium">{set.name}</span>
              <span
                className="block text-xs mt-1"
                style={{ color: problemSetId === set.id ? 'var(--color-dove)' : 'var(--color-steel)' }}
              >
                {set.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h2 className="text-sm font-medium text-[var(--color-fog)] mb-3">Language</h2>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className="text-xs font-medium px-3 py-2 rounded-[var(--radius-full)]"
                style={{
                  background: language === lang ? 'var(--color-jet-ink)' : 'var(--color-sand)',
                  color: language === lang ? 'var(--color-paper)' : 'var(--color-jet-ink)',
                }}
              >
                {lang}
              </button>
            ))}
          </div>
          {language !== 'Python' && (
            <p className="text-xs text-[var(--color-pewter)] mt-3">
              Only Python execution is wired up right now. Other languages are recorded for the
              session but the live interview still runs in Python.
            </p>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-medium text-[var(--color-fog)] mb-3">Difficulty</h2>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_OPTIONS.map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className="text-xs font-medium px-3 py-2 rounded-[var(--radius-full)]"
                style={{
                  background: difficulty === level ? 'var(--color-jet-ink)' : 'var(--color-sand)',
                  color: difficulty === level ? 'var(--color-paper)' : 'var(--color-jet-ink)',
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleGenerate} className="btn-primary w-full text-base py-4">
        Generate Interview Code
      </button>

      {session && (
        <div className="card p-6 mt-6 text-center">
          <p className="text-sm text-[var(--color-fog)] mb-2">Share this code with your candidate</p>
          <p className="text-5xl font-medium tracking-[0.2em] font-mono mb-4">{session.code}</p>
          <button onClick={handleCopy} className="btn-ghost text-sm">
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      )}
    </main>
  );
}
