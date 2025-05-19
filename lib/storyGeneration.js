/**
 * Improved Story Generation Module
 * 
 * Features:
 * - Better sentence structure with varied transitions
 * - Reduced repetition of words like "then"
 * - More natural phrasing
 * - More coherent story flow
 * - Grammatically correct sentences
 */

/**
 * Generate a story using provided sight words
 * @param {Array} words - Sight words to include in the story
 * @param {number} grade - Grade level (0-5)
 * @param {object} options - Additional options
 * @returns {object} - Generated story with title and content
 */
export const generateStory = (words, grade, options = {}) => {
  if (!words || words.length === 0) {
    return { title: "My Story", content: ["Please add some sight words."] };
  }
  
  // Categorize words for better story structure
  const categories = categorizeWords(words);
  
  // Select appropriate template based on available words
  const template = selectTemplate(categories, grade);
  
  // Fill template with words to create story
  const story = fillTemplate(template, categories, words);
  
  // Apply final grammar corrections and improvements
  const enhancedStory = enhanceStory(story, grade);
  
  return enhancedStory;
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
 * Select appropriate template based on available words
 * @param {object} categories - Categorized words
 * @param {number} grade - Grade level (0-5)
 * @returns {object} - Suitable story template
 */
const selectTemplate = (categories, grade) => {
  // Check which types of words we have
  const hasPeople = categories.people.length > 0;
  const hasPlaces = categories.places.length > 0;
  const hasActions = categories.actions.length > 0;
  const hasObjects = categories.objects.length > 0;
  
  // Define templates for different word combinations
  const templates = [];
  
  // Template: School Story
  if (categories.places.some(place => place.toLowerCase() === 'school') || 
      categories.people.some(person => person.toLowerCase() === 'teacher')) {
    templates.push({
      title: "A Day at School",
      sections: [
        { type: "intro", text: "I went to school." },
        { type: "people", text: "My [PERSON] was there." },
        { type: "action", text: "We [ACTION] together." },
        { type: "object", text: "I had a [OBJECT]." },
        { type: "place", text: "The [PLACE] was [DESCRIPTOR]." },
        { type: "feeling", text: "I felt [DESCRIPTOR]." },
        { type: "conclusion", text: "It was a good day." }
      ]
    });
  }
  
  // Template: Playtime Story
  if (categories.actions.some(action => ['play', 'jump', 'run'].includes(action.toLowerCase()))) {
    templates.push({
      title: "Playtime Fun",
      sections: [
        { type: "intro", text: "I like to play." },
        { type: "people", text: "My [PERSON] plays with me." },
        { type: "action", text: "We [ACTION] at the [PLACE]." },
        { type: "object", text: "We have a [DESCRIPTOR] [OBJECT]." },
        { type: "action", text: "The [OBJECT] helps us [ACTION]." },
        { type: "feeling", text: "We are [DESCRIPTOR]." },
        { type: "conclusion", text: "Playing is fun." }
      ]
    });
  }
  
  // Template: My Friend Story
  if (categories.people.some(person => person.toLowerCase() === 'friend')) {
    templates.push({
      title: "My Friend",
      sections: [
        { type: "intro", text: "I have a [DESCRIPTOR] friend." },
        { type: "people", text: "My friend is a good [PERSON]." },
        { type: "action", text: "We like to [ACTION] together." },
        { type: "place", text: "We go to the [PLACE]." },
        { type: "object", text: "We share our [OBJECT]." },
        { type: "feeling", text: "My friend makes me feel [DESCRIPTOR]." },
        { type: "conclusion", text: "Friends are important." }
      ]
    });
  }
  
  // Template: Animal Story
  if (categories.objects.some(obj => ['dog', 'cat', 'pet'].includes(obj.toLowerCase()))) {
    templates.push({
      title: "My Pet",
      sections: [
        { type: "intro", text: "I have a pet [OBJECT]." },
        { type: "descriptor", text: "My [OBJECT] is [DESCRIPTOR]." },
        { type: "action", text: "It likes to [ACTION]." },
        { type: "place", text: "We go to the [PLACE] together." },
        { type: "people", text: "My [PERSON] likes my pet too." },
        { type: "action", text: "We [ACTION] with my pet." },
        { type: "conclusion", text: "I love my pet." }
      ]
    });
  }
  
  // Default template for any words
  templates.push({
    title: "My Story",
    sections: [
      { type: "intro", text: "This is my story." },
      { type: "descriptor", text: "It is a [DESCRIPTOR] day." },
      { type: "people", text: "I see a [PERSON]." },
      { type: "action", text: "We [ACTION] together." },
      { type: "place", text: "We are at the [PLACE]." },
      { type: "object", text: "There is a [OBJECT]." },
      { type: "conclusion", text: "We had fun." }
    ]
  });
  
  // Choose the most appropriate template
  // For simplicity, we'll just use the first template that matches, but you could
  // implement a scoring system to find the best match
  return templates[0];
};

/**
 * Fill template with words to create story
 * @param {object} template - Story template
 * @param {object} categories - Categorized words
 * @param {Array} allWords - All sight words to include
 * @returns {object} - Story with title and content
 */
const fillTemplate = (template, categories, allWords) => {
  const title = template.title;
  const content = [];
  const usedWords = new Set();
  
  // Helper function to get a random unused word from a category
  const getRandomWord = (category) => {
    const availableWords = category.filter(word => !usedWords.has(word.toLowerCase()));
    if (availableWords.length > 0) {
      const word = availableWords[Math.floor(Math.random() * availableWords.length)];
      usedWords.add(word.toLowerCase());
      return word;
    }
    // If all words in this category are used, try to get any unused word
    const unusedWords = allWords.filter(word => !usedWords.has(word.toLowerCase()));
    if (unusedWords.length > 0) {
      const word = unusedWords[Math.floor(Math.random() * unusedWords.length)];
      usedWords.add(word.toLowerCase());
      return word;
    }
    // If all words are used, just return one from the requested category
    return category.length > 0 ? category[0] : "thing";
  };
  
  // Process each section in the template
  template.sections.forEach(section => {
    let sentence = section.text;
    
    // Replace placeholders with appropriate words
    if (sentence.includes('[PERSON]') && categories.people.length > 0) {
      sentence = sentence.replace('[PERSON]', getRandomWord(categories.people));
    }
    
    if (sentence.includes('[PLACE]') && categories.places.length > 0) {
      sentence = sentence.replace('[PLACE]', getRandomWord(categories.places));
    }
    
    if (sentence.includes('[ACTION]') && categories.actions.length > 0) {
      sentence = sentence.replace('[ACTION]', getRandomWord(categories.actions));
    }
    
    if (sentence.includes('[DESCRIPTOR]') && categories.descriptors.length > 0) {
      sentence = sentence.replace('[DESCRIPTOR]', getRandomWord(categories.descriptors));
    }
    
    if (sentence.includes('[OBJECT]') && categories.objects.length > 0) {
      sentence = sentence.replace('[OBJECT]', getRandomWord(categories.objects));
    }
    
    // Replace any remaining placeholders with "other" words
    const placeholders = ['[PERSON]', '[PLACE]', '[ACTION]', '[DESCRIPTOR]', '[OBJECT]'];
    placeholders.forEach(placeholder => {
      if (sentence.includes(placeholder)) {
        sentence = sentence.replace(placeholder, getRandomWord(categories.other));
      }
    });
    
    content.push(sentence);
  });
  
  // Check if we've used all words, if not, add some additional sentences
  const unusedWords = allWords.filter(word => !usedWords.has(word.toLowerCase()));
  
  if (unusedWords.length > 0) {
    // Create additional sentences to include unused words
    const extraSentences = createExtraSentences(unusedWords, categories);
    content.push(...extraSentences);
  }
  
  return { title, content };
};

/**
 * Create extra sentences to include unused words
 * @param {Array} unusedWords - Words not yet used in the story
 * @param {object} categories - Word categories
 * @returns {Array} - Additional sentences
 */
const createExtraSentences = (unusedWords, categories) => {
  const sentences = [];
  
  // Simple sentence templates
  const templates = [
    "I see [WORD].",
    "We have [WORD].",
    "[WORD] is fun.",
    "I like [WORD].",
    "The [WORD] is nice.",
    "We go to [WORD]."
  ];
  
  // Create a sentence for each unused word
  unusedWords.forEach(word => {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const sentence = template.replace('[WORD]', word);
    sentences.push(sentence);
  });
  
  return sentences;
};

/**
 * Enhance story with better transitions and grammar
 * @param {object} story - Generated story
 * @param {number} grade - Grade level
 * @returns {object} - Enhanced story
 */
const enhanceStory = (story, grade) => {
  const enhancedContent = [];
  const transitions = [
    "After that", 
    "Next", 
    "Later", 
    "Soon", 
    "Meanwhile",
    "Also",
    "When we finished",
    "During our time",
    "As we continued"
  ];
  
  // Enhance each sentence
  story.content.forEach((sentence, index) => {
    let enhancedSentence = sentence;
    
    // Remove the word "Then" from the beginning of sentences
    if (enhancedSentence.startsWith("Then ")) {
      enhancedSentence = enhancedSentence.replace("Then ", "");
    }
    
    // Add varied transitions for better flow (but not for the first sentence)
    if (index > 0 && index < story.content.length - 1 && Math.random() > 0.7) {
      const transition = transitions[Math.floor(Math.random() * transitions.length)];
      enhancedSentence = `${transition}, ${enhancedSentence.charAt(0).toLowerCase()}${enhancedSentence.slice(1)}`;
    }
    
    // Fix common grammar issues
    enhancedSentence = fixGrammar(enhancedSentence);
    
    enhancedContent.push(enhancedSentence);
  });
  
  // For higher grades, combine some sentences for more complex structure
  if (grade >= 3 && enhancedContent.length > 5) {
    return combineRelatedSentences(story.title, enhancedContent);
  }
  
  return {
    title: story.title,
    content: enhancedContent
  };
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

/**
 * Combine related sentences for more complex structure
 * @param {string} title - Story title
 * @param {Array} sentences - List of sentences
 * @returns {object} - Story with combined sentences
 */
const combineRelatedSentences = (title, sentences) => {
  const combinedSentences = [];
  
  for (let i = 0; i < sentences.length; i++) {
    if (i < sentences.length - 1 && Math.random() > 0.7) {
      // Combine with the next sentence
      const firstSentence = sentences[i].replace(/[.!?]$/, "");
      const secondSentence = sentences[i + 1];
      
      // Choose a connector
      const connectors = ["and", "so", "but", "because"];
      const connector = connectors[Math.floor(Math.random() * connectors.length)];
      
      const combinedSentence = `${firstSentence} ${connector} ${secondSentence.charAt(0).toLowerCase()}${secondSentence.slice(1)}`;
      combinedSentences.push(combinedSentence);
      
      // Skip the next sentence since we combined it
      i++;
    } else {
      combinedSentences.push(sentences[i]);
    }
  }
  
  return {
    title,
    content: combinedSentences
  };
};

export {
  categorizeWords,
  fixGrammar
};