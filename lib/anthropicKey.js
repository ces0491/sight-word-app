/**
 * The grown-up's own Anthropic API key, kept in this browser's localStorage
 * until they remove it. It is read only by lib/aiStory.js, which sends it to
 * Anthropic. Storage can be unavailable (private windows, blocked site
 * data), so each access is guarded.
 */

const STORAGE_KEY = 'sightwords:anthropic-key';

/** Versions with accounts kept one key per account, under this prefix. */
const ACCOUNT_KEY_PREFIX = `${STORAGE_KEY}:`;

/** The key saved in this browser, or null. */
export function loadAnthropicKey() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Save the key. Returns false if the browser wouldn't keep it. */
export function storeAnthropicKey(key) {
  try {
    window.localStorage.setItem(STORAGE_KEY, key);
    return true;
  } catch {
    return false;
  }
}

/** Remove the key from this browser. */
export function forgetAnthropicKey() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing was stored if storage is unavailable
  }
}

/**
 * Remove keys saved under an account by versions with sign-in. Each belonged
 * to one account, and the browser can no longer tell whose it was.
 */
export function forgetAccountKeys() {
  try {
    const stale = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const name = window.localStorage.key(i);
      if (name?.startsWith(ACCOUNT_KEY_PREFIX)) stale.push(name);
    }
    stale.forEach((name) => window.localStorage.removeItem(name));
  } catch {
    // Nothing to remove if storage is unavailable
  }
}

/** The pasted key without surrounding spaces, or null if it is empty or has spaces inside. */
export function cleanAnthropicKey(input) {
  const key = String(input ?? '').trim();
  return key && !/\s/.test(key) ? key : null;
}

/** The last four characters, so a grown-up can tell which key is saved. */
export const anthropicKeyHint = (key) => key.slice(-4);
