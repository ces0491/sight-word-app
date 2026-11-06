// lib/storyGeneration.js

/**
 * Classic stories: picks a child's name and builds the story from scenes and
 * extra sentences (lib/storyComposer.js).
 */

import { composeStory } from './storyComposer.js';
import { findUsedWords, wordKey } from './sightWords.js';

/**
 * Child names to use in stories
 */
const childNames = ['Alex', 'Sam', 'Max', 'Emma', 'Mia', 'Leo', 'Lily', 'Jack', 'Zoe', 'Ben'];

/**
 * Get a random child name
 */
const getChildName = () => {
  return childNames[Math.floor(Math.random() * childNames.length)];
};

const EMPTY_STORY = {
  title: 'My Story',
  content: ['Please add some sight words to create a story.'],
  words: [],
  usedWords: [],
};

/**
 * Generate a complete story using provided sight words
 * @param {Array} words - Sight words to include in the story
 * @param {number} grade - Reading level (0-3). Saved with the story; Classic stories don't change with it
 * @param {object} learningNeeds - Special learning adaptations
 * @returns {object} - Complete story object with title, content and metadata
 */
export const generateStory = (words = [], grade = 1, learningNeeds = {}) => {
  if (!Array.isArray(words)) return EMPTY_STORY;

  // Trim, drop empties and repeats (in any case), keeping the first spelling
  const seen = new Set();
  const cleanWords = [];
  for (const word of words) {
    const trimmed = typeof word === 'string' ? word.trim() : '';
    if (!trimmed || seen.has(wordKey(trimmed))) continue;
    seen.add(wordKey(trimmed));
    cleanWords.push(trimmed);
  }
  if (cleanWords.length === 0) return EMPTY_STORY;

  const composed = composeStory(cleanWords, getChildName());
  // From the finished text, in the grown-up's spelling, so highlights and the word hunt match the page
  const usedWords = findUsedWords(composed.sentences, cleanWords);

  return {
    title: composed.title,
    content: composed.sentences,
    // Scene id per sentence (null for extra sentences), used by the illustrations
    scenes: composed.sentenceScenes,
    words: cleanWords,
    usedWords,
    grade,
    coveragePercent: Math.round((usedWords.length / cleanWords.length) * 100),
    learningNeeds,
  };
};
