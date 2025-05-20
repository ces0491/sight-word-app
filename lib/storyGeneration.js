// lib/storyGeneration.js - Complete rewrite

/**
 * Story Generation Utility
 * Creates engaging stories using sight words
 */

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
      usedWords: []
    };
  }

  // Track which words are actually used in the story
  const usedWords = [];
  
  // Create story title based on words
  let title;
  if (words.includes("birthday")) {
    title = "The Birthday Party";
  } else if (words.some(w => ["friend", "friends"].includes(w))) {
    title = "Friends Day Out";
  } else if (words.some(w => ["school", "teacher", "learn"].includes(w))) {
    title = "A Day at School";
  } else if (words.some(w => ["park", "play", "game"].includes(w))) {
    title = "Fun at the Park";
  } else {
    title = "My Adventure Story";
  }

  // Categorize words for better sentence construction
  const wordCategories = categorizeWords(words);
  
  // Determine story complexity based on grade and learning needs
  let complexity = grade;
  if (learningNeeds.dyslexia || learningNeeds.visualProcessing) {
    complexity = Math.max(1, complexity - 1); // Reduce complexity for these needs
  }
  
  // Generate content
  const content = [];
  
  // Introduction
  const introSentences = [
    "Once upon a time, there was a fun day.",
    "One sunny morning, we started our day.",
    "Today was going to be special.",
    "It was a perfect day for an adventure."
  ];
  content.push(introSentences[Math.floor(Math.random() * introSentences.length)]);
  
  // Add sentences using the words
  words.forEach(word => {
    // Convert to lowercase for consistency
    const lowerWord = word.toLowerCase();
    
    // Create appropriate sentence based on word category
    let sentence = "";
    
    if (wordCategories.people.includes(lowerWord)) {
      const templates = [
        `My ${lowerWord} came to visit.`,
        `The ${lowerWord} smiled at me.`,
        `We saw a ${lowerWord} at the park.`
      ];
      sentence = templates[Math.floor(Math.random() * templates.length)];
    }
    else if (wordCategories.places.includes(lowerWord)) {
      const templates = [
        `We went to the ${lowerWord}.`,
        `The ${lowerWord} was very nice.`,
        `I like going to the ${lowerWord}.`
      ];
      sentence = templates[Math.floor(Math.random() * templates.length)];
    }
    else if (wordCategories.actions.includes(lowerWord)) {
      const templates = [
        `We ${lowerWord} together.`,
        `I like to ${lowerWord}.`,
        `They ${lowerWord} all day.`
      ];
      sentence = templates[Math.floor(Math.random() * templates.length)];
    }
    else if (wordCategories.descriptors.includes(lowerWord)) {
      const templates = [
        `It was a ${lowerWord} day.`,
        `The ${randomNoun()} was ${lowerWord}.`,
        `We saw ${lowerWord} things.`
      ];
      sentence = templates[Math.floor(Math.random() * templates.length)];
    }
    else {
      // Generic templates for other words
      const templates = [
        `I saw a ${lowerWord}.`,
        `We have a ${lowerWord}.`,
        `The ${lowerWord} was fun.`,
        `My friend liked the ${lowerWord}.`
      ];
      sentence = templates[Math.floor(Math.random() * templates.length)];
    }
    
    // Add the sentence to content
    content.push(sentence);
    
    // Track that the word was used
    usedWords.push(word);
  });
  
  // Add conclusion
  const conclusionSentences = [
    "We had a great time.",
    "It was a wonderful day.",
    "I hope we can do it again soon.",
    "That was my favorite day."
  ];
  content.push(conclusionSentences[Math.floor(Math.random() * conclusionSentences.length)]);
  
  // Apply final grammar and readability fixes
  const enhancedContent = content.map(sentence => fixGrammar(sentence));
  
  return {
    title,
    content: enhancedContent,
    usedWords
  };
};

/**
 * Categorize words for better story structure
 * @param {Array} words - Sight words to categorize
 * @returns {object} - Words organized by category
 */
const categorizeWords = (words) => {
  const result = {
    people: [],      // e.g., teacher, friend, mom, dad
    places: [],      // e.g., school, park, home
    actions: [],     // e.g., run, jump, play
    descriptors: [], // e.g., big, small, happy
    objects: [],     // e.g., ball, book, toy
    other: []        // Any other words
  };
  
  // Define category word lists
  const peopleWords = ['teacher', 'friend', 'mom', 'dad', 'boy', 'girl', 'man', 'woman', 'student'];
  const placeWords = ['school', 'park', 'home', 'house', 'classroom', 'playground', 'store'];
  const actionWords = ['run', 'jump', 'play', 'read', 'walk', 'go', 'look', 'see', 'help', 'like', 'come'];
  const descriptorWords = ['happy', 'sad', 'big', 'small', 'good', 'bad', 'new', 'old', 'many', 'few'];
  const objectWords = ['ball', 'book', 'toy', 'car', 'game', 'dog', 'cat', 'birthday', 'present'];
  
  // Categorize each word
  words.forEach(word => {
    const lowerWord = word.toLowerCase();
    
    if (peopleWords.includes(lowerWord)) {
      result.people.push(lowerWord);
    } else if (placeWords.includes(lowerWord)) {
      result.places.push(lowerWord);
    } else if (actionWords.includes(lowerWord)) {
      result.actions.push(lowerWord);
    } else if (descriptorWords.includes(lowerWord)) {
      result.descriptors.push(lowerWord);
    } else if (objectWords.includes(lowerWord)) {
      result.objects.push(lowerWord);
    } else {
      result.other.push(lowerWord);
    }
  });
  
  return result;
};

/**
 * Fix common grammar issues in sentences
 * @param {string} sentence - Original sentence
 * @returns {string} - Grammatically correct sentence
 */
const fixGrammar = (sentence) => {
  let corrected = sentence;
  
  // Fix "I has" to "I have"
  corrected = corrected.replace(/\bI has\b/g, "I have");
  
  // Fix "We is" to "We are"
  corrected = corrected.replace(/\bWe is\b/g, "We are");
  
  // Fix "They is" to "They are"  
  corrected = corrected.replace(/\bThey is\b/g, "They are");
  
  // Ensure sentences end with proper punctuation
  if (!/[.!?]$/.test(corrected)) {
    corrected += ".";
  }
  
  // Capitalize first letter
  corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
  
  return corrected;
};

/**
 * Generate a random noun for sentence variety
 * @returns {string} - Random noun
 */
const randomNoun = () => {
  const nouns = ['day', 'house', 'dog', 'cat', 'toy', 'park', 'tree', 'book', 'game', 'car'];
  return nouns[Math.floor(Math.random() * nouns.length)];
};

export default generateStory;