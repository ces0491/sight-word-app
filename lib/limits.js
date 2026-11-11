/**
 * Size limits on stories, kept in one place so the README can point here.
 * The editor, the story library and share links all check against them.
 */
export const STORY_LIMITS = {
  maxTitleLength: 120,
  maxSentences: 40,
  maxSentenceLength: 500,
  maxWords: 100,
  maxWordLength: 30,
  maxSceneIdLength: 60,
  /** AI stories put the words into a prompt, so they take fewer of them. */
  maxAiWords: 30,
};
