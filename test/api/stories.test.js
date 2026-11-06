/** @jest-environment node */
import { createRequest, createResponse } from '../apiTestUtils';

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('../../lib/authOptions', () => ({ authOptions: {} }));
jest.mock('../../lib/dbConnect', () => jest.fn());
jest.mock('../../lib/rateLimit', () => ({ enforceRateLimit: jest.fn() }));
jest.mock('../../models/Story', () => ({ find: jest.fn(), countDocuments: jest.fn(), create: jest.fn() }));

const { getServerSession } = require('next-auth/next');
const { enforceRateLimit } = require('../../lib/rateLimit');
const Story = require('../../models/Story');
const { RATE_LIMITS, STORY_LIMITS } = require('../../lib/limits');
const handler = require('../../pages/api/stories').default;

const USER_ID = 'user-1';
const newStory = {
  title: 'A Day Out',
  content: ['The sun was bright.', 'Mia ran to the park.'],
  words: ['the', 'to'],
  grade: 1,
};

const call = async (method, body) => {
  const res = createResponse();
  await handler(createRequest({ method, body }), res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  getServerSession.mockResolvedValue({ user: { id: USER_ID } });
  enforceRateLimit.mockResolvedValue(true);
  Story.countDocuments.mockResolvedValue(0);
  Story.create.mockImplementation(async (doc) => ({ _id: 'story-1', ...doc }));
});

describe('POST /api/stories', () => {
  it("saves the story under the signed-in user's id, whatever the body says", async () => {
    const res = await call('POST', { ...newStory, userId: 'someone-else' });

    expect(res.statusCode).toBe(201);
    expect(Story.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'A Day Out', userId: USER_ID }));
  });

  it('counts each save against the story write limit', async () => {
    await call('POST', newStory);

    expect(enforceRateLimit).toHaveBeenCalledWith(expect.anything(), {
      scope: 'storyWrite',
      key: USER_ID,
      ...RATE_LIMITS.storyWrite,
    });
  });

  it('saves nothing past the rate limit', async () => {
    enforceRateLimit.mockImplementation(async (res) => {
      res.status(429).json({ message: 'Too many requests. Please try again later.' });
      return false;
    });

    const res = await call('POST', newStory);

    expect(res.statusCode).toBe(429);
    expect(Story.create).not.toHaveBeenCalled();
  });

  it('refuses a new story once the account has the most it can keep', async () => {
    Story.countDocuments.mockResolvedValue(STORY_LIMITS.maxStoriesPerAccount);

    const res = await call('POST', newStory);

    expect(Story.countDocuments).toHaveBeenCalledWith({ userId: USER_ID });
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe('STORY_LIMIT_REACHED');
    expect(res.body.message).toMatch(String(STORY_LIMITS.maxStoriesPerAccount));
    expect(Story.create).not.toHaveBeenCalled();
  });

  it('saves the story that brings the account up to the most it can keep', async () => {
    Story.countDocuments.mockResolvedValue(STORY_LIMITS.maxStoriesPerAccount - 1);

    const res = await call('POST', newStory);

    expect(res.statusCode).toBe(201);
  });

  it("doesn't count an invalid story against the limit", async () => {
    const res = await call('POST', { ...newStory, title: '' });

    expect(res.statusCode).toBe(400);
    expect(enforceRateLimit).not.toHaveBeenCalled();
  });

  it('needs a session', async () => {
    getServerSession.mockResolvedValue(null);

    const res = await call('POST', newStory);

    expect(res.statusCode).toBe(401);
    expect(Story.create).not.toHaveBeenCalled();
  });
});

describe('GET /api/stories', () => {
  it("lists the signed-in user's stories without counting against the write limit", async () => {
    Story.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    const res = await call('GET');

    expect(res.statusCode).toBe(200);
    expect(Story.find).toHaveBeenCalledWith({ userId: USER_ID });
    expect(enforceRateLimit).not.toHaveBeenCalled();
  });
});
