// Credit limiter for 11Labs API usage
// Prevents any single session/agent from using more than 2000 credits

interface CreditSession {
  id: string;
  creditsUsed: number;
  createdAt: number;
  lastUpdated: number;
}

const MAX_CREDITS = 2000;
const CREDIT_SESSIONS = new Map<string, CreditSession>();
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Estimate credits used based on 11Labs pricing
// Standard pricing: ~$0.30 per 1,000 characters
// 1 credit ≈ 1,000 characters
function estimateCreditsForText(text: string): number {
  // Rough estimate: every 1000 characters = 1 credit
  return Math.ceil(text.length / 1000);
}

export function getOrCreateSession(sessionId: string): CreditSession {
  let session = CREDIT_SESSIONS.get(sessionId);

  if (!session) {
    session = {
      id: sessionId,
      creditsUsed: 0,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };
    CREDIT_SESSIONS.set(sessionId, session);
  }

  // Cleanup old sessions
  if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
    CREDIT_SESSIONS.delete(sessionId);
    return getOrCreateSession(sessionId);
  }

  return session;
}

export function checkCreditsAvailable(sessionId: string, textLength: number): boolean {
  const session = getOrCreateSession(sessionId);
  const estimatedCredits = estimateCreditsForText(new Array(textLength).join('a'));
  return session.creditsUsed + estimatedCredits <= MAX_CREDITS;
}

export function useCredits(sessionId: string, textLength: number): boolean {
  const session = getOrCreateSession(sessionId);
  const estimatedCredits = estimateCreditsForText(new Array(textLength).join('a'));

  if (session.creditsUsed + estimatedCredits > MAX_CREDITS) {
    console.warn(
      `[Credits] Session ${sessionId} exceeded limit. Used: ${session.creditsUsed}, Requested: ${estimatedCredits}, Max: ${MAX_CREDITS}`
    );
    return false;
  }

  session.creditsUsed += estimatedCredits;
  session.lastUpdated = Date.now();

  console.log(
    `[Credits] Session ${sessionId}: ${session.creditsUsed}/${MAX_CREDITS} credits used (${estimatedCredits} this request)`
  );

  return true;
}

export function getCreditsRemaining(sessionId: string): number {
  const session = getOrCreateSession(sessionId);
  return MAX_CREDITS - session.creditsUsed;
}

export function getSessionCredits(sessionId: string) {
  const session = getOrCreateSession(sessionId);
  return {
    used: session.creditsUsed,
    remaining: MAX_CREDITS - session.creditsUsed,
    max: MAX_CREDITS,
    percentUsed: (session.creditsUsed / MAX_CREDITS) * 100,
  };
}

export function clearSession(sessionId: string): void {
  CREDIT_SESSIONS.delete(sessionId);
  console.log(`[Credits] Session ${sessionId} cleared`);
}

export function getAllSessions() {
  return Array.from(CREDIT_SESSIONS.values());
}
