# AI Interviewer

A live, AI-conducted technical coding interview platform. There is no practice mode and no account system: start an interview and go.

## Overview

AI Interviewer simulates a real technical interview. An AI interviewer presents a coding problem in a split-screen layout, with the problem statement and a Monaco code editor on one side and a live conversation panel on the other. Submitted code executes for real in the browser and is checked against the problem's test cases, so results are never simulated or guessed.

## Features

- AI interviewer that greets the candidate and introduces each problem in a live, conversational format
- Split-screen interface combining a Monaco code editor with a real-time chat/voice panel
- In-browser Python execution via Pyodide, run against real test cases
- Contextual AI feedback based on actual test results, including hints on request and interviewer-style follow-up questions
- Automated final report after three problems, summarizing verdict, strengths, weaknesses, and per-problem notes based on the full transcript and submitted code

## Getting Started

### Prerequisites

- Node.js and npm
- A Gemini API key (free tier available at https://aistudio.google.com/app/apikey)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then add your Gemini API key to `.env.local`.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 in your browser.

## Tech Stack

- **Framework:** Next.js 15, TypeScript
- **Styling:** Tailwind CSS v4
- **AI:** Gemini 2.5 Flash
- **Voice:** Web Speech API
- **Code Execution:** Pyodide (in-browser Python runtime)
- **Editor:** Monaco Editor

## Notes

- Voice features are best supported in Chrome and Edge. Unsupported browsers fall back to text-only mode automatically.
- The interview session is entirely in-memory by design. Refreshing the page resets the session, and no accounts or persistent database are used.
