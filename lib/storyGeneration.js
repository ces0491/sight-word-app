// lib/storyGeneration.js

/**
 * Story Generation Utility
 * Uses scene-based composition to create coherent, grammatically correct stories
 * that maximize sight word coverage while maintaining narrative flow.
 */

import { composeStory } from './storyComposer.js';

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

/**
 * Generate a complete story using provided sight words
 * @param {Array} words - Sight words to include in the story
 * @param {number} grade - Grade level (0-5)
 * @param {object} learningNeeds - Special learning adaptations
 * @returns {object} - Complete story object with title, content and metadata
 */
export const generateStory = (words = [], grade = 1, learningNeeds = {}) => {
  // Validate input
  if (!Array.isArray(words) || words.length === 0) {
    return {
      title: "My Story",
      content: ["Please add some sight words to create a story."],
      words: [],
      usedWords: []
    };
  }

  // Clean and normalize input words
  const cleanWords = words
    .map(w => (typeof w === 'string' ? w.trim() : ''))
    .filter(w => w.length > 0);

  if (cleanWords.length === 0) {
    return {
      title: "My Story",
      content: ["Please add some sight words to create a story."],
      words: [],
      usedWords: []
    };
  }

  // Get a random name for the story
  const name = getChildName();

  // Compose the story using scene-based system
  const composed = composeStory(cleanWords, name);

  // Map the original-case words to usedWords for display
  const usedWordsOriginalCase = cleanWords.filter(w =>
    composed.usedWords.includes(w.toLowerCase())
  );

  return {
    title: composed.title,
    content: composed.sentences,
    words: cleanWords,
    usedWords: usedWordsOriginalCase,
    grade,
    coveragePercent: composed.coveragePercent,
    learningNeeds
  };
};

/**
 * Escape special regex characters in a string
 */
export const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default generateStory;
