import { clientIp } from '../clientIp';

describe('clientIp', () => {
  it('uses x-real-ip first', () => {
    expect(clientIp({ 'x-real-ip': '203.0.113.7', 'x-forwarded-for': '198.51.100.1' })).toBe('203.0.113.7');
  });

  it('takes the first address in x-forwarded-for', () => {
    expect(clientIp({ 'x-forwarded-for': '198.51.100.1, 10.0.0.2' })).toBe('198.51.100.1');
  });

  it('falls back to the socket, then to "unknown"', () => {
    expect(clientIp({}, { remoteAddress: '127.0.0.1' })).toBe('127.0.0.1');
    expect(clientIp(undefined)).toBe('unknown');
  });
});
