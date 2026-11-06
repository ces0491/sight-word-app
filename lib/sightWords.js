/**
 * Sight word matching and input normalisation.
 *
 * One tokenizer decides what a word is, for counting the sight words a story
 * uses, for marking them in print and in the reader, and for cleaning typed
 * input, so all of them agree.
 */

import { STORY_LIMITS } from './limits';

/**
 * A word: letters or digits in any script, with apostrophes or hyphens
 * inside it, so "can't", "don’t" and "well-known" are each one word and
 * surrounding quotes and punctuation are not part of it.
 */
const WORD_PATTERN = /[\p{L}\p{M}\p{N}]+(?:['’-][\p{L}\p{M}\p{N}]+)*/gu;

/** The form words are compared in: lower-case, with curly apostrophes made straight. */
export const wordKey = (word) => word.toLowerCase().replace(/[‘’]/g, "'");

/**
 * The words in a piece of text, with their positions.
 * @param {string} text
 * @returns {{ text: string, start: number, end: number, key: string }[]}
 */
export const findWords = (text) =>
  typeof text === 'string'
    ? [...text.matchAll(WORD_PATTERN)].map((match) => ({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        key: wordKey(match[0]),
      }))
    : [];

/**
 * Sight word entries as sequences of word keys, longest first, so a
 * multi-word entry wins over its parts. Entries with no word in them are dropped.
 * @param {unknown[]} words
 * @returns {string[][]}
 */
const toEntries = (words) => {
  if (!Array.isArray(words)) return [];
  const seen = new Set();
  const entries = [];
  for (const word of words) {
    if (typeof word !== 'string') continue;
    const keys = findWords(word).map((w) => w.key);
    const id = keys.join(' ');
    if (keys.length === 0 || seen.has(id)) continue;
    seen.add(id);
    entries.push(keys);
  }
  return entries.sort((a, b) => b.length - a.length);
};

const matchesAt = (tokens, index, entry) => entry.every((key, offset) => tokens[index + offset]?.key === key);

/**
 * Where sight words occur among a sentence's word tokens, without overlaps.
 * @param {{ key: string }[]} tokens - from findWords
 * @param {unknown[]} words - sight words (single words or phrases)
 * @returns {{ first: number, last: number, entry: string }[]} token index ranges
 */
export const matchSightWords = (tokens, words) => {
  const entries = toEntries(words);
  const matches = [];
  for (let i = 0; i < tokens.length; ) {
    const entry = entries.find((candidate) => matchesAt(tokens, i, candidate));
    if (entry) {
      matches.push({ first: i, last: i + entry.length - 1, entry: entry.join(' ') });
      i += entry.length;
    } else {
      i += 1;
    }
  }
  return matches;
};

/**
 * Split text into plain and matching segments, for rendering highlighted
 * sight words as React elements instead of HTML strings.
 * @param {string} text
 * @param {unknown[]} words
 * @returns {{ text: string, isMatch: boolean }[]}
 */
export const splitBySightWords = (text, words) => {
  const source = typeof text === 'string' ? text : '';
  if (!source) return [];

  const tokens = findWords(source);
  const segments = [];
  let lastIndex = 0;
  for (const { first, last } of matchSightWords(tokens, words)) {
    const start = tokens[first].start;
    const end = tokens[last].end;
    if (start > lastIndex) segments.push({ text: source.slice(lastIndex, start), isMatch: false });
    segments.push({ text: source.slice(start, end), isMatch: true });
    lastIndex = end;
  }
  if (lastIndex < source.length) segments.push({ text: source.slice(lastIndex), isMatch: false });
  return segments;
};

/**
 * Return the words from `words` that appear in at least one sentence,
 * in their original order and spelling, each once.
 * @param {string[]} sentences
 * @param {string[]} words
 * @returns {string[]}
 */
export const findUsedWords = (sentences, words) => {
  if (!Array.isArray(sentences) || !Array.isArray(words)) return [];
  const present = new Set();
  for (const sentence of sentences) {
    for (const { entry } of matchSightWords(findWords(sentence), words)) present.add(entry);
  }

  const seen = new Set();
  return words.filter((word) => {
    if (typeof word !== 'string') return false;
    const id = findWords(word).map((w) => w.key).join(' ');
    if (!present.has(id) || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

/**
 * Turn free text (typed or uploaded) into a list of candidate sight words:
 * the words in it, lower-cased, with curly apostrophes made straight, each
 * once. Anything with a digit in it, or longer than the word length limit,
 * is dropped.
 * @param {string} text
 * @returns {string[]}
 */
export const normalizeWordInput = (text) => {
  const keys = findWords(text)
    .map((word) => word.key)
    .filter((key) => !/\p{N}/u.test(key) && key.length <= STORY_LIMITS.maxWordLength);
  return [...new Set(keys)];
};
