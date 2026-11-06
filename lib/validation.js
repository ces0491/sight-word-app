/**
 * Request schemas for the API routes. `z.object` drops keys it doesn't
 * list, so these also act as field whitelists.
 */

import { z } from 'zod';
import { STORY_LIMITS } from './limits';

export const STORY_FORMATS = ['highlighted', 'bold', 'underlined', 'normal'];

/** Reading level: 0 (Kindergarten) to 3, the span of the Dolch lists. */
export const gradeSchema = z.number().int().min(0).max(3);

const learningNeedsShape = {
  adhd: z.boolean(),
  dyslexia: z.boolean(),
  autism: z.boolean(),
  esl: z.boolean(),
  visualProcessing: z.boolean(),
};

/** On a new story, flags left out default to false. */
export const learningNeedsSchema = z.object(learningNeedsShape).partial();

/** An update replaces the whole object, so it must carry all five flags. */
const fullLearningNeedsSchema = z.object(learningNeedsShape);

/**
 * A person's name, shown to recipients in share emails: letters in any
 * script, with spaces, apostrophes, hyphens and full stops between them.
 */
const personNameSchema = z
  .string('Enter your name.')
  .trim()
  .min(1, 'Enter your name.')
  .max(60, 'Names can be up to 60 characters.')
  .regex(/^\p{L}[\p{L}\p{M}' .-]*$/u, 'Names can use letters, spaces, apostrophes, hyphens and full stops.');

/** bcrypt reads at most 72 bytes of a password and ignores the rest. */
const passwordSchema = z
  .string('Passwords need at least 8 characters.')
  .min(8, 'Passwords need at least 8 characters.')
  .refine(
    (password) => new TextEncoder().encode(password).length <= 72,
    'Passwords can be up to 72 characters, or fewer with accented letters or emoji.'
  );

/** Body of POST /api/auth/register. Emails are stored lower-cased. */
export const registerSchema = z.object({
  name: personNameSchema,
  email: z.string('Enter a valid email address.').trim().toLowerCase().max(254).pipe(z.email('Enter a valid email address.')),
  password: passwordSchema,
});

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

/** Body of DELETE /api/account: the password, asked for again before anything is deleted. */
export const deleteAccountSchema = z.object({
  password: z.string('Enter your password.').min(1, 'Enter your password.'),
});

/** Body of PUT /api/stories/[id]: any subset of the editable fields. */
export const storyUpdateSchema = z.object({ ...storyFields, learningNeeds: fullLearningNeedsSchema }).partial();

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
