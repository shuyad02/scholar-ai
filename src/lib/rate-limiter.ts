import { NextRequest } from "next/server";
import { AppError } from "./api-response";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory token bucket store (keyed by IP or user identifier)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired rate limit keys every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Enforces rate limiting per IP / User identifier
 * @param req NextRequest
 * @param limit Maximum allowed requests within the window
 * @param windowMs Time window in milliseconds (default 60,000ms = 1 minute)
 */
export function checkRateLimit(
  req: NextRequest,
  limit = 30,
  windowMs = 60 * 1000
): { current: number; remaining: number; resetTime: number } {
  // Extract client identifier (Forwarded-For header or fallback)
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const route = req.nextUrl.pathname;
  const key = `${ip}:${route}`;

  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newRecord);
    return {
      current: 1,
      remaining: limit - 1,
      resetTime: newRecord.resetTime,
    };
  }

  // Existing window
  record.count += 1;

  if (record.count > limit) {
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
    throw new AppError(
      `Rate limit exceeded. Please wait ${retryAfterSec} second(s) before retrying.`,
      429,
      "RATE_LIMIT_EXCEEDED",
      { retryAfterSec }
    );
  }

  return {
    current: record.count,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}
