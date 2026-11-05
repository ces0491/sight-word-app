/** @jest-environment node */
import { createRequest, createResponse } from '../../test/apiTestUtils';

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('../authOptions', () => ({ authOptions: {} }));

const { withApiErrors } = require('../apiHelpers');
const { ConfigError } = require('../errors');

const run = async (handler) => {
  const res = createResponse();
  await withApiErrors(handler)(createRequest({ method: 'POST' }), res);
  return res;
};

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

describe('withApiErrors', () => {
  it('passes a normal response through', async () => {
    const res = await run(async (req, response) => response.status(201).json({ ok: true }));

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ ok: true });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('answers missing configuration with a JSON 503', async () => {
    const res = await run(async () => {
      throw new ConfigError('MONGODB_URI is not set.');
    });

    expect(res.statusCode).toBe(503);
    expect(res.body.code).toBe('SERVICE_NOT_CONFIGURED');
    expect(res.body.message).not.toContain('MONGODB_URI');
  });

  it('answers other errors with a JSON 500 that hides the detail', async () => {
    const res = await run(async () => {
      throw new Error('connection string mongodb://user:secret@host');
    });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ message: 'Internal server error' });
    expect(console.error).toHaveBeenCalled();
  });

  it('does not send a second response after headers are sent', async () => {
    const res = createResponse();
    res.headersSent = true;
    const status = jest.spyOn(res, 'status');

    await withApiErrors(async () => {
      throw new Error('late failure');
    })(createRequest(), res);

    expect(status).not.toHaveBeenCalled();
  });
});
