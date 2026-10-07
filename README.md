# AI Interviewer

**A conversational coding interview, with real Python test results.**

AI Interviewer puts a problem statement, Monaco editor, and interviewer conversation into one workspace. Submitted Python runs through Pyodide in the browser; those test results are passed into the feedback flow.

[Open demo](https://ai-interviewer-sigma-peach.vercel.app) · [Run locally](#run-locally) · [Source tour](#source-tour)

## The interview loop

```text
Problem → Write Python → Run test cases → Discuss results
                                               |
                                    Next problem → Final report
```

The prototype supports a three-problem interview, progressive hints, conversation history, and a final summary. Browser speech provides a voice layer. The repository also contains an optional ElevenLabs conversation integration.

## Demo mode and live AI

The interview page uses **mock feedback by default**. Python execution still uses the real Pyodide runtime.

To switch the text interviewer to Gemini, set `NEXT_PUBLIC_MOCK_MODE=false` and provide a Gemini key. The code currently requests `gemini-2.5-flash`. Mock responses are useful for exploring the flow without a provider account; they are not an independent assessment of a candidate.

## Run locally

Use Node.js 20 or later and npm.

```bash
git clone https://github.com/dakshverma-dev/Ai-Interviewer.git
cd Ai-Interviewer
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The default demo mode does not require an AI key. Pyodide is loaded from a CDN, so its initial load needs an internet connection.

For live Gemini feedback, create `.env.local`:

```env
NEXT_PUBLIC_MOCK_MODE=false
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

Restart the development server after changing configuration. The Gemini key is read by client code in this prototype; a public deployment needs a server-side provider boundary.

For the optional voice-agent integration, inspect [the conversation manager](src/lib/elevenLabsConversation.ts) and [its initialization](src/app/interview/page.tsx). It connects to a configured public ElevenLabs agent through WebRTC. Provider access, browser microphone permission, and that separate agent configuration determine availability.

## Try the complete flow

1. Start an interview and open a problem.
2. Submit an incomplete solution to see actual failing test results.
3. Ask the interviewer for a hint.
4. Improve the solution and run it again.
5. Advance through the problems and inspect the final report.

## Source tour

| File or directory | Responsibility |
| --- | --- |
| [Interview page](src/app/interview/page.tsx) | Problem progression, feedback, and report generation |
| [Python runner](src/lib/pyodideRunner.ts) | Loads Pyodide and runs the test-case harness |
| [Gemini integration](src/lib/gemini.ts) | Feedback and report requests |
| [Mock integration](src/lib/gemini-mock.ts) | Default demo responses |
| [Voice integration](src/lib/voice.ts) | Browser speech controls |
| [Problems](src/data/problems.ts) | Challenges and test cases |

**Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Monaco, Pyodide, Gemini, and the ElevenLabs client.

## Current scope

This is an interview prototype. It has no account service or persistent interview database. Active state lives in the browser, and the generated report is stored in session storage. Refreshing can interrupt an interview.

The Python runner executes inside the page; it is not a hardened sandbox for arbitrary untrusted submissions. Final reports and hints are product demonstrations, not validated hiring scores.

## Build

```bash
npm run build
npm run start
```
