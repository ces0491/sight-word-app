/** @jest-environment node */
import { createResponse } from '../../test/apiTestUtils';

jest.mock('../../models/RateLimit', () => ({ findOneAndUpdate: jest.fn() }));

const RateLimit = require('../../models/RateLimit');
const { consumeRateLimit, enforceRateLimit } = require('../rateLimit');

const HOUR = 60 * 60 * 1000;
const options = { scope: 'aiStory', key: 'user-1', limit: 2, windowMs: HOUR };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('consumeRateLimit', () => {
  it('keys the counter by scope, user and window start', async () => {
    RateLimit.findOneAndUpdate.mockResolvedValue({ count: 1 });
    const now = 5 * HOUR + 1234;

    await consumeRateLimit({ ...options, now });

    const [filter, update, opts] = RateLimit.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({ _id: `aiStory:user-1:${5 * HOUR}` });
    expect(update.$inc).toEqual({ count: 1 });
    expect(update.$setOnInsert.expiresAt).toEqual(new Date(6 * HOUR));
    expect(opts).toMatchObject({ upsert: true, returnDocument: 'after' });
  });

  it('allows requests up to the limit', async () => {
    RateLimit.findOneAndUpdate.mockResolvedValue({ count: 2 });
    const result = await consumeRateLimit({ ...options, now: 0 });

    expect(result).toMatchObject({ allowed: true, remaining: 0 });
  });

  it('blocks requests over the limit and says when to retry', async () => {
    RateLimit.findOneAndUpdate.mockResolvedValue({ count: 3 });
    const result = await consumeRateLimit({ ...options, now: HOUR - 30_000 });

    expect(result).toEqual({ allowed: false, remaining: 0, retryAfterSeconds: 30 });
  });

  it('retries once when two first requests race on the upsert', async () => {
    RateLimit.findOneAndUpdate
      .mockRejectedValueOnce(Object.assign(new Error('dup'), { code: 11000 }))
      .mockResolvedValueOnce({ count: 1 });

    const result = await consumeRateLimit({ ...options, now: 0 });

    expect(RateLimit.findOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(result.allowed).toBe(true);
  });

  it('passes other database errors through', async () => {
    RateLimit.findOneAndUpdate.mockRejectedValue(new Error('connection lost'));
    await expect(consumeRateLimit({ ...options, now: 0 })).rejects.toThrow('connection lost');
  });
});

describe('enforceRateLimit', () => {
  it('sends 429 with Retry-After when the limit is exceeded', async () => {
    RateLimit.findOneAndUpdate.mockResolvedValue({ count: 3 });
    const res = createResponse();

    const allowed = await enforceRateLimit(res, options);

    expect(allowed).toBe(false);
    expect(res.statusCode).toBe(429);
    expect(res.headers['retry-after']).toBeGreaterThan(0);
  });

  it('sets the remaining-requests header when allowed', async () => {
    RateLimit.findOneAndUpdate.mockResolvedValue({ count: 1 });
    const res = createResponse();

    expect(await enforceRateLimit(res, options)).toBe(true);
    expect(res.headers['x-ratelimit-remaining']).toBe(1);
  });
});
