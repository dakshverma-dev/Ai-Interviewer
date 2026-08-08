export interface InterviewSession {
  code: string;
  kind: 'technical';
  problemSetId: string;
  language: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  createdAt: number;
}

export interface ProblemSetOption {
  id: string;
  name: string;
  description: string;
}

export const PROBLEM_SETS: ProblemSetOption[] = [
  {
    id: 'dsa-core',
    name: 'Core Data Structures & Algorithms',
    description: 'Arrays, hashing, sliding window, DP, binary search — the standard technical screen.',
  },
];

export const LANGUAGE_OPTIONS = ['Python', 'JavaScript', 'Java', 'C++'];

export const DIFFICULTY_OPTIONS: InterviewSession['difficulty'][] = ['Easy', 'Medium', 'Hard', 'Mixed'];

const STORAGE_KEY = 'aiInterviewerSessions';

function readAllSessions(): Record<string, InterviewSession> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAllSessions(sessions: Record<string, InterviewSession>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createSession(config: {
  problemSetId: string;
  language: string;
  difficulty: InterviewSession['difficulty'];
}): InterviewSession {
  const sessions = readAllSessions();
  let code = generateCode();
  while (sessions[code]) {
    code = generateCode();
  }

  const session: InterviewSession = {
    code,
    kind: 'technical',
    problemSetId: config.problemSetId,
    language: config.language,
    difficulty: config.difficulty,
    createdAt: Date.now(),
  };

  sessions[code] = session;
  writeAllSessions(sessions);
  return session;
}

export function getSession(code: string): InterviewSession | undefined {
  const sessions = readAllSessions();
  return sessions[code.trim().toUpperCase()];
}
