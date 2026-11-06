/**
 * The client's IP address, for rate limiting requests made before there is
 * an account to count against (registration and sign-in).
 *
 * On Vercel, `x-real-ip` and `x-forwarded-for` hold the client's address and
 * Vercel overwrites whatever the client sent, so they can't be spoofed
 * (https://vercel.com/docs/headers/request-headers). Elsewhere, for instance
 * in local development, the socket address is used.
 *
 * @param {Record<string, string|string[]|undefined>} [headers]
 * @param {{ remoteAddress?: string }} [socket]
 * @returns {string}
 */
export function clientIp(headers = {}, socket = undefined) {
  const first = (value) => (Array.isArray(value) ? value[0] : value);
  const realIp = first(headers['x-real-ip']);
  const forwarded = first(headers['x-forwarded-for']);
  return (
    (typeof realIp === 'string' && realIp.trim()) ||
    (typeof forwarded === 'string' && forwarded.split(',')[0].trim()) ||
    socket?.remoteAddress ||
    'unknown'
  );
}
