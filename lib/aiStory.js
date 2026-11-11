/**
 * AI stories, written by Claude with the grown-up's own Anthropic
 * API key. This runs in the browser: the key goes from the browser to
 * Anthropic, and this app's server never receives it.
 */

import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { aiStoryRequestSchema } from './validation';
import { STORY_LIMITS } from './limits';
import { findUsedWords } from './sightWords';

export const AI_STORY_MODEL = 'claude-haiku-4-5-20251001';
export const MAX_OUTPUT_TOKENS = 1024;
const REQUEST_TIMEOUT_MS = 30_000;

const GRADE_LABELS = {
  0: 'Kindergarten (ages 5-6)',
  1: 'Grade 1 (ages 6-7)',
  2: 'Grade 2 (ages 7-8)',
  3: 'Grade 3 (ages 8-9)',
};

const ADAPTATIONS = {
  adhd: 'ADHD: Use short sentences (under 10 words). Use action verbs and keep a fast pace.',
  dyslexia: 'Dyslexia: Use simple, common words. Avoid homophones and irregular spellings. Keep sentences straightforward.',
  autism: 'Autism: Use a predictable story structure. Avoid figurative language, idioms and sarcasm. Be literal and clear.',
  esl: 'ESL: Use simple vocabulary and basic sentence structures. Repeat key words naturally. Avoid slang and cultural references.',
  visualProcessing: 'Visual Processing: Keep sentences short, with one idea per sentence.',
};

/** Shape the model must return (enforced by structured outputs). */
const StoryOutputSchema = z.object({
  title: z.string(),
  sentences: z.array(z.string()),
});

/** Limits checked after parsing, since they are not part of the output schema. */
const StoryOutputLimits = z.object({
  title: z.string().trim().min(1).max(STORY_LIMITS.maxTitleLength),
  sentences: z
    .array(z.string().trim().min(1).max(STORY_LIMITS.maxSentenceLength))
    .min(1)
    .max(STORY_LIMITS.maxSentences),
});

/**
 * Build the prompt. `words` and `grade` have already been validated, so
 * they contain only letters, apostrophes and hyphens, and 0-3.
 */
export function buildPrompt(words, grade, learningNeeds = {}) {
  const adaptations = Object.entries(ADAPTATIONS)
    .filter(([need]) => learningNeeds[need])
    .map(([, text]) => `- ${text}`);

  return `Write a short, engaging story for a child at the ${GRADE_LABELS[grade]} reading level.

The story MUST use ALL of these sight words at least once: ${words.join(', ')}

Requirements:
- The story should be 6-12 sentences long
- Use age-appropriate themes (animals, school, family, adventures, nature)
- Every sight word from the list must appear at least once in the story
- The story should be fun and engaging for a young reader
- Use a clear beginning, middle, and end
- Put each sentence in its own entry of "sentences"${adaptations.length ? `\n\nLearning adaptations:\n${adaptations.join('\n')}` : ''}`;
}

/** A failed AI story, with a message that is safe to show the grown-up. */
export class AiStoryError extends Error {
  constructor(message, code, options) {
    super(message, options);
    this.name = 'AiStoryError';
    this.code = code;
  }
}

const FAILED_MESSAGE = "The AI story didn't work. Please try again.";

/** Turn an SDK error into an AiStoryError. The SDK's own message stays in `cause`. */
function describeApiError(error) {
  const fail = (message, code) => new AiStoryError(message, code, { cause: error });

  if (error instanceof Anthropic.AuthenticationError) {
    return fail("Anthropic didn't accept your API key. Check it under AI stories in Grown-ups.", 'KEY_REJECTED');
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return fail("Your API key doesn't have permission for this. Check its settings in the Anthropic Console.", 'KEY_NOT_PERMITTED');
  }
  if (error instanceof Anthropic.BadRequestError) {
    return fail('Anthropic turned the request down. If your Anthropic account is out of credit, add some in the Anthropic Console.', 'REQUEST_REJECTED');
  }
  if (error instanceof Anthropic.RateLimitError) {
    return fail('Your Anthropic account has reached its rate limit. Please wait a minute and try again.', 'RATE_LIMITED');
  }
  if (error instanceof Anthropic.InternalServerError) {
    return fail('Anthropic is busy. Please try again shortly.', 'BUSY');
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return fail("Couldn't reach Anthropic. Please try again.", 'NETWORK');
  }
  return fail(FAILED_MESSAGE, 'FAILED');
}

/**
 * Write a story around the words with Claude, billed to `apiKey`.
 *
 * @param {object} params
 * @param {string} params.apiKey - The grown-up's Anthropic API key
 * @param {string[]} params.words - Sight words the story must use
 * @param {number} params.grade - Reading level, 0 (Kindergarten) to 3
 * @param {object} [params.learningNeeds] - Adaptations to ask for
 * @returns {Promise<{ title: string, content: string[], usedWords: string[] }>}
 * @throws {AiStoryError}
 */
export async function writeAiStory({ apiKey, words, grade, learningNeeds }) {
  if (!apiKey) {
    throw new AiStoryError('Add your Anthropic API key under AI stories in Grown-ups to use them.', 'NO_KEY');
  }

  const input = aiStoryRequestSchema.safeParse({ words, grade, learningNeeds });
  if (!input.success) {
    throw new AiStoryError(
      `AI stories take up to ${STORY_LIMITS.maxAiWords} words, using letters, apostrophes and hyphens only.`,
      'INVALID_INPUT'
    );
  }

  // The SDK refuses to run in a browser unless told to. Here the key belongs
  // to the person using the browser, which is the case the option exists for.
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, timeout: REQUEST_TIMEOUT_MS });

  let response;
  try {
    response = await client.messages.parse({
      model: AI_STORY_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [{ role: 'user', content: buildPrompt(input.data.words, input.data.grade, input.data.learningNeeds) }],
      output_config: { format: zodOutputFormat(StoryOutputSchema) },
    });
  } catch (error) {
    throw describeApiError(error);
  }

  if (response.stop_reason !== 'end_turn') {
    throw new AiStoryError(FAILED_MESSAGE, 'FAILED', { cause: new Error(`stop_reason: ${response.stop_reason}`) });
  }

  const story = StoryOutputLimits.safeParse(response.parsed_output);
  if (!story.success) {
    throw new AiStoryError(FAILED_MESSAGE, 'FAILED', { cause: story.error });
  }

  const { title, sentences } = story.data;
  return { title, content: sentences, usedWords: findUsedWords(sentences, input.data.words) };
}
