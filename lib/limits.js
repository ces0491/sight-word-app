/**
 * Size and rate limits, kept in one place so the README can point here.
 */

const HOUR_MS = 60 * 60 * 1000;

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
};
