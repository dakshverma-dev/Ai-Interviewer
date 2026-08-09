'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CODING_PROBLEMS, type CodingProblem } from '@/data/problems';
import type { Message, TestCaseResult, ProblemAttempt } from '@/lib/interviewState';
import { loadPyodideRuntime, isPyodideReady, runTestCases } from '@/lib/pyodideRunner';
import { getSession, type InterviewSession } from '@/lib/session';
import { getInitialGreeting as realGreeting, getCodeExecutionResponse as realCodeFeedback, getProgressiveHint as realHint, getInterviewResponse as realResponse, getProblemTransition as realTransition, getClosingRemark as realClosing, generateFinalReport as realReport } from '@/lib/gemini';
import { getInitialGreeting as mockGreeting, getCodeExecutionResponse as mockCodeFeedback, getProgressiveHint as mockHint, getInterviewResponse as mockResponse, getProblemTransition as mockTransition, getClosingRemark as mockClosing, generateFinalReport as mockReport } from '@/lib/gemini-mock';
import { isVoiceSupported, speak, stopSpeaking } from '@/lib/voice';
import { InterviewConversationManager } from '@/lib/elevenLabsConversation';
import CodeEditor from '@/components/CodeEditor';
import ProblemPanel from '@/components/ProblemPanel';
import TestResultsList from '@/components/TestResultsList';
import InterviewerPanel from '@/components/InterviewerPanel';
import ThinkingPanel from '@/components/ThinkingPanel';

// Use mock mode by default; set NEXT_PUBLIC_MOCK_MODE=false to use real API
const USE_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE !== 'false';

const getInitialGreeting = USE_MOCK ? mockGreeting : realGreeting;
const getCodeExecutionResponse = USE_MOCK ? mockCodeFeedback : realCodeFeedback;
const getProgressiveHint = USE_MOCK ? mockHint : realHint;
const getInterviewResponse = USE_MOCK ? mockResponse : realResponse;
const getProblemTransition = USE_MOCK ? mockTransition : realTransition;
const getClosingRemark = USE_MOCK ? mockClosing : realClosing;
const generateFinalReport = USE_MOCK ? mockReport : realReport;

function selectProblems(session: InterviewSession | null): CodingProblem[] {
  if (!session || session.difficulty === 'Mixed') {
    return CODING_PROBLEMS.slice(0, 3);
  }
  const matching = CODING_PROBLEMS.filter((p) => p.difficulty === session.difficulty);
  const pool = matching.length >= 3 ? matching : CODING_PROBLEMS;
  return pool.slice(0, 3);
}

export default function InterviewPage() {
  return (
    <Suspense fallback={null}>
      <InterviewScreen />
    </Suspense>
  );
}

function InterviewScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionCode = searchParams.get('code');

  const [session, setSession] = useState<InterviewSession | null>(null);

  useEffect(() => {
    if (sessionCode) {
      setSession(getSession(sessionCode) ?? null);
    }
  }, [sessionCode]);

  const problems = useMemo(() => selectProblems(session), [session]);

  const [problemIndex, setProblemIndex] = useState(0);
  const [code, setCode] = useState(problems[0].initialCode);
  const [messages, setMessages] = useState<Message[]>([]);
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const attemptsRef = useRef<ProblemAttempt[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const greetedProblemsRef = useRef<Set<string>>(new Set());
  const [voiceSupported, setVoiceSupported] = useState({ speechSynthesis: false, speechRecognition: false });

  // 11Labs voice agent state
  const [conversationManager, setConversationManager] = useState<InterviewConversationManager | null>(null);
  const [useVoiceAgent, setUseVoiceAgent] = useState(false);
  const [voiceAgentReady, setVoiceAgentReady] = useState(false);

  useEffect(() => {
    setVoiceSupported(isVoiceSupported());
  }, []);

  // Initialize 11Labs voice agent on mount
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

    if (apiKey && agentId) {
      setUseVoiceAgent(true);

      const manager = new InterviewConversationManager({
        apiKey,
        agentId,
      });

      manager
        .connect(
          (message, role) => {
            addMessage(role, message);
          },
          (isSpeaking) => {
            setIsAiSpeaking(isSpeaking);
          }
        )
        .then(() => {
          setVoiceAgentReady(true);
          console.log('Voice agent connected and ready');
        })
        .catch((error) => {
          console.error('Failed to connect voice agent:', error);
          setUseVoiceAgent(false);
        });

      setConversationManager(manager);

      return () => {
        manager.disconnect();
      };
    }
  }, []);

  const currentProblem = problems[problemIndex];

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
    // Skip greeting if using voice agent (it will handle its own greeting)
    if (useVoiceAgent || greetedProblemsRef.current.has(currentProblem.id)) return;
    greetedProblemsRef.current.add(currentProblem.id);

    getInitialGreeting(currentProblem)
      .then((greeting) => {
        addMessage('ai', greeting);
        speakIfSupported(greeting);
      })
      .catch(() => setError('Could not reach the AI interviewer. Check your connection and API key. You can dismiss this and try again.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProblem.id, useVoiceAgent]);

  const handleRunCode = async () => {
    if (!isPyodideReady()) return;
    setIsRunning(true);
    setError(null);
    try {
      const functionName = currentProblem.initialCode.match(/def (\w+)/)?.[1] ?? '';
      const results = await runTestCases(functionName, code, currentProblem.testCases);
      setTestResults(results);

      setIsThinking(true);
      const feedback = await getCodeExecutionResponse(currentProblem, code, results);
      setIsThinking(false);
      addMessage('ai', feedback);
      speakIfSupported(feedback);
    } catch {
      setIsThinking(false);
      setError('Something went wrong running your code or getting feedback. You can dismiss this and try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    addMessage('candidate', text);
    setError(null);
    try {
      if (useVoiceAgent && conversationManager?.isReady()) {
        // Use 11Labs voice agent for real-time conversation
        await conversationManager.sendMessage(text);
      } else {
        // Fall back to mock/real text-based API
        const isHintRequest = /hint|help|stuck|clue/i.test(text);
        if (isHintRequest) setIsThinking(true);
        const response = isHintRequest
          ? await getProgressiveHint(currentProblem, code, 2)
          : await getInterviewResponse(text, code, currentProblem, messagesRef.current);
        setIsThinking(false);
        addMessage('ai', response);
        speakIfSupported(response);
      }
    } catch (err) {
      setIsThinking(false);
      console.error('Message error:', err);
      setError('Could not reach the AI interviewer. Check your connection and API key, then retry.');
    }
  };

  const handleNextProblem = async () => {
    setAdvancing(true);
    stopSpeaking();
    setIsAiSpeaking(false);

    if (!attemptsRef.current.some((a) => a.problemId === currentProblem.id)) {
      attemptsRef.current.push({
        problemId: currentProblem.id,
        code,
        testResults,
      });
    }

    const nextIndex = problemIndex + 1;

    if (nextIndex >= problems.length) {
      try {
        const closing = await getClosingRemark();
        addMessage('ai', closing);
        speakIfSupported(closing);

        const attempts = attemptsRef.current.map((a) => ({
          problem: problems.find((p) => p.id === a.problemId)!,
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
        setError('Could not generate the final report. Dismiss this and click Finish Interview again to retry.');
        setAdvancing(false);
      }
      return;
    }

    try {
      const nextProblem = problems[nextIndex];
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
      {session && (
        <div className="text-xs text-[var(--color-pewter)] flex items-center gap-2">
          <span className="font-mono">{session.code}</span>
          <span>·</span>
          <span>{session.language}</span>
          <span>·</span>
          <span>{session.difficulty}</span>
        </div>
      )}

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

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: Problem statement + test results */}
        <div className="w-[28%] min-h-0 flex flex-col gap-3 overflow-y-auto">
          <ProblemPanel problem={currentProblem} />
          <TestResultsList results={testResults} />
        </div>

        {/* Middle: Code editor + run controls */}
        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="flex-1 min-h-0 relative">
            <CodeEditor value={code} onChange={setCode} />
          </div>
          <ThinkingPanel active={isThinking} />
          <div className="flex gap-3 shrink-0">
            <button
              onClick={handleRunCode}
              disabled={!pyodideReady || isRunning}
              className="btn-primary"
            >
              {!pyodideReady ? 'Loading Python...' : isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button onClick={handleNextProblem} disabled={advancing} className="btn-ghost">
              {problemIndex === problems.length - 1 ? 'Finish Interview' : 'Next Problem'}
            </button>
          </div>
        </div>

        {/* Right: Interviewer chat */}
        <div className="w-[28%] min-h-0">
          <InterviewerPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isAiSpeaking={isAiSpeaking}
            voiceSupported={voiceSupported.speechRecognition}
            useVoiceAgent={useVoiceAgent}
            voiceAgentReady={voiceAgentReady}
          />
        </div>
      </div>
    </div>
  );
}
