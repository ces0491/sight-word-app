/** @jest-environment node */
import { createRequest, createResponse } from '../apiTestUtils';

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('../../lib/authOptions', () => ({ authOptions: {} }));
jest.mock('../../lib/dbConnect', () => jest.fn());
jest.mock('../../lib/rateLimit', () => ({ enforceRateLimit: jest.fn() }));
jest.mock('bcrypt', () => ({ compare: jest.fn() }));
jest.mock('../../models/User', () => ({ findById: jest.fn(), deleteOne: jest.fn() }));
jest.mock('../../models/Story', () => ({ deleteMany: jest.fn() }));

const bcrypt = require('bcrypt');
const { getServerSession } = require('next-auth/next');
const { enforceRateLimit } = require('../../lib/rateLimit');
const User = require('../../models/User');
const Story = require('../../models/Story');
const handler = require('../../pages/api/account').default;

const USER_ID = 'user-1';
const storedUser = { _id: USER_ID, password: 'hash' };

const call = async (body = { password: 'correct horse' }, method = 'DELETE') => {
  const res = createResponse();
  await handler(createRequest({ method, body }), res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  getServerSession.mockResolvedValue({ user: { id: USER_ID } });
  enforceRateLimit.mockResolvedValue(true);
  User.findById.mockResolvedValue(storedUser);
  bcrypt.compare.mockResolvedValue(true);
  Story.deleteMany.mockResolvedValue({ deletedCount: 3 });
  User.deleteOne.mockResolvedValue({ deletedCount: 1 });
});

afterEach(() => {
  console.error.mockRestore();
});

describe('DELETE /api/account', () => {
  it("deletes the account's stories, then the account", async () => {
    const res = await call();

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true, storiesDeleted: 3 });
    expect(Story.deleteMany).toHaveBeenCalledWith({ userId: USER_ID });
    expect(User.deleteOne).toHaveBeenCalledWith({ _id: USER_ID });
  });

  it('deletes nothing when the password is wrong', async () => {
    bcrypt.compare.mockResolvedValue(false);
    const res = await call();

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("That password isn't right.");
    expect(Story.deleteMany).not.toHaveBeenCalled();
    expect(User.deleteOne).not.toHaveBeenCalled();
  });

  it('asks for the password', async () => {
    const res = await call({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Enter your password.');
  });

  it('needs a session', async () => {
    getServerSession.mockResolvedValue(null);
    const res = await call();
    expect(res.statusCode).toBe(401);
    expect(User.findById).not.toHaveBeenCalled();
  });

  it('is rate limited per account', async () => {
    enforceRateLimit.mockImplementation(async (res) => {
      res.status(429).json({ message: 'Too many requests. Please try again later.' });
      return false;
    });
    const res = await call();

    expect(res.statusCode).toBe(429);
    expect(enforceRateLimit.mock.calls[0][1]).toMatchObject({ scope: 'deleteAccount', key: USER_ID });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('rejects other methods with an Allow header', async () => {
    const res = await call({}, 'POST');
    expect(res.statusCode).toBe(405);
    expect(res.headers.allow).toBe('DELETE');
  });
});
