import type { RequestHandler } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  /** Length of the counting window in milliseconds. */
  windowMs: number;
  /** Maximum number of requests allowed per key per window. */
  max: number;
  /** Namespace so different limits don't share counters. */
  scope: string;
}

/**
 * Small fixed-window rate limiter keyed by client IP.
 *
 * Deliberately dependency-free and in-memory: good enough to stop a bored
 * human (or a naive script) from hammering the enquiry endpoint. If you run
 * more than one process, move this to a shared store (Redis) or the limits
 * become per-process.
 */
export function rateLimit({ windowMs, max, scope }: RateLimitOptions): RequestHandler {
  const buckets = new Map<string, Bucket>();

  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, Math.max(windowMs, 60_000));
  sweeper.unref();

  return (req, res, next) => {
    const key = `${scope}:${req.ip ?? "unknown"}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({
        error: "rate_limited",
        message: "Too many messages from this connection. Please try again in a few minutes.",
        retryAfter,
      });
      return;
    }

    bucket.count += 1;
    next();
  };
}
