/**
 * Minimal stand-ins for Next.js API request and response objects.
 */

export function createRequest({ method = 'GET', query = {}, body = {} } = {}) {
  return { method, query, body, headers: {} };
}

export function createResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
    setHeader(name, value) {
      res.headers[name.toLowerCase()] = value;
      return res;
    },
  };
  return res;
}
