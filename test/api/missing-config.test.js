/** @jest-environment node */
// Reproduces a deployment with no MONGODB_URI: the real dbConnect and route
// modules must load, and requests must get JSON answers instead of a crash.
import { createRequest, createResponse } from '../apiTestUtils';

const ORIGINAL_URI = process.env.MONGODB_URI;
let handler;

beforeAll(() => {
  delete process.env.MONGODB_URI;
  global.mongoose = undefined;
  handler = require('../../pages/api/shared-stories/[id]').default;
});

afterAll(() => {
  process.env.MONGODB_URI = ORIGINAL_URI;
});

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

const call = async (query) => {
  const res = createResponse();
  await handler(createRequest({ method: 'GET', query }), res);
  return res;
};

describe('API routes without MONGODB_URI', () => {
  it('still answers requests that fail validation before the database', async () => {
    const res = await call({ id: 'not-an-id', token: 'x' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ message: 'Story not found' });
  });

  it('returns a JSON 503 for requests that need the database', async () => {
    const res = await call({ id: '64b0c0ffee0000000000abcd', token: 'x' });

    expect(res.statusCode).toBe(503);
    expect(res.body.code).toBe('SERVICE_NOT_CONFIGURED');
  });
});
