/**
 * Where to send someone after signing in: the requested page if it is on
 * this site, otherwise the home page. A plain prefix check isn't enough:
 * URL parsing drops tabs and newlines, so "/\t/evil.example" becomes
 * "//evil.example", another site.
 *
 * @param {unknown} url - The callbackUrl query value
 * @param {string} origin - This site's origin, e.g. window.location.origin
 * @returns {string} A path on this site
 */
export function safeCallbackPath(url, origin) {
  if (typeof url !== 'string' || !url.startsWith('/')) return '/';
  try {
    const target = new URL(url, origin);
    if (target.origin !== origin) return '/';
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return '/';
  }
}
