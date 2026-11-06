/**
 * Fixed-window rate limiting backed by MongoDB.
 *
 * Counters live in the database, so the limit holds across serverless
 * instances (an in-memory counter resets with each cold start).
 */

import RateLimit from '../models/RateLimit';

const DUPLICATE_KEY = 11000;

/**
 * Count one request against a limit.
 * @param {object} options
 * @param {string} options.scope - What is being limited, e.g. "shareEmail"
 * @param {string} options.key - Who is being limited, e.g. a user id
 * @param {number} options.limit - Requests allowed per window
 * @param {number} options.windowMs - Window length in milliseconds
 * @param {number} [options.now] - Current time, for tests
 * @returns {Promise<{ allowed: boolean, remaining: number, retryAfterSeconds: number }>}
 */
export async function consumeRateLimit({ scope, key, limit, windowMs, now = Date.now() }) {
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetAt = windowStart + windowMs;
  const id = `${scope}:${key}:${windowStart}`;

  const increment = () =>
    RateLimit.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(resetAt) } },
      { upsert: true, returnDocument: 'after', lean: true }
    );

  let doc;
  try {
    doc = await increment();
  } catch (error) {
    // Two first requests in the same window can race on the upsert; the loser retries.
    if (error?.code !== DUPLICATE_KEY) throw error;
    doc = await increment();
  }

  return {
    allowed: doc.count <= limit,
    remaining: Math.max(0, limit - doc.count),
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

/**
 * Apply a rate limit to an API request. Sends a 429 and returns false when
 * the limit is exceeded.
 * @param {import('next').NextApiResponse} res
 * @param {{ scope: string, key: string, limit: number, windowMs: number }} options
 * @returns {Promise<boolean>}
 */
export async function enforceRateLimit(res, options) {
  const result = await consumeRateLimit(options);
  res.setHeader('X-RateLimit-Limit', options.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  if (!result.allowed) {
    res.setHeader('Retry-After', result.retryAfterSeconds);
    res.status(429).json({
      message: 'Too many requests. Please try again later.',
      retryAfterSeconds: result.retryAfterSeconds,
    });
    return false;
  }
  return true;
}
