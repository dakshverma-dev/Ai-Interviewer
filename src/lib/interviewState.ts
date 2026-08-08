export interface Message {
  role: 'ai' | 'candidate';
  text: string;
  timestamp: number;
}

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
}

export interface ProblemAttempt {
  problemId: string;
  code: string;
  testResults: TestCaseResult[];
}

export interface InterviewReport {
  overallVerdict: string;
  overallSummary: string;
  perProblem: {
    problemTitle: string;
    passed: boolean;
    codeQuality: string;
    complexityNote: string;
  }[];
  strengths: string[];
  weaknesses: string[];
}
