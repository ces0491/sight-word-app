/** @jest-environment node */
/**
 * sendEmail against the real Resend SDK, with RESEND_BASE_URL pointing at a
 * local server, so nothing reaches Resend. This pins down what lib/email.js
 * relies on: the request the SDK makes, and a refusal coming back as `error`.
 */
import http from 'node:http';
import { sendEmail } from '../email';

const config = { apiKey: 're_test_key', from: 'Sight Word Stories <stories@example.com>' };
const mail = { to: 'parent@example.com', subject: 'A story', text: 'Read it', html: '<p>Read it</p>' };

let server;
let requests;
let reply;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      requests.push({ method: req.method, url: req.url, authorization: req.headers.authorization, body: JSON.parse(body) });
      res.writeHead(reply.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(reply.body));
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  process.env.RESEND_BASE_URL = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  delete process.env.RESEND_BASE_URL;
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  requests = [];
});

it('posts the email with the API key as a bearer token', async () => {
  reply = { status: 200, body: { id: 'email-1' } };

  await expect(sendEmail(config, mail)).resolves.toEqual({ id: 'email-1' });
  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({ method: 'POST', url: '/emails', authorization: 'Bearer re_test_key' });
  expect(requests[0].body).toMatchObject({ from: config.from, ...mail });
});

it("throws with Resend's reason when it refuses the email", async () => {
  reply = {
    status: 403,
    body: { statusCode: 403, name: 'validation_error', message: 'The example.com domain is not verified.' },
  };

  await expect(sendEmail(config, mail)).rejects.toThrow('validation_error (403): The example.com domain is not verified.');
});
