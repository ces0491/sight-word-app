/**
 * Size and rate limits, kept in one place so the README can point here.
 */

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

/** Upper bounds on story data accepted by the API. */
export const STORY_LIMITS = {
  maxTitleLength: 120,
  maxSentences: 40,
  maxSentenceLength: 500,
  maxWords: 100,
  maxWordLength: 30,
  maxSceneIdLength: 60,
  /** AI stories put the words into a prompt, so they take fewer of them. */
  maxAiWords: 30,
  maxShareMessageLength: 500,
};

/** Fixed-window rate limits, counted in MongoDB so they hold across serverless instances. */
export const RATE_LIMITS = {
  /** Share emails sent per signed-in user. */
  shareEmail: { limit: 10, windowMs: HOUR_MS },
  /** Word-usage updates per signed-in user; the app sends one per story made. */
  trackWords: { limit: 60, windowMs: HOUR_MS },
  /** Account sign-ups per IP address. */
  register: { limit: 5, windowMs: HOUR_MS },
  /** Sign-in attempts per IP address. */
  signInIp: { limit: 20, windowMs: 15 * MINUTE_MS },
  /**
   * Sign-in attempts per email address, from any IP. Someone who knows an
   * address can use these up and hold its owner off for up to one window.
   */
  signInEmail: { limit: 10, windowMs: 15 * MINUTE_MS },
  /** Account deletion attempts per signed-in user; each one checks the password. */
  deleteAccount: { limit: 5, windowMs: 15 * MINUTE_MS },
};
