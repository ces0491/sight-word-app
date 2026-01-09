/**
 * Simple in-memory rate limiting middleware
 * For production, consider using Redis or a dedicated rate limiting service
 */

const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  // Store for tracking requests
  const store = new Map();

  // Clean up old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (now - value.resetTime > windowMs) {
        store.delete(key);
      }
    }
  }, windowMs);

  return async (req, res, next) => {
    // Get client identifier (IP address or user ID if authenticated)
    const identifier = req.headers['x-forwarded-for'] ||
                      req.socket.remoteAddress ||
                      req.connection.remoteAddress ||
                      'unknown';

    const now = Date.now();
    const record = store.get(identifier);

    if (!record) {
      // First request from this identifier
      store.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return next ? next() : undefined;
    }

    // Check if window has expired
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      store.set(identifier, record);
      return next ? next() : undefined;
    }

    // Increment count
    record.count++;

    // Check if limit exceeded
    if (record.count > max) {
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      return res.status(statusCode).json({
        error: message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - record.count);
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    return next ? next() : undefined;
  };
};

/**
 * Strict rate limiter for auth endpoints
 */
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later.'
});

/**
 * Standard rate limiter for API endpoints
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.'
});

/**
 * Lenient rate limiter for public endpoints
 */
export const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per window
  message: 'Too many requests, please try again later.'
});

export default rateLimit;
