/**
 * Fixed storyGeneration.js with proper function ordering
 * Replace the entire file with this content
 */

/**
 * Generate a story using provided sight words
 * @param {Array} words - Sight words to include in the story
 * @param {number} grade - Grade level (0-5)
 * @param {object} options - Additional options
 * @returns {object} - Generated story with title and content
 */
export const generateStory = (words, grade = 1, options = {}) => {
  if (!words || words.length === 0) {
    return { 
      title: "My Story", 
      content: ["Please add some sight words."],
      usedWords: []
    };
  }
  
  // Categorize words for better story structure
  const categories = categorizeWords(words);
  
  // Define a simple template based on available words
  const title = "My Fun Story";
  let content = [];
  const usedWords = [];
  
  try {
    // Create a story based on the words we have
    if (words.length > 0) {
      // Simple templates
      const templates = [
        "I like to play.",
        "My friend is here.",
        "We go to school."
      ];
      
      // Add a template sentence
      content.push(templates[Math.floor(Math.random() * templates.length)]);
      
      // Create simple sentences using each word
      words.forEach(word => {
        const lowerWord = word.toLowerCase();
        let sentence = "";
        
        // Only create a sentence if we haven't used this word yet
        if (!usedWords.includes(lowerWord)) {
          // Add word to used words
          usedWords.push(lowerWord);
          
          // Simple sentence templates based on word categories
          if (categories.people.includes(word)) {
            sentence = `The ${lowerWord} is nice.`;
          } else if (categories.places.includes(word)) {
            sentence = `We go to the ${lowerWord}.`;
          } else if (categories.actions.includes(word)) {
            sentence = `I like to ${lowerWord}.`;
          } else if (categories.descriptors.includes(word)) {
            sentence = `The day is ${lowerWord}.`;
          } else if (categories.objects.includes(word)) {
            sentence = `I have a ${lowerWord}.`;
          } else {
            sentence = `I see the ${lowerWord}.`;
          }
          
          // Add to content
          content.push(sentence);
        }
      });
      
      // Add a conclusion
      content.push("We had a great day!");
    } else {
      // Default content if no words
      content = ["Once upon a time...", "The end."];
    }
    
    // Apply grammar fixes
    content = content.map(sentence => fixGrammar(sentence));
    
    return { title, content, usedWords };
  } catch (error) {
    console.error("Story generation error:", error);
    // Return a basic story if there's an error
    return {
      title: "My Story",
      content: [
        "This is my story.",
        "I like to have fun.",
        "The end."
      ],
      usedWords: words.slice(0, 3).map(w => w.toLowerCase())
    };
  }
};

/**
 * Categorize words for better story structure
 * @param {Array} words - Sight words to categorize
 * @returns {object} - Words organized by category
 */
const categorizeWords = (words) => {
  const categories = {
    people: [],      // e.g., teacher, friend, mom, dad
    places: [],      // e.g., school, park, home
    actions: [],     // e.g., run, jump, play
    descriptors: [], // e.g., big, small, happy
    objects: [],     // e.g., ball, book, toy
    connectors: [],  // e.g., and, but, because
    other: []        // Any other words
  };
  
  const peopleWords = ['teacher', 'friend', 'mom', 'dad', 'boy', 'girl', 'student'];
  const placeWords = ['school', 'park', 'home', 'house', 'classroom', 'playground'];
  const actionWords = ['run', 'jump', 'play', 'read', 'walk', 'look', 'see', 'help', 'like', 'liked'];
  const descriptorWords = ['happy', 'sad', 'big', 'small', 'good', 'bad', 'new', 'old'];
  const objectWords = ['ball', 'book', 'toy', 'car', 'game', 'dog', 'cat'];
  const connectorWords = ['and', 'but', 'because', 'when', 'if', 'then'];
  
  words.forEach(word => {
    const lowerWord = word.toLowerCase();
    
    if (peopleWords.includes(lowerWord)) {
      categories.people.push(word);
    } else if (placeWords.includes(lowerWord)) {
      categories.places.push(word);
    } else if (actionWords.includes(lowerWord)) {
      categories.actions.push(word);
    } else if (descriptorWords.includes(lowerWord)) {
      categories.descriptors.push(word);
    } else if (objectWords.includes(lowerWord)) {
      categories.objects.push(word);
    } else if (connectorWords.includes(lowerWord)) {
      categories.connectors.push(word);
    } else {
      categories.other.push(word);
    }
  });
  
  return categories;
};

/**
 * Fix common grammar issues in sentences
 * @param {string} sentence - Original sentence
 * @returns {string} - Grammatically correct sentence
 */
const fixGrammar = (sentence) => {
  let corrected = sentence;
  
  // Fix "Friend liked" to "My friend liked" or "The friend liked"
  if (/^Friend\s/.test(corrected)) {
    corrected = corrected.replace(/^Friend\s/, "My friend ");
  }
  
  // Fix "Teacher liked" to "The teacher liked"
  if (/^Teacher\s/.test(corrected)) {
    corrected = corrected.replace(/^Teacher\s/, "The teacher ");
  }
  
  // Fix "I has" to "I have"
  corrected = corrected.replace(/\bI has\b/g, "I have");
  
  // Fix "We is" to "We are"
  corrected = corrected.replace(/\bWe is\b/g, "We are");
  
  // Ensure sentences end with proper punctuation
  if (!/[.!?]$/.test(corrected)) {
    corrected += ".";
  }
  
  // Capitalize first letter
  corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
  
  return corrected;
};

// Export additional functions for testing or other uses
export {
  categorizeWords,
  fixGrammar
};