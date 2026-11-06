/** @jest-environment node */
import { createRequest, createResponse } from '../apiTestUtils';

jest.mock('../../lib/dbConnect', () => jest.fn());
jest.mock('../../lib/rateLimit', () => ({ enforceRateLimit: jest.fn() }));
jest.mock('../../models/User', () => ({
  __esModule: true,
  default: { findOne: jest.fn(), create: jest.fn() },
  EMAIL_COLLATION: { locale: 'en', strength: 2 },
}));

const User = require('../../models/User').default;
const { enforceRateLimit } = require('../../lib/rateLimit');
const handler = require('../../pages/api/auth/register').default;

const validBody = { name: 'Ms Smith', email: ' Teacher@School.EDU ', password: 'correct horse' };

/** findOne(...).collation(...) resolves to `existing`. */
const mockLookup = (existing) => {
  const collation = jest.fn().mockResolvedValue(existing);
  User.findOne.mockReturnValue({ collation });
  return collation;
};

const call = async (body = validBody, method = 'POST') => {
  const res = createResponse();
  await handler(createRequest({ method, body }), res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockLookup(null);
  enforceRateLimit.mockResolvedValue(true);
  User.create.mockImplementation(async (fields) => ({ _id: 'user-1', ...fields }));
});

afterEach(() => {
  console.error.mockRestore();
});

describe('POST /api/auth/register', () => {
  it('rejects other methods with an Allow header', async () => {
    const res = await call(validBody, 'GET');
    expect(res.statusCode).toBe(405);
    expect(res.headers.allow).toBe('POST');
  });

  it('creates the account with a lower-cased email, looked up case-insensitively', async () => {
    const collation = mockLookup(null);
    const res = await call();

    expect(res.statusCode).toBe(201);
    expect(User.findOne).toHaveBeenCalledWith({ email: 'teacher@school.edu' });
    expect(collation).toHaveBeenCalledWith({ locale: 'en', strength: 2 });
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'teacher@school.edu', role: 'teacher' }));
    expect(res.body.user).not.toHaveProperty('password');
  });

  it.each([
    ['a query operator as the email', { email: { $regex: '^a' } }],
    ['a query operator as the password', { password: { $ne: '' } }],
    ['a missing name', { name: '' }],
  ])('rejects %s before touching the database', async (_, override) => {
    const res = await call({ ...validBody, ...override });
    expect(res.statusCode).toBe(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it.each([
    ['a short password', { password: 'short' }, 'Passwords need at least 8 characters.'],
    ['a password over 72 bytes', { password: 'é'.repeat(37) }, 'Passwords can be up to 72 characters, or fewer with accented letters or emoji.'],
    ['a name with a phone number', { name: 'Call +1 555 0100 now' }, 'Names can use letters, spaces, apostrophes, hyphens and full stops.'],
    ['a long name', { name: 'A'.repeat(61) }, 'Names can be up to 60 characters.'],
    ['an invalid email', { email: 'not-an-email' }, 'Enter a valid email address.'],
  ])('explains %s', async (_, override, message) => {
    const res = await call({ ...validBody, ...override });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(message);
  });

  it("accepts names in other scripts and with apostrophes", async () => {
    const res = await call({ ...validBody, name: "Zoë O'Brien-Nkosi" });
    expect(res.statusCode).toBe(201);
  });

  it('refuses an email that is already registered, in any case', async () => {
    mockLookup({ _id: 'existing' });
    const res = await call();

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('An account with this email already exists.');
    expect(User.create).not.toHaveBeenCalled();
  });

  it('limits sign-ups per IP address', async () => {
    enforceRateLimit.mockImplementation(async (res) => {
      res.status(429).json({ message: 'Too many requests. Please try again later.' });
      return false;
    });
    const res = createResponse();
    await handler({ ...createRequest({ method: 'POST', body: validBody }), headers: { 'x-real-ip': '203.0.113.7' } }, res);

    expect(res.statusCode).toBe(429);
    expect(enforceRateLimit.mock.calls[0][1]).toMatchObject({ scope: 'register', key: '203.0.113.7' });
    expect(User.create).not.toHaveBeenCalled();
  });

  it('gives the same answer when a simultaneous sign-up wins the unique index', async () => {
    User.create.mockRejectedValue(Object.assign(new Error('E11000 duplicate key'), { code: 11000 }));
    const res = await call();

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('An account with this email already exists.');
  });
});
