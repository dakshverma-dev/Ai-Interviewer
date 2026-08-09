import type { CodingProblem } from '@/data/problems';
import type { Message, TestCaseResult, InterviewReport } from './interviewState';

const MOCK_RESPONSES = {
  greetings: [
    "Hey there! Great to have you here today. We're going to work through this problem together, so just think out loud and let me know if you have any questions.",
    "Welcome! I'm excited to see how you approach this. Take your time, and let's solve this step by step.",
    "Alright, let's dive in! Here's an interesting problem for you. Feel free to ask clarifying questions anytime.",
  ],

  feedback: [
    "That's a solid start! Your logic is on the right track. Have you considered what happens with edge cases like empty inputs?",
    "Nice! Your approach is working. Let me ask you this: can you think of ways to optimize the time complexity?",
    "Great effort! I see what you're trying to do. Let me give you a hint: think about whether you can solve this in one pass instead of two.",
  ],

  hints: [
    "Think about what data structure might help you track values efficiently. Consider hash maps or sets.",
    "You're close! What if you used a two-pointer approach? That might simplify things.",
    "Consider breaking this down into smaller subproblems. What's the pattern here?",
  ],

  transitions: [
    "Excellent work! Let's move on to the next problem. This one is a bit different but uses similar concepts.",
    "Good job there. Now let's try something new. This problem will test your understanding of recursion.",
    "Great! You've got the idea. Next up, we have an interesting dynamic programming challenge for you.",
  ],

  closing:
    "That was a great interview! You've shown solid problem-solving skills and clear communication. We're compiling your results now. Thanks for your time!",
};

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function getInitialGreeting(_problem: CodingProblem): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return getRandomResponse(MOCK_RESPONSES.greetings);
}

export async function getCodeExecutionResponse(_problem: CodingProblem, _code: string, _testResults: TestCaseResult[]): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return getRandomResponse(MOCK_RESPONSES.feedback);
}

export async function getProgressiveHint(_problem: CodingProblem, _code: string, _hintLevel: 1 | 2 | 3): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getRandomResponse(MOCK_RESPONSES.hints);
}

export async function getInterviewResponse(_userMessage: string, _code: string, _problem: CodingProblem, _history: Message[]): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const responses = [
    "That's a good point! Let me ask you to elaborate a bit more on that approach.",
    "I see what you mean. How would you handle this scenario?",
    "Interesting perspective! Can you walk me through your thinking?",
    "That's one way to look at it. What other approaches have you considered?",
  ];

  return getRandomResponse(responses);
}

export async function getProblemTransition(_nextProblem: CodingProblem): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return getRandomResponse(MOCK_RESPONSES.transitions);
}

export async function getClosingRemark(): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_RESPONSES.closing;
}

export async function generateFinalReport(): Promise<InterviewReport> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    overallVerdict: 'Solid problem-solving approach with room for optimization',
    overallSummary:
      'You demonstrated strong logical thinking and communication throughout the interview. Your solutions were correct and well-explained. Focus on edge cases and optimization in future practice.',
    perProblem: [
      {
        problemTitle: 'Two Sum',
        passed: true,
        codeQuality: 'Clear and readable with good variable names.',
        complexityNote: 'O(n) time complexity using a hash map approach.',
      },
      {
        problemTitle: 'Linked List Reversal',
        passed: true,
        codeQuality: 'Efficient iterative solution with proper null checks.',
        complexityNote: 'O(n) time, O(1) space with in-place reversal.',
      },
      {
        problemTitle: 'Longest Substring Without Repeating',
        passed: false,
        codeQuality: 'Good structure but missed a boundary case.',
        complexityNote: 'O(n) time complexity with sliding window approach.',
      },
    ],
    strengths: [
      'Clear communication and explanation of thinking process',
      'Strong understanding of data structures',
      'Efficient algorithmic approaches',
      'Good debugging skills',
    ],
    weaknesses: ['Edge case handling', 'Time management under pressure', 'Testing thoroughness'],
  };
}
