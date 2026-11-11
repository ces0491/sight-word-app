/**
 * Schemas for stories coming from places the app doesn't control: the
 * story library in browser storage, share links, and AI story input.
 * `z.object` drops keys it doesn't list, so these also act as field
 * whitelists.
 */

import { z } from 'zod';
import { STORY_LIMITS } from './limits';

export const STORY_FORMATS = ['highlighted', 'bold', 'underlined', 'normal'];

/** Reading level: 0 (Kindergarten) to 3, the span of the Dolch lists. */
export const gradeSchema = z.number().int().min(0).max(3);

/** Flags left out default to false. */
export const learningNeedsSchema = z
  .object({
    adhd: z.boolean(),
    dyslexia: z.boolean(),
    autism: z.boolean(),
    esl: z.boolean(),
    visualProcessing: z.boolean(),
  })
  .partial();

const storyWordSchema = z.string().trim().min(1).max(STORY_LIMITS.maxWordLength);

/** What a story is made of, without the learning needs it's read with. */
const storyContentFields = {
  title: z.string().trim().min(1).max(STORY_LIMITS.maxTitleLength),
  content: z
    .array(z.string().trim().min(1).max(STORY_LIMITS.maxSentenceLength))
    .min(1)
    .max(STORY_LIMITS.maxSentences),
  words: z.array(storyWordSchema).min(1).max(STORY_LIMITS.maxWords),
  // Scene id behind each sentence (null where there isn't one); drives the illustrations
  scenes: z
    .array(z.string().max(STORY_LIMITS.maxSceneIdLength).nullable())
    .max(STORY_LIMITS.maxSentences)
    .default([]),
  format: z.enum(STORY_FORMATS).default('highlighted'),
  includeImages: z.boolean().default(true),
  grade: gradeSchema,
};

/** A story about to be saved to the story library. */
export const newStorySchema = z.object({
  ...storyContentFields,
  learningNeeds: learningNeedsSchema.default({}),
});

/** A story read back from the story library (lib/storyLibrary.js). */
export const savedStorySchema = newStorySchema.extend({
  id: z.string().min(1).max(64),
  createdAt: z.iso.datetime(),
});

/**
 * A story in a share link (lib/shareLink.js). Learning needs are never part
 * of a link: they describe the child.
 */
export const sharedStorySchema = z.object(storyContentFields);

/**
 * A word for an AI story. Letters, with apostrophes or hyphens inside the
 * word only, because the value goes into a prompt.
 */
const aiWordSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(STORY_LIMITS.maxWordLength)
  // Letters in any script, as typed words keep them (lib/sightWords.js), so "café" works too
  .regex(/^\p{L}[\p{L}\p{M}]*(?:['-]\p{L}[\p{L}\p{M}]*)*$/u, 'Words may contain letters, apostrophes and hyphens only');

/** Input to an AI story (lib/aiStory.js), checked in the browser before the prompt is built. */
export const aiStoryRequestSchema = z.object({
  words: z.array(aiWordSchema).min(1).max(STORY_LIMITS.maxAiWords),
  grade: gradeSchema,
  learningNeeds: learningNeedsSchema.default({}),
});
