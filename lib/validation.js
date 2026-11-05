/**
 * Request schemas for the API routes. `z.object` drops keys it doesn't
 * list, so these also act as field whitelists.
 */

import { z } from 'zod';
import { STORY_LIMITS } from './limits';

export const STORY_FORMATS = ['highlighted', 'bold', 'underlined', 'normal'];

export const gradeSchema = z.number().int().min(0).max(5);

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

const storyFields = {
  title: z.string().trim().min(1).max(STORY_LIMITS.maxTitleLength),
  content: z
    .array(z.string().trim().min(1).max(STORY_LIMITS.maxSentenceLength))
    .min(1)
    .max(STORY_LIMITS.maxSentences),
  words: z.array(storyWordSchema).min(1).max(STORY_LIMITS.maxWords),
  // Scene id behind each sentence (null where there isn't one); drives the illustrations
  scenes: z.array(z.string().max(STORY_LIMITS.maxSceneIdLength).nullable()).max(STORY_LIMITS.maxSentences),
  format: z.enum(STORY_FORMATS),
  includeImages: z.boolean(),
  grade: gradeSchema,
  learningNeeds: learningNeedsSchema,
};

/** Body of POST /api/stories. */
export const storyCreateSchema = z.object({
  ...storyFields,
  scenes: storyFields.scenes.default([]),
  format: storyFields.format.default('highlighted'),
  includeImages: storyFields.includeImages.default(true),
  learningNeeds: storyFields.learningNeeds.default({}),
});

/** Body of PUT /api/stories/[id]: any subset of the editable fields. */
export const storyUpdateSchema = z.object(storyFields).partial();

/**
 * A word sent to the AI route. Letters, with apostrophes or hyphens inside
 * the word only, because the value goes into a prompt.
 */
const aiWordSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(STORY_LIMITS.maxWordLength)
  .regex(/^[a-z]+(?:['-][a-z]+)*$/, 'Words may contain letters, apostrophes and hyphens only');

/** Body of POST /api/stories/generate-ai. */
export const aiStoryRequestSchema = z.object({
  words: z.array(aiWordSchema).min(1).max(STORY_LIMITS.maxAiWords),
  grade: gradeSchema,
  learningNeeds: learningNeedsSchema.default({}),
});

/** Body of POST /api/stories/[id]/share. */
export const shareRequestSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  message: z.string().trim().max(STORY_LIMITS.maxShareMessageLength).optional(),
});

/** Body of POST /api/analytics/trackWords. */
export const trackWordsSchema = z.object({
  words: z.array(storyWordSchema).min(1).max(STORY_LIMITS.maxWords),
  grade: gradeSchema,
});
