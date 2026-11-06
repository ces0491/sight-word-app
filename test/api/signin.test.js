/** @jest-environment node */

jest.mock('../../lib/dbConnect', () => jest.fn());
jest.mock('../../lib/rateLimit', () => ({ consumeRateLimit: jest.fn() }));
jest.mock('bcrypt', () => ({ compare: jest.fn() }));
jest.mock('../../models/User', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
  EMAIL_COLLATION: { locale: 'en', strength: 2 },
}));

const bcrypt = require('bcrypt');
const User = require('../../models/User').default;
const { consumeRateLimit } = require('../../lib/rateLimit');
const { authorizeCredentials } = require('../../lib/authOptions');
const { TOO_MANY_SIGN_INS, signInErrorMessage } = require('../../lib/authErrors');

const storedUser = { _id: { toString: () => 'user-1' }, email: 'teacher@school.edu', name: 'Ms Smith', role: 'teacher', password: 'hash' };
const request = { headers: { 'x-real-ip': '203.0.113.7' } };
const credentials = { email: ' Teacher@School.EDU ', password: 'correct horse' };

const allow = (allowed) => ({ allowed, remaining: 0, retryAfterSeconds: 60 });

beforeEach(() => {
  jest.clearAllMocks();
  consumeRateLimit.mockResolvedValue(allow(true));
  User.findOne.mockReturnValue({ collation: jest.fn().mockResolvedValue(storedUser) });
  bcrypt.compare.mockResolvedValue(true);
});

describe('authorizeCredentials', () => {
  it('returns the user for the right password', async () => {
    await expect(authorizeCredentials(credentials, request)).resolves.toEqual({
      id: 'user-1',
      email: 'teacher@school.edu',
      name: 'Ms Smith',
      role: 'teacher',
    });
  });

  it('returns null for a wrong password', async () => {
    bcrypt.compare.mockResolvedValue(false);
    await expect(authorizeCredentials(credentials, request)).resolves.toBeNull();
  });

  it('counts attempts per IP address and per hashed email', async () => {
    await authorizeCredentials(credentials, request);
    const calls = Object.fromEntries(consumeRateLimit.mock.calls.map(([options]) => [options.scope, options.key]));

    expect(calls.signInIp).toBe('203.0.113.7');
    expect(calls.signInEmail).toMatch(/^[0-9a-f]{32}$/);
    expect(calls.signInEmail).not.toContain('teacher');
  });

  it.each(['signInIp', 'signInEmail'])('refuses before checking the password when %s is over its limit', async (scope) => {
    consumeRateLimit.mockImplementation(async (options) => allow(options.scope !== scope));

    await expect(authorizeCredentials(credentials, request)).rejects.toThrow(TOO_MANY_SIGN_INS);
    expect(User.findOne).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('ignores a query object passed as the email', async () => {
    await expect(authorizeCredentials({ email: { $ne: '' }, password: 'x' }, request)).resolves.toBeNull();
    expect(consumeRateLimit).not.toHaveBeenCalled();
  });
});

describe('signInErrorMessage', () => {
  it('explains a rate-limited attempt and keeps other failures vague', () => {
    expect(signInErrorMessage(TOO_MANY_SIGN_INS)).toBe('Too many sign-in attempts. Please wait up to 15 minutes and try again.');
    expect(signInErrorMessage('CredentialsSignin')).toBe('Invalid email or password.');
  });
});
