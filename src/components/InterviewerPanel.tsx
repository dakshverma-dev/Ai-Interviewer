'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import type { Message } from '@/lib/interviewState';
import TranscriptMessage from './TranscriptMessage';
import SpeakingOrb from './SpeakingOrb';
import { startListening, stopListening, isListening as voiceIsListening } from '@/lib/voice';

interface InterviewerPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isAiSpeaking: boolean;
  voiceSupported: boolean;
  useVoiceAgent?: boolean;
  voiceAgentReady?: boolean;
  creditsRemaining?: number;
}

export default function InterviewerPanel({
  messages,
  onSendMessage,
  isAiSpeaking,
  voiceSupported,
  useVoiceAgent,
  voiceAgentReady,
  creditsRemaining,
}: InterviewerPanelProps) {
  const [textInput, setTextInput] = useState('');
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleMicToggle = () => {
    if (voiceIsListening()) {
      stopListening();
      setListening(false);
      return;
    }
    setListening(true);
    startListening(
      (transcript) => {
        onSendMessage(transcript);
        setListening(false);
      },
      () => setListening(false),
      () => setListening(false)
    );
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    onSendMessage(textInput.trim());
    setTextInput('');
  };

  return (
    <div className="card flex flex-col h-full p-4">
      {/* Credit indicator */}
      {creditsRemaining !== undefined && (
        <div className="text-xs px-3 py-1 rounded-full mb-2" style={{ background: 'rgba(255, 193, 7, 0.1)', color: 'var(--color-sand)' }}>
          💳 Credits: {creditsRemaining}/2000
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: useVoiceAgent
              ? voiceAgentReady
                ? 'var(--color-sprout)'
                : 'var(--color-sand)'
              : isAiSpeaking
                ? 'var(--color-sprout)'
                : 'var(--color-pewter)',
          }}
        />
        <span className="text-xs text-[var(--color-fog)]">
          {useVoiceAgent ? (
            voiceAgentReady ? (
              <>
                🎙️ <span className="ml-1">Live Voice Agent</span>
              </>
            ) : (
              <>
                ⏳ <span className="ml-1">Connecting...</span>
              </>
            )
          ) : isAiSpeaking ? (
            'Interviewer speaking...'
          ) : listening ? (
            'Listening...'
          ) : (
            'Interviewer'
          )}
        </span>
      </div>

      {/* Speaking Orb Visualization */}
      <div className="h-40 mb-4 rounded-lg overflow-hidden" style={{ background: 'var(--color-sand)' }}>
        <SpeakingOrb isActive={isAiSpeaking} />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-3 mb-3">
        {messages.map((message, i) => (
          <TranscriptMessage key={i} message={message} />
        ))}
      </div>

      <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
        {voiceSupported && (
          <button
            type="button"
            onClick={handleMicToggle}
            className="btn-ghost p-3"
            aria-label={listening ? 'Stop listening' : 'Start listening'}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 text-sm px-4 py-3 rounded-[var(--radius-full)] outline-none"
          style={{ background: 'var(--color-sand)' }}
        />
        <button type="submit" className="btn-primary p-3" aria-label="Send message">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
