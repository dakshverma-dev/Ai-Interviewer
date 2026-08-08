import type { Message } from '@/lib/interviewState';

interface TranscriptMessageProps {
  message: Message;
}

export default function TranscriptMessage({ message }: TranscriptMessageProps) {
  const isAi = message.role === 'ai';
  return (
    <div className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
      <div
        className="max-w-[85%] rounded-[var(--radius-xl)] px-4 py-3 text-sm"
        style={{
          background: isAi ? 'var(--color-cream)' : 'var(--color-jet-ink)',
          color: isAi ? 'var(--color-jet-ink)' : 'var(--color-paper)',
        }}
      >
        {message.text}
      </div>
    </div>
  );
}
