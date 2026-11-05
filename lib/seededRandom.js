/**
 * Deterministic random numbers, so a story's illustrations come out the
 * same every time it is shown, saved, shared or printed.
 */

/**
 * FNV-1a hash of a string, as an unsigned 32-bit integer.
 * @param {unknown} value
 * @returns {number}
 */
export const hashString = (value) => {
  const text = String(value ?? '');
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

/**
 * A seeded generator (mulberry32) returning numbers in [0, 1).
 * @param {number|string} seed
 * @returns {() => number}
 */
export const createRandom = (seed) => {
  let state = typeof seed === 'number' ? seed >>> 0 : hashString(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Pick one item from a list. */
export const pick = (random, list) => list[Math.floor(random() * list.length)];

/** Return a shuffled copy of a list (Fisher-Yates). */
export const shuffle = (random, list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
