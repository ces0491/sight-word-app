/** @jest-environment node */
import { createRequest, createResponse } from '../apiTestUtils';

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('../../lib/authOptions', () => ({ authOptions: {} }));
jest.mock('../../lib/dbConnect', () => jest.fn());
jest.mock('../../lib/rateLimit', () => ({ enforceRateLimit: jest.fn() }));
jest.mock('../../lib/shareEmail', () => ({
  getSmtpConfig: jest.fn(),
  buildShareEmail: jest.fn(() => ({ subject: 's', text: 't', html: 'h' })),
  sendMail: jest.fn(),
}));
jest.mock('../../models/Story', () => ({ findOne: jest.fn(), findById: jest.fn(), updateOne: jest.fn() }));

const { getServerSession } = require('next-auth/next');
const { enforceRateLimit } = require('../../lib/rateLimit');
const { getSmtpConfig, buildShareEmail, sendMail } = require('../../lib/shareEmail');
const Story = require('../../models/Story');
const handler = require('../../pages/api/stories/[id]/share').default;

const STORY_ID = '64b0c0ffee0000000000abcd';
const OWNER = 'owner-1';

/** findOne(...).select(...) and findById(...).select(...) resolve to these. */
const mockStory = (story, stored = story) => {
  Story.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(story) });
  Story.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(stored) });
};

const call = async (method, body = { email: 'parent@example.com' }) => {
  const res = createResponse();
  await handler(createRequest({ method, query: { id: STORY_ID }, body }), res);
  return res;
};

const sentLink = () => buildShareEmail.mock.calls[0][0].link;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  process.env.NEXTAUTH_URL = 'https://sightwords.example';
  getServerSession.mockResolvedValue({ user: { id: OWNER, name: 'Ms Smith' } });
  getSmtpConfig.mockReturnValue({ host: 'smtp.example' });
  enforceRateLimit.mockResolvedValue(true);
  sendMail.mockResolvedValue(undefined);
  Story.updateOne.mockResolvedValue({ matchedCount: 1 });
});

afterEach(() => {
  console.error.mockRestore();
});

describe('POST /api/stories/[id]/share', () => {
  it("only shares the signed-in user's own story", async () => {
    mockStory(null);
    const res = await call('POST');

    expect(Story.findOne).toHaveBeenCalledWith({ _id: STORY_ID, userId: OWNER });
    expect(res.statusCode).toBe(404);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('reuses an existing token so earlier links keep working', async () => {
    mockStory({ _id: STORY_ID, shareToken: 'existing-token' });
    const res = await call('POST');

    expect(res.statusCode).toBe(200);
    expect(sentLink()).toBe(`https://sightwords.example/shared-stories/${STORY_ID}?token=existing-token`);
    expect(Story.updateOne).not.toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ $set: expect.anything() }));
  });

  it('creates a token only while none is set, then sends the stored one', async () => {
    // Another request stored its token first: this one must send that token, not its own
    mockStory({ _id: STORY_ID }, { _id: STORY_ID, shareToken: 'winner-token' });
    await call('POST');

    expect(Story.updateOne).toHaveBeenCalledWith(
      { _id: STORY_ID, shareToken: null },
      { $set: { shareToken: expect.any(String) } }
    );
    expect(sentLink()).toContain('token=winner-token');
  });

  it('answers 503 when email is not set up', async () => {
    getSmtpConfig.mockReturnValue(null);
    const res = await call('POST');

    expect(res.statusCode).toBe(503);
    expect(res.body.code).toBe('EMAIL_NOT_CONFIGURED');
  });

  it('stops when the share limit is reached', async () => {
    mockStory({ _id: STORY_ID, shareToken: 'existing-token' });
    enforceRateLimit.mockImplementation(async (res) => {
      res.status(429).json({ message: 'Too many requests.' });
      return false;
    });
    const res = await call('POST');

    expect(res.statusCode).toBe(429);
    expect(sendMail).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/stories/[id]/share', () => {
  it('removes the token and the recipient list', async () => {
    const res = await call('DELETE', {});

    expect(res.statusCode).toBe(200);
    expect(Story.updateOne).toHaveBeenCalledWith(
      { _id: STORY_ID, userId: OWNER },
      { $unset: { shareToken: 1 }, $set: { sharedWith: [] } }
    );
  });

  it("answers 404 for a story that isn't the user's", async () => {
    Story.updateOne.mockResolvedValue({ matchedCount: 0 });
    const res = await call('DELETE', {});
    expect(res.statusCode).toBe(404);
  });

  it('works without email settings', async () => {
    getSmtpConfig.mockReturnValue(null);
    const res = await call('DELETE', {});
    expect(res.statusCode).toBe(200);
  });
});

it('rejects other methods with an Allow header', async () => {
  const res = await call('GET');
  expect(res.statusCode).toBe(405);
  expect(res.headers.allow).toBe('POST, DELETE');
});
