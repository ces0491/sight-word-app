/**
 * Sight word matching and input normalisation.
 *
 * Shared by the story renderers, the story API routes and the AI generation
 * route so that "which sight words does this story use" has one answer.
 */

import { STORY_LIMITS } from './limits';

/**
 * Escape characters that have special meaning in a regular expression.
 * @param {string} value
 * @returns {string}
 */
export const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Lower-case, de-duplicate and drop empty entries.
 * @param {unknown[]} words
 * @returns {string[]}
 */
const uniqueLowercase = (words) => {
  if (!Array.isArray(words)) return [];
  const seen = new Set();
  for (const word of words) {
    if (typeof word !== 'string') continue;
    const trimmed = word.trim().toLowerCase();
    if (trimmed) seen.add(trimmed);
  }
  return [...seen];
};

/**
 * Build one case-insensitive, whole-word pattern for a list of words.
 * Longer words come first so a multi-word entry wins over its parts.
 * @param {unknown[]} words
 * @returns {RegExp|null}
 */
const buildWordPattern = (words) => {
  const unique = uniqueLowercase(words).sort((a, b) => b.length - a.length);
  if (unique.length === 0) return null;
  return new RegExp(`\\b(?:${unique.map(escapeRegex).join('|')})\\b`, 'gi');
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
  const pattern = buildWordPattern(words);
  if (!pattern || !source) return source ? [{ text: source, isMatch: false }] : [];

  const segments = [];
  let lastIndex = 0;
  for (const match of source.matchAll(pattern)) {
    if (match.index > lastIndex) {
      segments.push({ text: source.slice(lastIndex, match.index), isMatch: false });
    }
    segments.push({ text: match[0], isMatch: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < source.length) {
    segments.push({ text: source.slice(lastIndex), isMatch: false });
  }
  return segments;
};

/**
 * Return the words from `words` that appear in at least one sentence,
 * in their original order and spelling.
 * @param {string[]} sentences
 * @param {string[]} words
 * @returns {string[]}
 */
export const findUsedWords = (sentences, words) => {
  const pattern = buildWordPattern(words);
  if (!pattern) return [];
  const text = Array.isArray(sentences) ? sentences.filter((s) => typeof s === 'string').join(' ') : '';
  const present = new Set((text.match(pattern) ?? []).map((w) => w.toLowerCase()));
  const seen = new Set();
  return words.filter((word) => {
    if (typeof word !== 'string') return false;
    const key = word.trim().toLowerCase();
    if (!present.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Turn free text (typed or uploaded) into a list of candidate sight words:
 * split on whitespace and commas, lower-case, keep letters, apostrophes and
 * hyphens, and drop anything longer than the word length limit.
 * @param {string} text
 * @returns {string[]}
 */
export const normalizeWordInput = (text) => {
  if (typeof text !== 'string') return [];
  return text
    .split(/[\s,;]+/)
    .map((token) => token.toLowerCase().replace(/[^a-z'-]/g, '').replace(/^['-]+|['-]+$/g, ''))
    .filter((word) => word.length > 0 && word.length <= STORY_LIMITS.maxWordLength);
};
