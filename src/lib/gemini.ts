import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CodingProblem } from '@/data/problems';
import type { Message, TestCaseResult, InterviewReport } from './interviewState';

function getModel() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set. Add it to .env.local.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      maxOutputTokens: 8192,
    },
  });
}

async function generate(prompt: string): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text.trim()) {
    throw new Error('Gemini returned an empty response (likely hit the output token limit).');
  }
  return text;
}

export async function getInitialGreeting(problem: CodingProblem): Promise<string> {
  const prompt = `You are an experienced, friendly senior technical interviewer conducting a live coding interview. A candidate is about to work on "${problem.title}".

Problem: ${problem.description}

Give a short, warm, professional greeting that:
- Opens with a brief, human, conversational line (not robotic)
- Transitions naturally into introducing the problem
- Invites them to think out loud and ask questions

Keep it to 2-3 sentences total, spoken tone, no markdown formatting since this will be read aloud.`;

  return generate(prompt);
}

export async function getCodeExecutionResponse(
  problem: CodingProblem,
  code: string,
  testResults: TestCaseResult[]
): Promise<string> {
  const passedCount = testResults.filter((t) => t.passed).length;
  const totalCount = testResults.length;
  const resultsSummary = testResults
    .map((t, i) => `Test ${i + 1}: ${t.passed ? 'PASSED' : 'FAILED'}${t.error ? ` (error: ${t.error})` : ''}`)
    .join('\n');

  const prompt = `You are an experienced, encouraging technical interviewer. The candidate just ran their code for "${problem.title}".

CODE:
${code}

TEST RESULTS (${passedCount}/${totalCount} passed):
${resultsSummary}

Give feedback that:
1. Starts encouraging, acknowledges what's working
2. If tests failed, guides toward the issue with a question, never gives the direct fix
3. If all tests passed, comment on the approach's efficiency (time/space complexity) and ask a follow-up question about edge cases or optimization
4. Stays conversational, 2-3 sentences, spoken tone, no markdown since this will be read aloud

Never spoil the solution outright.`;

  return generate(prompt);
}

export async function getProgressiveHint(
  problem: CodingProblem,
  code: string,
  hintLevel: 1 | 2 | 3
): Promise<string> {
  const levelDescription = {
    1: 'conceptual guidance about the problem itself',
    2: 'a nudge toward the right data structure or general approach',
    3: 'more specific algorithmic direction, still without the full solution',
  }[hintLevel];

  const prompt = `You are a technical interviewer giving a level-${hintLevel} hint (${levelDescription}) for "${problem.title}".

CURRENT CODE:
${code}

KNOWN HINTS FOR THIS PROBLEM (use as inspiration, do not read verbatim):
${problem.hints.join('\n')}

Give one hint appropriate for level ${hintLevel}. Keep it encouraging, 1-2 sentences, spoken tone. Never give the full solution.`;

  return generate(prompt);
}

export async function getInterviewResponse(
  userMessage: string,
  code: string,
  problem: CodingProblem,
  history: Message[]
): Promise<string> {
  const recentHistory = history
    .slice(-6)
    .map((m) => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.text}`)
    .join('\n');

  const prompt = `You are an experienced technical interviewer conducting a live coding interview.

PROBLEM: ${problem.title} — ${problem.description}

CURRENT CODE:
${code}

RECENT CONVERSATION:
${recentHistory}

CANDIDATE JUST SAID: ${userMessage}

Respond as a supportive but genuinely engaged interviewer:
- Guide with questions rather than direct answers
- Reference their actual code when relevant
- Keep it to 2-3 sentences, spoken tone, no markdown since this will be read aloud
- Use "we" to keep it collaborative`;

  return generate(prompt);
}

export async function getProblemTransition(nextProblem: CodingProblem): Promise<string> {
  const prompt = `You are a technical interviewer. The candidate just finished the previous problem and is moving on to "${nextProblem.title}".

Problem: ${nextProblem.description}

Give a short transition (1-2 sentences, spoken tone, no markdown) that acknowledges moving on and briefly introduces the new problem.`;

  return generate(prompt);
}

export async function getClosingRemark(): Promise<string> {
  const prompt = `You are a technical interviewer wrapping up a live coding interview session after 3 problems. Give a warm, brief closing remark (2-3 sentences, spoken tone, no markdown) thanking the candidate and letting them know their results are being compiled.`;

  return generate(prompt);
}

export async function generateFinalReport(
  transcript: Message[],
  attempts: { problem: CodingProblem; code: string; testResults: TestCaseResult[] }[]
): Promise<InterviewReport> {
  const transcriptText = transcript
    .map((m) => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.text}`)
    .join('\n');

  const attemptsText = attempts
    .map((a) => {
      const passed = a.testResults.every((t) => t.passed);
      const passedCount = a.testResults.filter((t) => t.passed).length;
      return `## ${a.problem.title}
FINAL CODE:
${a.code}

TEST RESULTS: ${passedCount}/${a.testResults.length} passed (${passed ? 'ALL PASSED' : 'INCOMPLETE'})`;
    })
    .join('\n\n');

  const prompt = `You are a senior technical interviewer writing a candid post-interview report based on a full interview transcript and the candidate's final code for each problem.

FULL TRANSCRIPT:
${transcriptText}

CODE SUBMISSIONS AND TEST RESULTS:
${attemptsText}

Write an honest, evidence-based assessment. Return ONLY valid JSON matching this exact shape, nothing else, no markdown code fences:

{
  "overallVerdict": "one short headline judgement, e.g. 'Strong problem-solving, needs polish on edge cases'",
  "overallSummary": "2-4 sentences summarizing overall performance",
  "perProblem": [
    {
      "problemTitle": "exact problem title",
      "passed": true or false based on whether all test cases passed,
      "codeQuality": "one brief sentence on code quality/style",
      "complexityNote": "one brief sentence on time/space complexity of their approach"
    }
  ],
  "strengths": ["specific strength 1", "specific strength 2"],
  "weaknesses": ["specific area to improve 1", "specific area to improve 2"]
}

Base every claim on the actual transcript and code above. Do not invent details.`;

  const text = await generate(prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Gemini did not return parseable JSON for the final report.');
  }
  const parsed = JSON.parse(jsonMatch[0]) as Partial<InterviewReport>;
  if (
    typeof parsed.overallVerdict !== 'string' ||
    typeof parsed.overallSummary !== 'string' ||
    !Array.isArray(parsed.perProblem) ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.weaknesses)
  ) {
    throw new Error('Gemini returned a report in an unexpected shape.');
  }
  return parsed as InterviewReport;
}
