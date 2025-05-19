// Enhanced grammar.js with improved coherence checks

/**
 * Enhanced grammar checking module with better context awareness
 * Properly handles articles, subject-verb agreement, pronoun cases, and sentence coherence
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
 * Fix cases where determiners are missing before nouns
 * More context-aware to avoid overcorrection
 * @param {string} sentence - The sentence to check
 * @returns {string} - The corrected sentence
 */
const fixMissingDeterminers = (sentence) => {
  // Common nouns that usually need determiners
  const commonNouns = [
    'friend', 'teacher', 'dog', 'cat', 'boy', 'girl', 'man', 'woman', 
    'car', 'house', 'book', 'school', 'store', 'park', 'ball', 'game'
  ];
  
  let result = sentence;
  
  // CRITICAL IMPROVEMENT: Detect and fix problematic "I and X" patterns
  // But do this in a more nuanced way, only when grammatically incorrect
  // "I and name" -> "Name and I"  (proper names)
  // "I and friend" -> "My friend and I" (common nouns)
  
  // Pattern for "I and [noun]" when noun is likely a common noun
  const iAndNounPattern = new RegExp(`\\b(I|i)\\s+and\\s+(${commonNouns.join('|')})\\b`, 'g');
  result = result.replace(iAndNounPattern, (match, pronoun, noun) => {
    return `My ${noun.toLowerCase()} and ${pronoun}`;
  });
  
  // Pattern for "I and [name]" when likely a proper name (capitalized)
  const iAndNamePattern = /\b(I|i)\s+and\s+([A-Z][a-z]+)\b/g;
  result = result.replace(iAndNamePattern, (match, pronoun, name) => {
    return `${name} and ${pronoun}`;
  });
  
  // Fix "friend and I" without determiner -> "My friend and I" but only at start or after certain words
  const friendAndIPattern = new RegExp(`(^|\\.|,|\\sand\\s|\\sbut\\s|\\sor\\s)\\s*(${commonNouns.join('|')})\\s+and\\s+(I|i)\\b`, 'gi');
  result = result.replace(friendAndIPattern, (match, prefix, noun, pronoun) => {
    // If it starts a sentence, capitalize "My"
    if (prefix === '' || prefix.endsWith('.')) {
      return `${prefix} My ${noun.toLowerCase()} and ${pronoun}`;
    }
    return `${prefix} my ${noun.toLowerCase()} and ${pronoun}`;
  });
  
  // Fix common nouns at the start of sentences without determiners
  // But be more careful about which nouns we fix - don't over-correct
  const soloNounStartPattern = new RegExp(`(^|\\.)\\s+(${commonNouns.join('|')})\\s+`, 'gi');
  result = result.replace(soloNounStartPattern, (match, prefix, noun, suffix) => {
    return `${prefix} The ${noun} `;
  });
  
  return result;
};

/**
 * Fix subject-verb agreement with improved context awareness
 * @param {string} sentence - The sentence to check
 * @returns {string} - The corrected sentence
 */
const fixSubjectVerbAgreement = (sentence) => {
  // Extract potential subject and verb to make better decisions
  const subjectVerbMatch = sentence.match(/\b(\w+)\s+(\w+s?)\b/);
  
  let result = sentence;
  
  // Subject-verb agreement for common pronouns and forms of "to be"
  result = result.replace(/\bI is\b/g, "I am");
  result = result.replace(/\bI are\b/g, "I am");
  result = result.replace(/\bI has\b/g, "I have");
  
  result = result.replace(/\bYou is\b/g, "You are");
  result = result.replace(/\bYou has\b/g, "You have");
  
  result = result.replace(/\bWe is\b/g, "We are");
  result = result.replace(/\bWe has\b/g, "We have");
  
  result = result.replace(/\bThey is\b/g, "They are");
  result = result.replace(/\bThey has\b/g, "They have");
  
  result = result.replace(/\bHe are\b/g, "He is");
  result = result.replace(/\bShe are\b/g, "She is");
  result = result.replace(/\bIt are\b/g, "It is");
  
  result = result.replace(/\bHe have\b/g, "He has");
  result = result.replace(/\bShe have\b/g, "She has");
  result = result.replace(/\bIt have\b/g, "It has");
  
  // Fix third person singular present tense
  // This is trickier because we need to know if the subject is 3rd person singular
  // For now, check for common third person singular subjects
  const thirdPersonSingularSubjects = ['he', 'she', 'it', 'the', 'this', 'that'];
  
  // If we have a subject-verb match, check for third person agreement
  if (subjectVerbMatch) {
    const [fullMatch, subject, verb] = subjectVerbMatch;
    const lowerSubject = subject.toLowerCase();
    
    // Check if it's a third person singular subject needing 's' for most verbs
    if (thirdPersonSingularSubjects.includes(lowerSubject) || 
        (lowerSubject !== 'i' && lowerSubject !== 'you' && lowerSubject !== 'we' && lowerSubject !== 'they' && !lowerSubject.endsWith('s'))) {
      
      // Common verbs that should have 's' in third person singular
      const commonVerbs = ['run', 'walk', 'play', 'read', 'write', 'eat', 'sleep', 'go', 'do', 'make', 'take', 'come', 'see', 'know', 'want', 'look', 'use', 'find', 'give', 'tell'];
      
      commonVerbs.forEach(baseVerb => {
        // Only add 's' if the verb is in base form without 's'
        if (verb.toLowerCase() === baseVerb) {
          // Replace the verb with its third person form
          const thirdPersonForm = baseVerb + 's';
          const pattern = new RegExp(`\\b${lowerSubject}\\s+${baseVerb}\\b`, 'i');
          result = result.replace(pattern, `${subject} ${thirdPersonForm}`);
        }
      });
    }
  }
  
  return result;
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
 * Fix pronouns for subject/object cases and possessives
 * @param {string} sentence - The sentence to check
 * @returns {string} - The corrected sentence
 */
const fixPronouns = (sentence) => {
  let result = sentence;
  
  // Fix incorrect pronoun cases
  // Subject pronouns: I, you, he, she, it, we, they
  // Object pronouns: me, you, him, her, it, us, them
  // Possessive pronouns: my, your, his, her, its, our, their
  
  // Fix "Me and..." at the beginning of sentences
  result = result.replace(/\bMe and\b/g, "I and");
  
  // Fix "Me go..." or similar incorrect subject usage
  const subjectVerbs = ['go', 'goes', 'went', 'run', 'runs', 'ran', 'walk', 'walks', 'walked', 'play', 'plays', 'played', 'see', 'sees', 'saw', 'like', 'likes', 'liked', 'have', 'has', 'had'];
  subjectVerbs.forEach(verb => {
    result = result.replace(new RegExp(`\\bMe ${verb}\\b`, 'g'), `I ${verb}`);
  });
  
  // Fix incorrect possessives
  result = result.replace(/\bI book\b/g, "my book");
  result = result.replace(/\bI friend\b/g, "my friend");
  result = result.replace(/\bI home\b/g, "my home");
  
  result = result.replace(/\bYou book\b/g, "your book");
  result = result.replace(/\bYou friend\b/g, "your friend");
  result = result.replace(/\bYou home\b/g, "your home");
  
  result = result.replace(/\bHe book\b/g, "his book");
  result = result.replace(/\bHe friend\b/g, "his friend");
  result = result.replace(/\bHe home\b/g, "his home");
  
  result = result.replace(/\bShe book\b/g, "her book");
  result = result.replace(/\bShe friend\b/g, "her friend");
  result = result.replace(/\bShe home\b/g, "her home");
  
  result = result.replace(/\bWe book\b/g, "our book");
  result = result.replace(/\bWe friend\b/g, "our friend");
  result = result.replace(/\bWe home\b/g, "our home");
  
  result = result.replace(/\bThey book\b/g, "their book");
  result = result.replace(/\bThey friend\b/g, "their friend");
  result = result.replace(/\bThey home\b/g, "their home");
  
  return result;
};

/**
 * Fix tense consistency within a sentence
 * @param {string} sentence - The sentence to check
 * @returns {string} - The corrected sentence
 */
const fixTenseConsistency = (sentence) => {
  // This is a simplified approach - a comprehensive tense checker would be complex
  // We'll look for common mixed tense patterns
  
  let result = sentence;
  
  // Check for past tense followed by present
  const pastTenseIndicators = ['yesterday', 'last week', 'last year', 'ago', 'in the past'];
  const isPastContext = pastTenseIndicators.some(indicator => sentence.toLowerCase().includes(indicator));
  
  if (isPastContext) {
    // Change present tense verbs to past tense in past contexts
    result = result.replace(/\b(go|goes)\b/g, "went");
    result = result.replace(/\b(play|plays)\b/g, "played");
    result = result.replace(/\b(run|runs)\b/g, "ran");
    result = result.replace(/\b(walk|walks)\b/g, "walked");
    result = result.replace(/\b(see|sees)\b/g, "saw");
    result = result.replace(/\b(have|has)\b/g, "had");
    result = result.replace(/\b(do|does)\b/g, "did");
  }
  
  // Check for present tense indicators
  const presentTenseIndicators = ['today', 'now', 'currently', 'this week', 'this year'];
  const isPresentContext = presentTenseIndicators.some(indicator => sentence.toLowerCase().includes(indicator));
  
  if (isPresentContext) {
    // Change past tense to present in present contexts
    // This is more complex and would require verb identification
    // For now, we'll just handle a few common cases
    result = result.replace(/\bwent\b/g, "goes");
    result = result.replace(/\bplayed\b/g, "plays");
    result = result.replace(/\bran\b/g, "runs");
    result = result.replace(/\bwalked\b/g, "walks");
    result = result.replace(/\bsaw\b/g, "sees");
  }
  
  return result;
};

/**
 * Comprehensive grammar check with improved coherence
 * @param {string} sentence - The sentence to check
 * @returns {string} - The grammatically corrected sentence
 */
const correctGrammar = (sentence) => {
  if (!sentence) return '';
  
  let corrected = sentence;
  
  // Apply all fixes in order
  corrected = fixArticles(corrected);
  corrected = fixPronouns(corrected);  // Fix pronouns before determiners
  corrected = fixMissingDeterminers(corrected);
  corrected = fixSubjectVerbAgreement(corrected);
  corrected = fixTenseConsistency(corrected);
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
  if (!sentences || !Array.isArray(sentences)) return [];
  
  // Track state across sentences for better coherence
  let lastSubject = null;
  let usedTransitionWords = {};

  return sentences.map((sentence, index) => {
    // Track sentence context for better corrections
    if (index > 0) {
      // Extract subject from previous sentence if possible
      const subjectMatch = sentences[index - 1].match(/^([A-Z][a-z]+|I)\b/);
      if (subjectMatch) {
        lastSubject = subjectMatch[1];
      }
    }
    
    // Prevent repeated transition words
    if (sentence.startsWith("Then ")) {
      usedTransitionWords["Then"] = (usedTransitionWords["Then"] || 0) + 1;
      
      // If "Then" has been used more than twice, replace it
      if (usedTransitionWords["Then"] > 2) {
        const alternativeTransitions = ["After that", "Next", "Soon", "Later", "Eventually"];
        const newTransition = alternativeTransitions[Math.floor(Math.random() * alternativeTransitions.length)];
        sentence = sentence.replace(/^Then /, `${newTransition} `);
      }
    }

    // Correct grammar with context
    let corrected = correctGrammar(sentence);
    
    // Additional coherence check between sentences
    if (index > 0 && lastSubject) {
      // Check if this sentence starts with a different subject
      // without any transition (but, however, etc.)
      const currentSubjectMatch = corrected.match(/^([A-Z][a-z]+|I)\b/);
      if (currentSubjectMatch && 
          currentSubjectMatch[1] !== lastSubject && 
          !corrected.match(/^(But|However|Then|Next|After|Before|Meanwhile)/)) {
        
        // Add a transition word if needed
        corrected = `Then ${corrected}`;
      }
    }
    
    return corrected;
  });
};

// Export all functions
export {
  correctGrammar,
  correctStoryGrammar,
  fixArticles,
  fixMissingDeterminers,
  fixSubjectVerbAgreement,
  fixProperNouns,
  fixNamingPatterns,
  fixPunctuation,
  fixCapitalization,
  fixPronouns,
  fixTenseConsistency
};