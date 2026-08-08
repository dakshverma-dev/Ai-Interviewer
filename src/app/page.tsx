'use client';

import { useRouter } from 'next/navigation';
import { isVoiceSupported, unlockVoice } from '@/lib/voice';

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    const support = isVoiceSupported();
    if (support.speechSynthesis) {
      unlockVoice();
    }
    if (support.speechRecognition && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => stream.getTracks().forEach((track) => track.stop()))
        .catch(() => {
          // Mic permission denied — the interview screen falls back to
          // text-only input, so no error handling needed here.
        });
    }
    router.push('/interview');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[64px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #ffa888, transparent 70%)',
          top: '-200px',
          right: '-200px',
        }}
      />
      <div className="max-w-2xl text-center relative z-10">
        <h1 className="text-6xl font-normal tracking-tight mb-6" style={{ letterSpacing: '-0.025em' }}>
          AI Interviewer
        </h1>
        <p className="text-lg text-[var(--color-fog)] mb-12">
          A live technical coding interview, conducted entirely by AI. Three problems, real code
          execution, spoken feedback, and an honest report at the end.
        </p>
        <button onClick={handleStart} className="btn-primary text-base px-8 py-4">
          Start Interview
        </button>
      </div>
    </main>
  );
}
