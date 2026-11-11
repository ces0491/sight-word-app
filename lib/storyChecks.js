/**
 * Checks a story against the story limits (lib/limits.js) before it is
 * saved, so a grown-up gets a reason they can act on instead of "please
 * try again".
 */

import { STORY_LIMITS } from './limits';

/**
 * Tidy a story for saving and say what, if anything, stops it being saved.
 * Blank sentences are dropped and the title and sentences are trimmed.
 *
 * @param {{ title?: string, content?: string[], words?: string[] }} story
 * @returns {{ story: { title: string, content: string[], words: string[] }, problem: string|null }}
 */
export function checkStoryForSave({ title = '', content = [], words = [] }) {
  const tidy = {
    title: title.trim(),
    content: content.map((sentence) => sentence.trim()).filter(Boolean),
    words,
  };
  const { maxTitleLength, maxSentences, maxSentenceLength, maxWords } = STORY_LIMITS;

  const longSentence = tidy.content.findIndex((sentence) => sentence.length > maxSentenceLength);
  const problem = !tidy.title
    ? 'Give the story a title.'
    : tidy.title.length > maxTitleLength
      ? `Titles can be up to ${maxTitleLength} characters.`
      : tidy.content.length === 0
        ? 'Add at least one sentence.'
        : tidy.content.length > maxSentences
          ? `Stories can have up to ${maxSentences} sentences.`
          : longSentence !== -1
            ? `Sentence ${longSentence + 1} is too long. Sentences can be up to ${maxSentenceLength} characters.`
            : tidy.words.length === 0
              ? 'Add at least one sight word.'
              : tidy.words.length > maxWords
                ? `Stories can use up to ${maxWords} sight words.`
                : null;

  return { story: tidy, problem };
}

/**
 * Add words to a list without going over the story word limit.
 * @param {string[]} current - Words already chosen (lower-case)
 * @param {string[]} incoming - Words to add
 * @returns {{ words: string[], skipped: number }} The new list, and how many new words didn't fit
 */
export function addWordsWithinLimit(current, incoming) {
  const words = [...current];
  const known = new Set(current);
  let skipped = 0;
  for (const word of incoming.map((w) => w.toLowerCase())) {
    if (known.has(word)) continue;
    if (words.length >= STORY_LIMITS.maxWords) {
      skipped += 1;
      continue;
    }
    words.push(word);
    known.add(word);
  }
  return { words, skipped };
}
