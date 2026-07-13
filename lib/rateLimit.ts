// Basic in-memory rate limiter. Good enough to deter casual spam/bots.
// Resets when the serverless function cold-starts, so it's not bulletproof
// on Vercel — for stronger protection at scale, swap this for Upstash Redis.

const hits = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const record = hits.get(identifier);

  if (!record || now > record.resetAt) {
    hits.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - record.count };
}