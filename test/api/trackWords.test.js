/** @jest-environment node */
import { createRequest, createResponse } from '../apiTestUtils';

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('../../lib/authOptions', () => ({ authOptions: {} }));
jest.mock('../../lib/dbConnect', () => jest.fn());
jest.mock('../../lib/rateLimit', () => ({ enforceRateLimit: jest.fn() }));
jest.mock('../../models/WordAnalytics', () => ({ findOneAndUpdate: jest.fn() }));

const { getServerSession } = require('next-auth/next');
const { enforceRateLimit } = require('../../lib/rateLimit');
const WordAnalytics = require('../../models/WordAnalytics');
const handler = require('../../pages/api/analytics/trackWords').default;

const call = async (body) => {
  const res = createResponse();
  await handler(createRequest({ method: 'POST', body }), res);
  return res;
};

const countedWords = () => WordAnalytics.findOneAndUpdate.mock.calls.map(([filter]) => filter.word).sort();

beforeEach(() => {
  jest.clearAllMocks();
  getServerSession.mockResolvedValue({ user: { id: 'user-1' } });
  enforceRateLimit.mockResolvedValue(true);
  WordAnalytics.findOneAndUpdate.mockResolvedValue({});
});

describe('POST /api/analytics/trackWords', () => {
  it("counts Dolch words only, so a child's name never reaches the shared dashboard", async () => {
    const res = await call({ words: ['The', 'see', 'Mia', 'dinosaur', 'the'], grade: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(2);
    expect(countedWords()).toEqual(['see', 'the']);
  });

  it('counts by reading level', async () => {
    await call({ words: ['see'], grade: 3 });
    expect(WordAnalytics.findOneAndUpdate.mock.calls[0][1].$inc).toEqual({ count: 1, 'gradeLevel.3': 1 });
  });

  it('is rate limited per user', async () => {
    enforceRateLimit.mockImplementation(async (res) => {
      res.status(429).json({ message: 'Too many requests.' });
      return false;
    });
    const res = await call({ words: ['see'], grade: 1 });

    expect(res.statusCode).toBe(429);
    expect(enforceRateLimit.mock.calls[0][1]).toMatchObject({ scope: 'trackWords', key: 'user-1' });
    expect(WordAnalytics.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it.each([4, '0.$'])('rejects grade %p', async (grade) => {
    const res = await call({ words: ['see'], grade });
    expect(res.statusCode).toBe(400);
  });
});
