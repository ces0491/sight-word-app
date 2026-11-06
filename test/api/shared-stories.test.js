/** @jest-environment node */
import { createRequest, createResponse } from '../apiTestUtils';

jest.mock('../../lib/dbConnect', () => jest.fn());
jest.mock('../../models/Story', () => ({ findById: jest.fn() }));

const Story = require('../../models/Story');
const handler = require('../../pages/api/shared-stories/[id]').default;

const STORY_ID = '64b0c0ffee0000000000abcd';
const SHARE_TOKEN = 'a'.repeat(43);

const storedStory = {
  _id: STORY_ID,
  title: 'A Day Out',
  content: ['We went out.'],
  words: ['we'],
  usedWords: ['we'],
  format: 'highlighted',
  includeImages: true,
  grade: 1,
  learningNeeds: {},
  createdAt: new Date('2026-01-01'),
  shareToken: SHARE_TOKEN,
  userId: 'owner-1',
  sharedWith: ['teacher@example.com'],
};

const mockFind = (story) => {
  Story.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(story) });
};

const call = async (query) => {
  const res = createResponse();
  await handler(createRequest({ method: 'GET', query }), res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockFind(storedStory);
});

describe('GET /api/shared-stories/[id]', () => {
  it('returns the story for the matching token', async () => {
    const res = await call({ id: STORY_ID, token: SHARE_TOKEN });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('A Day Out');
  });

  it("does not return the token, owner, recipients or the child's learning needs", async () => {
    const res = await call({ id: STORY_ID, token: SHARE_TOKEN });

    expect(res.body).not.toHaveProperty('shareToken');
    expect(res.body).not.toHaveProperty('userId');
    expect(res.body).not.toHaveProperty('sharedWith');
    expect(res.body).not.toHaveProperty('learningNeeds');
  });

  it.each([
    ['the story id as the token', STORY_ID],
    ['a token containing the id', `${STORY_ID}-123`],
    ['a wrong token of the same length', 'b'.repeat(43)],
    ['an empty token', ''],
  ])('returns 404 for %s', async (_, token) => {
    const res = await call({ id: STORY_ID, token });
    expect(res.statusCode).toBe(404);
  });

  it('returns 404 for a story that was never shared', async () => {
    mockFind({ ...storedStory, shareToken: undefined });
    const res = await call({ id: STORY_ID, token: SHARE_TOKEN });
    expect(res.statusCode).toBe(404);
  });

  it('returns 404 for an invalid id without querying', async () => {
    const res = await call({ id: 'not-an-id', token: SHARE_TOKEN });
    expect(res.statusCode).toBe(404);
    expect(Story.findById).not.toHaveBeenCalled();
  });
});
