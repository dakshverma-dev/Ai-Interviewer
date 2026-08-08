'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CODING_PROBLEMS } from '@/data/problems';
import type { Message, TestCaseResult, ProblemAttempt } from '@/lib/interviewState';
import { loadPyodideRuntime, isPyodideReady, runTestCases } from '@/lib/pyodideRunner';
import {
  getInitialGreeting,
  getCodeExecutionResponse,
  getProgressiveHint,
  getInterviewResponse,
  getProblemTransition,
  getClosingRemark,
  generateFinalReport,
} from '@/lib/gemini';
import { isVoiceSupported, speak, stopSpeaking } from '@/lib/voice';
import CodeEditor from '@/components/CodeEditor';
import ProblemPanel from '@/components/ProblemPanel';
import TestResultsList from '@/components/TestResultsList';
import InterviewerPanel from '@/components/InterviewerPanel';

export default function InterviewPage() {
  const router = useRouter();
  const [problemIndex, setProblemIndex] = useState(0);
  const [code, setCode] = useState(CODING_PROBLEMS[0].initialCode);
  const [messages, setMessages] = useState<Message[]>([]);
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const attemptsRef = useRef<ProblemAttempt[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const greetedProblemsRef = useRef<Set<string>>(new Set());
  const voiceSupported = useRef(isVoiceSupported()).current;
  const currentProblem = CODING_PROBLEMS[problemIndex];

  useEffect(() => {
    loadPyodideRuntime()
      .then(() => setPyodideReady(true))
      .catch(() => setError('Failed to load the Python runtime. You can still chat with the interviewer, but Run Code will be unavailable.'));
  }, []);

  const addMessage = (role: Message['role'], text: string) => {
    setMessages((prev) => {
      const next = [...prev, { role, text, timestamp: Date.now() }];
      messagesRef.current = next;
      return next;
    });
  };

  const speakIfSupported = (text: string) => {
    if (voiceSupported.speechSynthesis) {
      setIsAiSpeaking(true);
      speak(text, () => setIsAiSpeaking(false));
    }
  };

  useEffect(() => {
    if (greetedProblemsRef.current.has(currentProblem.id)) return;
    greetedProblemsRef.current.add(currentProblem.id);

    getInitialGreeting(currentProblem)
      .then((greeting) => {
        addMessage('ai', greeting);
        speakIfSupported(greeting);
      })
      .catch(() => setError('Could not reach the AI interviewer. Check your connection and API key, then retry.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProblem.id]);

  const handleRunCode = async () => {
    if (!isPyodideReady()) return;
    setIsRunning(true);
    setError(null);
    try {
      const functionName = currentProblem.initialCode.match(/def (\w+)/)?.[1] ?? '';
      const results = await runTestCases(functionName, code, currentProblem.testCases);
      setTestResults(results);

      const feedback = await getCodeExecutionResponse(currentProblem, code, results);
      addMessage('ai', feedback);
      speakIfSupported(feedback);
    } catch {
      setError('Something went wrong running your code or getting feedback. Try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    addMessage('candidate', text);
    setError(null);
    try {
      const isHintRequest = /hint|help|stuck|clue/i.test(text);
      const response = isHintRequest
        ? await getProgressiveHint(currentProblem, code, 2)
        : await getInterviewResponse(text, code, currentProblem, messagesRef.current);
      addMessage('ai', response);
      speakIfSupported(response);
    } catch {
      setError('Could not reach the AI interviewer. Check your connection and API key, then retry.');
    }
  };

  const handleNextProblem = async () => {
    setAdvancing(true);
    stopSpeaking();

    if (!attemptsRef.current.some((a) => a.problemId === currentProblem.id)) {
      attemptsRef.current.push({
        problemId: currentProblem.id,
        code,
        testResults,
      });
    }

    const nextIndex = problemIndex + 1;

    if (nextIndex >= CODING_PROBLEMS.length) {
      try {
        const closing = await getClosingRemark();
        addMessage('ai', closing);
        speakIfSupported(closing);

        const attempts = attemptsRef.current.map((a) => ({
          problem: CODING_PROBLEMS.find((p) => p.id === a.problemId)!,
          code: a.code,
          testResults: a.testResults,
        }));
        const report = await generateFinalReport(messagesRef.current, attempts);

        sessionStorage.setItem(
          'interviewData',
          JSON.stringify({ report, transcript: messagesRef.current, attempts: attemptsRef.current })
        );
        router.push('/report');
      } catch {
        setError('Could not generate the final report. Check your connection and API key, then retry.');
        setAdvancing(false);
      }
      return;
    }

    try {
      const nextProblem = CODING_PROBLEMS[nextIndex];
      const transition = await getProblemTransition(nextProblem);
      addMessage('ai', transition);
      speakIfSupported(transition);

      setProblemIndex(nextIndex);
      setCode(nextProblem.initialCode);
      setTestResults([]);
    } catch {
      setError('Could not reach the AI interviewer. Check your connection and API key, then retry.');
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col p-4 gap-3">
      {error && (
        <div
          className="text-sm px-4 py-3 rounded-[var(--radius-xl)] flex items-center justify-between"
          style={{ background: 'rgba(255, 95, 87, 0.1)', color: 'var(--color-ember)' }}
        >
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        <div className="flex flex-col gap-3 min-h-0">
          <div className="min-h-0" style={{ flex: '0 1 40%' }}>
            <ProblemPanel problem={currentProblem} />
          </div>
          <div style={{ flex: '1 1 60%' }} className="min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <CodeEditor value={code} onChange={setCode} />
            </div>
            <TestResultsList results={testResults} />
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleRunCode}
                disabled={!pyodideReady || isRunning}
                className="btn-primary"
              >
                {!pyodideReady ? 'Loading Python...' : isRunning ? 'Running...' : 'Run Code'}
              </button>
              <button onClick={handleNextProblem} disabled={advancing} className="btn-ghost">
                {problemIndex === CODING_PROBLEMS.length - 1 ? 'Finish Interview' : 'Next Problem'}
              </button>
            </div>
          </div>
        </div>

        <InterviewerPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          isAiSpeaking={isAiSpeaking}
          voiceSupported={voiceSupported.speechRecognition}
        />
      </div>
    </div>
  );
}
