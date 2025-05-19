// lib/grammarCheck.js

/**
 * Enhanced grammar checking module for stories
 * Properly handles articles, subject-verb agreement, and other common issues
 */

// Articles grammar rules
const VOWEL_SOUNDS = ['a', 'e', 'i', 'o', 'u'];
const EXCEPTIONS = {
  'university': false, // starts with vowel but sounds like 'you', so uses 'a'
  'hour': true,       // starts with consonant but sounds like 'our', so uses 'an'
  'honest': true,     // starts with consonant but 'h' is silent, so uses 'an'
  'honor': true,      // starts with consonant but 'h' is silent, so uses 'an'
  'unique': false,    // starts with vowel but sounds like 'you', so uses 'a'
  'one': false,       // starts with vowel but sounds like 'w', so uses 'a'
  'user': false       // starts with vowel but sounds like 'you', so uses 'a'
};

/**
 * Determines whether a word should use 'a' or 'an'
 * @param {string} word - The word following the article
 * @returns {boolean} - True if the word should use 'an', false for 'a'
 */
const shouldUseAn = (word) => {
  if (!word) return false;
  
  // Check for known exceptions first
  const lowercaseWord = word.toLowerCase();
  if (lowercaseWord in EXCEPTIONS) {
    return EXCEPTIONS[lowercaseWord];
  }
  
  // Check first letter
  const firstLetter = lowercaseWord.charAt(0);
  return VOWEL_SOUNDS.includes(firstLetter);
};

/**
 * Fix article usage in a sentence
 * @param {string} sentence - The sentence to check
 * @returns {string} - The corrected sentence
 */
const fixArticles = (sentence) => {
  // Pattern to find "a" or "an" followed by a word
  const aPattern = /\b(a|an)\s+(\w+)\b/gi;
  
  return sentence.replace(aPattern, (match, article, nextWord) => {
    const correctArticle = shouldUseAn(nextWord) ? 'an' : 'a';
    
    // Keep original capitalization
    if (article.charAt(0) === 'A') {
      return `${correctArticle.charAt(0).toUpperCase()}${correctArticle.slice(1)} ${nextWord}`;
    }
    
    return `${correctArticle} ${nextWord}`;
  });
};

/**
 * Fix subject-verb agreement
 * @param {string} sentence - The sentence to check
 * @returns {string} - The corrected sentence
 */
const fixSubjectVerbAgreement = (sentence) => {
  // Common subject-verb agreement errors
  sentence = sentence.replace(/I is\b/g, "I am");
  sentence = sentence.replace(/We is\b/g, "We are");
  sentence = sentence.replace(/They is\b/g, "They are");
  sentence = sentence.replace(/You is\b/g, "You are");
  
  sentence = sentence.replace(/I are\b/g, "I am");
  
  sentence = sentence.replace(/He are\b/g, "He is");
  sentence = sentence.replace(/She are\b/g, "She is");
  sentence = sentence.replace(/It are\b/g, "It is");
  
  sentence = sentence.replace(/I has\b/g, "I have");
  sentence = sentence.replace(/You has\b/g, "You have");
  sentence = sentence.replace(/We has\b/g, "We have");
  sentence = sentence.replace(/They has\b/g, "They have");
  
  sentence = sentence.replace(/He have\b/g, "He has");
  sentence = sentence.replace(/She have\b/g, "She has");
  sentence = sentence.replace(/It have\b/g, "It has");
  
  return sentence;
};

/**
 * Fix punctuation in a sentence
 * @param {string} sentence - The sentence to check
 * @returns {string} - The corrected sentence
 */
const fixPunctuation = (sentence) => {
  // Ensure the sentence ends with proper punctuation
  const trimmed = sentence.trim();
  
  // If it already ends with punctuation, leave it
  if (/[.!?]$/.test(trimmed)) {
    return trimmed;
  }
  
  // Add a period if no punctuation exists
  return trimmed + '.';
};

/**
 * Fix capitalization in a sentence
 * @param {string} sentence - The sentence to check
 * @returns {string} - The corrected sentence
 */
const fixCapitalization = (sentence) => {
  // Capitalize first letter of the sentence
  if (sentence.length === 0) return sentence;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};

/**
 * Comprehensive grammar check for a sentence
 * @param {string} sentence - The sentence to check
 * @returns {string} - The grammatically corrected sentence
 */
const correctGrammar = (sentence) => {
  let corrected = sentence;
  
  // Apply all fixes
  corrected = fixArticles(corrected);
  corrected = fixSubjectVerbAgreement(corrected);
  corrected = fixPunctuation(corrected);
  corrected = fixCapitalization(corrected);
  
  return corrected;
};

/**
 * Apply grammar fixes to array of sentences
 * @param {string[]} sentences - Array of sentences to fix
 * @returns {string[]} - Array of corrected sentences
 */
const correctStoryGrammar = (sentences) => {
  return sentences.map(sentence => correctGrammar(sentence));
};

export {
  correctGrammar,
  correctStoryGrammar,
  fixArticles,
  fixSubjectVerbAgreement,
  fixPunctuation,
  fixCapitalization
};