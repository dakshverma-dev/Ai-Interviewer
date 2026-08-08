# AI Interviewer

A live, AI-conducted technical coding interview. No practice mode, no accounts — start the interview and go.

## What it does

- An AI interviewer greets you and presents a coding problem in a live split-screen: problem statement + Monaco code editor on one side, a spoken/text conversation with the AI on the other.
- Your code runs for real (via Pyodide, Python-in-the-browser) against the problem's test cases — no guessing whether it's "probably right."
- The AI reacts to your results, offers hints on request, and asks follow-up questions like a real interviewer would.
- After 3 problems, the AI reads back over the full transcript and your code and writes an honest report: verdict, strengths, weaknesses, per-problem notes.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and add your Gemini API key (get one free at https://aistudio.google.com/app/apikey)
3. `npm run dev`
4. Open http://localhost:3000

## Stack

Next.js 15, TypeScript, Tailwind CSS v4, Gemini 2.5 Flash, Web Speech API (voice), Pyodide (in-browser Python execution), Monaco Editor.

## Notes

- Voice works best in Chrome/Edge. Unsupported browsers fall back to text-only automatically.
- Everything lives in-session — refreshing resets the interview. No accounts, no database, by design.
