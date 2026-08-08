interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: { isFinal: boolean; [index: number]: SpeechRecognitionResultItem; length: number };
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognitionInstance };
    webkitSpeechRecognition?: { new (): SpeechRecognitionInstance };
  }
}

let recognition: SpeechRecognitionInstance | null = null;
let speaking = false;
let listening = false;

function getRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isVoiceSupported() {
  const hasSynthesis = typeof window !== 'undefined' && !!window.speechSynthesis;
  const hasRecognition = getRecognitionCtor() !== null;
  return { speechSynthesis: hasSynthesis, speechRecognition: hasRecognition };
}

export function unlockVoice(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  // Speaking an empty utterance inside a user-gesture handler unlocks
  // future speak() calls that happen outside a gesture (e.g. after an
  // async Gemini response), avoiding the 'not-allowed' error.
  const utterance = new SpeechSynthesisUtterance('');
  window.speechSynthesis.speak(utterance);
  window.speechSynthesis.cancel();
}

export function speak(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find((v) => v.lang.startsWith('en') && v.name.includes('Google')) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    voices[0];
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => {
    speaking = true;
  };
  utterance.onend = () => {
    speaking = false;
    onEnd?.();
  };
  utterance.onerror = () => {
    speaking = false;
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  speaking = false;
}

export function startListening(
  onResult: (transcript: string) => void,
  onError?: (error: string) => void,
  onEnd?: () => void
): void {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    onError?.('Speech recognition not supported in this browser.');
    return;
  }

  if (recognition) {
    recognition.stop();
  }

  recognition = new Ctor();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      }
    }
    if (finalTranscript) {
      onResult(finalTranscript);
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    listening = false;
    if (event.error !== 'no-speech') {
      onError?.(event.error);
    }
  };

  recognition.onend = () => {
    listening = false;
    onEnd?.();
  };

  listening = true;
  recognition.start();
}

export function stopListening(): void {
  if (recognition) {
    recognition.stop();
  }
  listening = false;
}

export function isSpeaking(): boolean {
  return speaking;
}

export function isListening(): boolean {
  return listening;
}
