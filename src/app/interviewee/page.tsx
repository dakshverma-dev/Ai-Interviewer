'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/session';
import { isVoiceSupported, unlockVoice } from '@/lib/voice';

export default function IntervieweeDashboard() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const session = getSession(code);
    if (!session) {
      setError('That code doesn\'t match an active interview. Check with your interviewer and try again.');
      return;
    }

    const support = isVoiceSupported();
    if (support.speechSynthesis) {
      unlockVoice();
    }
    if (support.speechRecognition && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => stream.getTracks().forEach((track) => track.stop()))
        .catch(() => {
          // Mic permission denied — the interview screen falls back to text-only input.
        });
    }

    router.push(`/interview?code=${session.code}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <button
        onClick={() => router.push('/')}
        className="text-sm text-[var(--color-fog)] mb-8 hover:text-[var(--color-jet-ink)] absolute top-8 left-8"
      >
        ← Back
      </button>

      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-normal tracking-tight mb-3" style={{ letterSpacing: '-0.025em' }}>
          Join an Interview
        </h1>
        <p className="text-[var(--color-fog)] mb-10">
          Enter the code your interviewer gave you.
        </p>

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="XXXXXX"
            maxLength={6}
            className="text-center text-3xl font-mono tracking-[0.3em] px-4 py-4 rounded-[var(--radius-xl)] outline-none"
            style={{ background: 'var(--color-sand)' }}
            autoFocus
          />
          {error && <p className="text-sm" style={{ color: 'var(--color-ember)' }}>{error}</p>}
          <button type="submit" disabled={code.length < 4} className="btn-primary text-base py-4">
            Enter Interview
          </button>
        </form>
      </div>
    </main>
  );
}
