/**
 * The signed-in grown-up's own Anthropic API key, kept in this browser's
 * localStorage under their account id. It is read only by lib/aiStory.js,
 * which sends it to Anthropic. Storage can be unavailable (private windows,
 * blocked site data), so each access is guarded.
 */

const storageKey = (userId) => `sightwords:anthropic-key:${userId}`;

/** The key saved for this account in this browser, or null. */
export function loadAnthropicKey(userId) {
  if (!userId) return null;
  try {
    return window.localStorage.getItem(storageKey(userId));
  } catch {
    return null;
  }
}

/** Save the key for this account. Returns false if the browser wouldn't keep it. */
export function storeAnthropicKey(userId, key) {
  if (!userId) return false;
  try {
    window.localStorage.setItem(storageKey(userId), key);
    return true;
  } catch {
    return false;
  }
}

/** Remove this account's key from the browser. */
export function forgetAnthropicKey(userId) {
  if (!userId) return;
  try {
    window.localStorage.removeItem(storageKey(userId));
  } catch {
    // Nothing was stored if storage is unavailable
  }
}

/** The pasted key without surrounding spaces, or null if it is empty or has spaces inside. */
export function cleanAnthropicKey(input) {
  const key = String(input ?? '').trim();
  return key && !/\s/.test(key) ? key : null;
}

/** The last four characters, so a grown-up can tell which key is saved. */
export const anthropicKeyHint = (key) => key.slice(-4);
