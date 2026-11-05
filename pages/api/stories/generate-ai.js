import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import dbConnect from '../../../lib/dbConnect';
import { requireSession, methodNotAllowed, sendValidationError } from '../../../lib/apiHelpers';
import { aiStoryRequestSchema } from '../../../lib/validation';
import { enforceRateLimit } from '../../../lib/rateLimit';
import { RATE_LIMITS, STORY_LIMITS } from '../../../lib/limits';
import { findUsedWords } from '../../../lib/sightWords';

export const AI_STORY_MODEL = 'claude-haiku-4-5-20251001';
const MAX_OUTPUT_TOKENS = 1024;
const REQUEST_TIMEOUT_MS = 30_000;

const GRADE_LABELS = {
  0: 'Kindergarten (ages 5-6)',
  1: 'Grade 1 (ages 6-7)',
  2: 'Grade 2 (ages 7-8)',
  3: 'Grade 3 (ages 8-9)',
  4: 'Grade 4 (ages 9-10)',
  5: 'Grade 5 (ages 10-11)',
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
 * they contain only letters, apostrophes and hyphens, and 0-5.
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

let client;
const getClient = () => {
  client ??= new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    timeout: REQUEST_TIMEOUT_MS,
  });
  return client;
};

/** Map SDK errors to a status and a message that is safe to show the user. */
function describeApiError(error) {
  if (error instanceof Anthropic.RateLimitError || error instanceof Anthropic.InternalServerError) {
    return { status: 503, message: 'The AI service is busy. Please try again shortly.' };
  }
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
    return { status: 503, message: 'AI story generation is not available right now.' };
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return { status: 503, message: 'Could not reach the AI service. Please try again.' };
  }
  return { status: 502, message: 'AI story generation failed. Please try again.' };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ message: 'AI story generation is not configured.' });
  }

  const session = await requireSession(req, res);
  if (!session) return;

  const parsed = aiStoryRequestSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const { words, grade, learningNeeds } = parsed.data;

  await dbConnect();
  const allowed = await enforceRateLimit(res, {
    scope: 'aiStory',
    key: session.user.id,
    ...RATE_LIMITS.aiStory,
  });
  if (!allowed) return;

  let response;
  try {
    response = await getClient().messages.parse({
      model: AI_STORY_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [{ role: 'user', content: buildPrompt(words, grade, learningNeeds) }],
      output_config: { format: zodOutputFormat(StoryOutputSchema) },
    });
  } catch (error) {
    console.error('AI story generation error:', error);
    const { status, message } = describeApiError(error);
    return res.status(status).json({ message });
  }

  if (response.stop_reason !== 'end_turn') {
    console.error('AI story generation stopped early:', response.stop_reason);
    return res.status(502).json({ message: 'AI story generation failed. Please try again.' });
  }

  const story = StoryOutputLimits.safeParse(response.parsed_output);
  if (!story.success) {
    console.error('AI story failed output checks:', story.error.issues);
    return res.status(502).json({ message: 'AI story generation failed. Please try again.' });
  }

  const { title, sentences } = story.data;
  return res.status(200).json({
    title,
    content: sentences,
    usedWords: findUsedWords(sentences, words),
  });
}
