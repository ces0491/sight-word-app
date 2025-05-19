// lib/grammarCheck.js

/**
 * Enhanced grammar checking module for stories
 * Properly handles articles, subject-verb agreement, pronoun cases, and more
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
 * Fix missing determiners before nouns as subjects
 * @param {string} sentence - The sentence to check
 * @returns {string} - The corrected sentence
 */
const fixMissingDeterminers = (sentence) => {
  // Common nouns that usually need determiners
  const commonNouns = [
    'friend', 'teacher', 'dog', 'cat', 'boy', 'girl', 'man', 'woman', 
    'car', 'house', 'book', 'school', 'store', 'park', 'ball', 'game'
  ];
  
  // Pattern to find a common noun at the start of a sentence or after a conjunction
  let result = sentence;
  
  // Fix "I and friend" pattern -> "My friend and I"
  const iAndPattern = /\b(I|i)\s+and\s+(\w+)\b/g;
  result = result.replace(iAndPattern, (match, pronoun, noun) => {
    if (commonNouns.includes(noun.toLowerCase())) {
      return `My ${noun.toLowerCase()} and ${pronoun}`;
    }
    // If it's not a common noun, it might be a proper name, so keep the order but fix capitalization
    return `${pronoun} and ${noun.charAt(0).toUpperCase() + noun.slice(1)}`;
  });
  
  // Fix "friend and I" without determiner -> "My friend and I"
  const friendAndIPattern = /\b(friend|teacher|dog|cat|boy|girl|man|woman)\s+and\s+(I|i)\b/gi;
  result = result.replace(friendAndIPattern, (match, noun, pronoun) => {
    return `My ${noun.toLowerCase()} and ${pronoun}`;
  });
  
  // Fix solo "friend" as subject -> "My friend"
  // But only at the beginning of the sentence or after a conjunction
  const soloNounPattern = new RegExp(`(^|\\s|\\.|,|and|but|or)\\s+(${commonNouns.join('|')})\\s+`, 'gi');
  result = result.replace(soloNounPattern, (match, prefix, noun, suffix) => {
    // Skip if preceded by an article or possessive
    const precedingWord = prefix.trim().toLowerCase();
    if (['a', 'an', 'the', 'my', 'your', 'his', 'her', 'our', 'their', 'this', 'that', 'these', 'those'].includes(precedingWord)) {
      return match;
    }
    
    // Add "the" before the noun if it's the start of the sentence
    if (prefix === '' || prefix.endsWith('.')) {
      return `${prefix} The ${noun} `;
    }
    
    // Add "my" if the subject is affiliated with "I" or follows "and"
    if (result.includes(' I ') || precedingWord === 'and') {
      return `${prefix} my ${noun} `;
    }
    
    // Default to "the"
    return `${prefix} the ${noun} `;
  });
  
  return result;
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
 * Fix issues with names and proper nouns
 * @param {string} sentence - The sentence to check
 * @returns {string} - The corrected sentence
 */
const fixProperNouns = (sentence) => {
  // Ensure proper nouns are capitalized
  let result = sentence;
  
  // Common proper nouns that should be capitalized
  const properNouns = [
    "Mason", "Emma", "Noah", "Olivia", "Liam", "Ava", "Ethan", "Sophia", 
    "Lucas", "Isabella", "Jackson", "Mia", "Aiden", "Charlotte", "Elijah", 
    "Amelia", "Grayson", "Harper", "Oliver", "Evelyn", "Jacob", "Abigail", 
    "Carter", "Emily", "James", "Ella", "Jayden", "Scarlett", "Benjamin", "Aria"
  ];
  
  // Capitalize proper nouns
  properNouns.forEach(name => {
    const lowerName = name.toLowerCase();
    const pattern = new RegExp(`\\b${lowerName}\\b`, 'g');
    result = result.replace(pattern, name);
  });
  
  return result;
};

/**
 * Fix naming patterns like "named friend" or "called friend"
 * @param {string} sentence - The sentence to check
 * @returns {string} - The corrected sentence
 */
const fixNamingPatterns = (sentence) => {
  let result = sentence;
  
  // Define naming phrases
  const namingPhrases = [
    'named',
    'called',
    'whose name is',
    'with the name'
  ];
  
  // Common nouns that could be incorrectly used as names
  const commonNouns = [
    'friend', 'teacher', 'dog', 'cat', 'boy', 'girl', 'man', 'woman', 
    'person', 'student', 'child', 'baby', 'animal', 'pet'
  ];
  
  // Default proper names to use as replacements
  const defaultNames = [
    "Mason", "Emma", "Noah", "Olivia", "Liam", "Ava", "Ethan", "Sophia"
  ];
  
  // Check for patterns like "named friend" and replace with "named Mason"
  namingPhrases.forEach(phrase => {
    commonNouns.forEach(noun => {
      const pattern = new RegExp(`${phrase}\\s+${noun}\\b`, 'gi');
      if (pattern.test(result)) {
        const randomName = defaultNames[Math.floor(Math.random() * defaultNames.length)];
        result = result.replace(pattern, `${phrase} ${randomName}`);
      }
    });
  });
  
  return result;
};

/**
 * Comprehensive grammar check for a sentence
 * @param {string} sentence - The sentence to check
 * @returns {string} - The grammatically corrected sentence
 */
const correctGrammar = (sentence) => {
  let corrected = sentence;
  
  // Apply all fixes in order
  corrected = fixArticles(corrected);
  corrected = fixMissingDeterminers(corrected);
  corrected = fixSubjectVerbAgreement(corrected);
  corrected = fixProperNouns(corrected);
  corrected = fixNamingPatterns(corrected);
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

module.exports = {
  correctGrammar,
  correctStoryGrammar,
  fixArticles,
  fixMissingDeterminers,
  fixSubjectVerbAgreement,
  fixProperNouns,
  fixNamingPatterns,
  fixPunctuation,
  fixCapitalization
};