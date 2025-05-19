// lib/storyGeneration.js
/**
 * Enhanced Story Generator Module for the Sight Word Story Generator
 * This module improves story coherence, provides varied templates, and adjusts
 * complexity based on grade level and learning needs.
 */

// Comprehensive list of common sight words by grade
const sightWordsByGrade = {
  0: [ // Kindergarten
    "a", "and", "are", "at", "be", "can", "come", "do", "for", "go", "has", "have", "he", "here", 
    "I", "in", "is", "it", "like", "little", "look", "me", "my", "no", "of", "on", "play", "said", 
    "see", "she", "so", "the", "they", "this", "to", "up", "was", "we", "with", "yes", "you"
  ],
  1: [ // First Grade (adds to Kindergarten words)
    "about", "all", "am", "an", "as", "away", "back", "big", "blue", "but", "by", "call", "came", 
    "could", "day", "did", "down", "eat", "find", "first", "from", "funny", "get", "good", "had", 
    "her", "him", "his", "how", "if", "into", "jump", "just", "know", "make", "many", "more", 
    "new", "not", "now", "off", "old", "one", "our", "out", "over", "put", "ran", "read", "ride", 
    "run", "saw", "say", "school", "that", "there", "then", "them", "these", "think", "three", 
    "too", "two", "under", "walk", "want", "well", "went", "what", "when", "where", "who", "will", 
    "would", "your"
  ],
  2: [ // Second Grade (adds to previous words)
    "after", "again", "air", "also", "always", "animal", "another", "around", "because", "been", 
    "before", "best", "better", "both", "boy", "bring", "buy", "car", "carry", "change", "city", 
    "clean", "close", "cold", "cut", "does", "done", "door", "draw", "drink", "each", "eight", 
    "every", "fall", "far", "fast", "five", "fly", "four", "full", "gave", "girl", "give", "going", 
    "got", "grow", "help", "hold", "hot", "hurt", "keep", "kind", "laugh", "light", "long", "made", 
    "may", "much", "must", "never", "night", "once", "open", "own", "people", "place", "right", 
    "round", "same", "show", "sing", "sit", "six", "sleep", "small", "sound", "start", "stop", 
    "take", "tell", "ten", "thank", "their", "those", "today", "together", "try", "use", "very", 
    "warm", "wash", "were", "which", "why", "work", "write", "year"
  ],
  3: [ // Third Grade (adds to previous words)
    "address", "answer", "anything", "area", "become", "believe", "body", "decide", "develop", 
    "different", "early", "easy", "either", "else", "enough", "even", "example", "explain", 
    "family", "feel", "few", "field", "figure", "finish", "food", "form", "friend", "game", 
    "group", "happy", "hear", "heard", "high", "house", "idea", "important", "instead", "interest", 
    "knew", "learn", "leave", "level", "listen", "love", "mean", "measure", "money", "morning", 
    "move", "music", "next", "number", "often", "only", "order", "other", "paper", "part", 
    "pattern", "piece", "plant", "point", "question", "ready", "remember", "room", "sentence", 
    "set", "should", "side", "since", "something", "sometimes", "soon", "story", "student", 
    "system", "talk", "told", "turn", "understand", "until", "water", "way", "week", "while", 
    "without", "word", "world", "young"
  ],
  4: [ // Fourth Grade (adds to previous words)
    "actually", "addition", "although", "among", "appear", "approach", "attention", "beautiful", 
    "beginning", "between", "board", "building", "business", "certain", "chapter", "community", 
    "complete", "contain", "continue", "course", "describe", "direction", "discover", "enough", 
    "entire", "environment", "especially", "experience", "fact", "favorite", "finally", "follow", 
    "former", "half", "happen", "heavy", "history", "however", "imagine", "include", "information", 
    "inside", "island", "language", "later", "length", "less", "machine", "material", "minute", 
    "mountain", "natural", "ocean", "paragraph", "perhaps", "personal", "picture", "position", 
    "possible", "power", "present", "pressure", "probably", "problem", "produce", "product", 
    "provide", "purpose", "rather", "real", "reason", "receive", "region", "remain", "result", 
    "return", "several", "simple", "someone", "special", "statement", "stay", "subject", "suppose", 
    "teacher", "thought", "though", "through", "toward", "travel", "trouble", "uncle", "usually", 
    "various", "village", "window", "wonder"
  ],
  5: [ // Fifth Grade (adds to previous words)
    "ability", "according", "achieve", "across", "advance", "already", "ancient", "announce", 
    "argument", "arrange", "atmosphere", "average", "belong", "below", "beneath", "benefit", 
    "beyond", "capable", "capital", "century", "character", "circumstance", "collect", "compare", 
    "concern", "consider", "constant", "continent", "contrast", "contribute", "controversy", 
    "convenience", "cooperation", "correspond", "creature", "current", "damage", "debate", "decision", 
    "definite", "demand", "democracy", "demonstrate", "department", "destroy", "determine", 
    "development", "difference", "difficult", "discussion", "disease", "distance", "educate", 
    "effect", "electrical", "element", "encourage", "essential", "evidence", "examination", 
    "excellent", "existence", "experiment", "explanation", "expression", "familiar", "flight", 
    "frequent", "generation", "gradual", "gravity", "handful", "husband", "identity", "immediate", 
    "immense", "increase", "independent", "influence", "introduce", "investigate", "knowledge", 
    "locate", "magnificent", "majority", "medicine", "member", "mention", "method", "moment", 
    "nature", "necessary", "neighbor", "normal", "observe", "occasion", "opportunity", "organize", 
    "origin", "particular", "passage", "perform", "period", "permanent", "persistent", "physical", 
    "possess", "possible", "potential", "practical", "prepare", "primary", "principle", "process", 
    "progress", "property", "protection", "prove", "public", "quality", "quantity", "range", 
    "recognize", "recommend", "relationship", "release", "remarkable", "require", "research", 
    "respect", "responsible", "science", "search", "section", "separate", "serious", "service", 
    "significant", "similar", "society", "solution", "specific", "standard", "straight", "strategy", 
    "strength", "success", "sudden", "suggest", "supply", "support", "surface", "survive", 
    "technical", "temperature", "territory", "therefore", "tradition", "transfer", "tremendous", 
    "twilight", "valuable", "victory", "weather", "weight", "wonderful"
  ]
};

// Get all sight words up to and including a given grade
const getSightWordsForGrade = (grade) => {
  let allWords = [];
  for (let i = 0; i <= grade; i++) {
    if (sightWordsByGrade[i]) {
      allWords = [...allWords, ...sightWordsByGrade[i]];
    }
  }
  return [...new Set(allWords)]; // Remove duplicates
};

// Categorize parts of speech - this is a simplified version
// In production, you might use a proper NLP library like compromise or nlp.js
const categorizeWord = (word, allSightWords) => {
  word = word.toLowerCase();
  
  // Subjects/Pronouns
  if (['i', 'we', 'you', 'he', 'she', 'they'].includes(word)) {
    return 'SUBJECT';
  }
  
  // Possessive adjectives
  if (['my', 'your', 'his', 'her', 'our', 'their'].includes(word)) {
    return 'POSESSIVE_ADJECTIVE';
  }
  
  // Animals
  if (['dog', 'cat', 'bird', 'fish', 'rabbit', 'pet', 'animal'].includes(word)) {
    return 'ANIMAL';
  }

  // People
  if (['friend', 'teacher', 'mom', 'dad', 'brother', 'sister', 'girl', 'boy', 'man', 'woman', 'child', 'baby', 'person'].includes(word)) {
    return 'PERSON';
  }

  // Places
  if (['school', 'park', 'home', 'house', 'garden', 'beach', 'playground', 'store', 'room', 'kitchen', 'bedroom'].includes(word)) {
    return 'PLACE';
  }

  // Objects
  if (['book', 'ball', 'toy', 'car', 'bike', 'game', 'food', 'water', 'box', 'pencil', 'paper'].includes(word)) {
    return 'OBJECT';
  }

  // Adjectives
  if (['big', 'small', 'happy', 'sad', 'good', 'bad', 'new', 'old', 'pretty', 'funny', 'red', 'blue', 'green', 'yellow', 'fast', 'slow', 'hot', 'cold'].includes(word)) {
    return 'ADJECTIVE';
  }

  // Emotions
  if (['happy', 'sad', 'excited', 'surprised', 'scared', 'angry', 'worried', 'proud'].includes(word)) {
    return 'EMOTION';
  }

  // Actions (verbs)
  if (['run', 'jump', 'play', 'read', 'write', 'eat', 'sleep', 'see', 'look', 'find', 'make', 'help'].includes(word)) {
    return 'ACTION';
  }
  
  // Check if it's a sight word, but we don't know its category
  if (allSightWords.includes(word)) {
    return 'SIGHT_WORD';
  }
  
  // Unknown category
  return 'UNKNOWN';
};

// Enhanced word categorization
const categorizeWords = (words, grade) => {
  const allSightWords = getSightWordsForGrade(grade);
  
  const categories = {
    SUBJECT: [],
    POSESSIVE_ADJECTIVE: [],
    PERSON: [],
    ANIMAL: [],
    PLACE: [],
    OBJECT: [],
    ADJECTIVE: [],
    EMOTION: [],
    ACTION: [],
    SIGHT_WORD: [],
    UNKNOWN: []
  };
  
  words.forEach(word => {
    const category = categorizeWord(word, allSightWords);
    categories[category].push(word);
  });
  
  // Ensure we have defaults for essential categories
  if (categories.SUBJECT.length === 0) {
    categories.SUBJECT.push('I');
  }
  
  if (categories.POSESSIVE_ADJECTIVE.length === 0) {
    // Match subject with possessive adjective
    const subject = categories.SUBJECT[0].toLowerCase();
    if (subject === 'i') categories.POSESSIVE_ADJECTIVE.push('my');
    else if (subject === 'we') categories.POSESSIVE_ADJECTIVE.push('our');
    else if (subject === 'you') categories.POSESSIVE_ADJECTIVE.push('your');
    else if (subject === 'he') categories.POSESSIVE_ADJECTIVE.push('his');
    else if (subject === 'she') categories.POSESSIVE_ADJECTIVE.push('her');
    else if (subject === 'they') categories.POSESSIVE_ADJECTIVE.push('their');
    else categories.POSESSIVE_ADJECTIVE.push('my');
  }
  
  if (categories.PERSON.length === 0) {
    categories.PERSON.push('friend');
  }
  
  if (categories.ANIMAL.length === 0) {
    categories.ANIMAL.push('dog');
  }
  
  if (categories.PLACE.length === 0) {
    categories.PLACE.push('park');
  }
  
  if (categories.OBJECT.length === 0) {
    categories.OBJECT.push('toy');
  }
  
  if (categories.ADJECTIVE.length === 0) {
    categories.ADJECTIVE.push('nice');
  }
  
  if (categories.EMOTION.length === 0) {
    categories.EMOTION.push('happy');
  }
  
  if (categories.ACTION.length === 0) {
    categories.ACTION.push('play');
  }
  
  return categories;
};

// Get a diverse set of story templates
const getStoryTemplates = (grade) => {
  // Simpler templates for kindergarten and 1st grade
  if (grade <= 1) {
    return [
      {
        title: "At the Park",
        sections: [
          "SUBJECT went to the park.",
          "SUBJECT saw a ANIMAL.",
          "The ANIMAL was ADJECTIVE.",
          "SUBJECT played with a OBJECT.",
          "SUBJECT had fun at the park."
        ]
      },
      {
        title: "My Pet",
        sections: [
          "This is POSESSIVE_ADJECTIVE ANIMAL.",
          "POSESSIVE_ADJECTIVE ANIMAL is ADJECTIVE.",
          "POSESSIVE_ADJECTIVE ANIMAL likes to play.",
          "SUBJECT love POSESSIVE_ADJECTIVE ANIMAL."
        ]
      },
      {
        title: "At School",
        sections: [
          "SUBJECT went to school.",
          "SUBJECT saw PERSON.",
          "They read a OBJECT.",
          "It was a ADJECTIVE day."
        ]
      }
    ];
  }
  
  // More complex templates for grades 2-3
  if (grade <= 3) {
    return [
      {
        title: "The Lost Toy",
        sections: [
          "SUBJECT couldn't find POSESSIVE_ADJECTIVE ADJECTIVE OBJECT.",
          "\"Where did it go?\" SUBJECT asked PERSON.",
          "They looked under the bed and inside the PLACE.",
          "The ANIMAL helped them search too.",
          "Finally, SUBJECT found the OBJECT!",
          "\"I'm so EMOTION!\" said SUBJECT with a smile."
        ]
      },
      {
        title: "A Day at the Park",
        sections: [
          "SUBJECT went to the park on a ADJECTIVE day.",
          "At the park, SUBJECT saw a ADJECTIVE ANIMAL playing.",
          "SUBJECT also found a OBJECT near the PLACE.",
          "\"Would you like to play?\" SUBJECT asked PERSON.",
          "They had fun with the OBJECT until it was time to go home.",
          "It was a ADJECTIVE day that SUBJECT will remember."
        ]
      },
      {
        title: "The Surprise",
        sections: [
          "PERSON had a surprise for SUBJECT.",
          "\"Close your eyes,\" said PERSON.",
          "SUBJECT was feeling EMOTION.",
          "The surprise was a ADJECTIVE OBJECT!",
          "SUBJECT and PERSON played with the OBJECT at the PLACE.",
          "The ANIMAL wanted to join them too.",
          "They all had a ADJECTIVE time together."
        ]
      },
      {
        title: "Helping a Friend",
        sections: [
          "PERSON needed help with POSESSIVE_ADJECTIVE OBJECT.",
          "SUBJECT went to the PLACE to help PERSON.",
          "The OBJECT was very ADJECTIVE.",
          "Together, they fixed the OBJECT.",
          "The ANIMAL watched them work.",
          "\"Thank you for helping me,\" said PERSON.",
          "SUBJECT felt EMOTION to help a friend."
        ]
      }
    ];
  }
  
  // Even more complex templates for grades 4-5
  return [
    {
      title: "The Mystery at School",
      sections: [
        "Something ADJECTIVE happened at the PLACE today.",
        "SUBJECT and PERSON discovered a mysterious OBJECT.",
        "\"What do you think it is?\" whispered PERSON.",
        "SUBJECT carefully examined the ADJECTIVE OBJECT.",
        "Even the classroom ANIMAL seemed curious about it.",
        "After some detective work, they learned that the OBJECT belonged to their teacher.",
        "\"We solved the mystery!\" SUBJECT exclaimed, feeling EMOTION.",
        "It was an interesting day that SUBJECT would remember for a long time."
      ]
    },
    {
      title: "The Science Project",
      sections: [
        "SUBJECT needed to create a science project about ANIMAL habitats.",
        "\"Can you help me?\" SUBJECT asked PERSON at the PLACE.",
        "They gathered materials including a ADJECTIVE OBJECT from POSESSIVE_ADJECTIVE collection.",
        "Working together, they built a model of where the ANIMAL lives.",
        "\"This looks really ADJECTIVE,\" said PERSON, admiring their work.",
        "SUBJECT felt EMOTION when the teacher praised their project.",
        "They learned many interesting facts about ANIMAL behavior.",
        "The project earned them the highest grade in the class."
      ]
    },
    {
      title: "The Adventure in the Woods",
      sections: [
        "SUBJECT and PERSON decided to explore the ADJECTIVE woods near the PLACE.",
        "They packed POSESSIVE_ADJECTIVE backpacks with snacks and a OBJECT for emergencies.",
        "\"Do you think we'll see any wildlife?\" PERSON asked excitedly.",
        "As they walked along the trail, they spotted a ADJECTIVE ANIMAL watching them.",
        "The ANIMAL seemed EMOTION to see visitors in its home.",
        "Suddenly, dark clouds appeared overhead and it began to rain.",
        "They used the OBJECT to stay dry as they quickly returned to the PLACE.",
        "\"That was quite an adventure!\" SUBJECT said, feeling EMOTION about their expedition."
      ]
    },
    {
      title: "The Community Garden",
      sections: [
        "The PLACE needed volunteers to help with the community garden.",
        "SUBJECT and PERSON decided to spend their Saturday helping out.",
        "They brought POSESSIVE_ADJECTIVE ADJECTIVE OBJECT to assist with the gardening.",
        "\"This garden will help feed many families,\" explained the garden coordinator.",
        "SUBJECT carefully planted vegetables while PERSON watered the flower beds.",
        "A friendly ANIMAL kept them company throughout the day.",
        "By afternoon, the garden looked ADJECTIVE and full of life.",
        "SUBJECT felt EMOTION knowing they had made a difference in their community."
      ]
    }
  ];
};

// Select appropriate template that can use most of the provided words
const selectAppropriateTemplate = (categorizedWords, templates) => {
  // Calculate score for each template based on how many categories it uses
  const templateScores = templates.map(template => {
    let score = 0;
    const templateText = template.sections.join(' ');
    
    if (templateText.includes('SUBJECT') && categorizedWords.SUBJECT.length > 0) score++;
    if (templateText.includes('POSESSIVE_ADJECTIVE') && categorizedWords.POSESSIVE_ADJECTIVE.length > 0) score++;
    if (templateText.includes('PERSON') && categorizedWords.PERSON.length > 0) score++;
    if (templateText.includes('ANIMAL') && categorizedWords.ANIMAL.length > 0) score++;
    if (templateText.includes('PLACE') && categorizedWords.PLACE.length > 0) score++;
    if (templateText.includes('OBJECT') && categorizedWords.OBJECT.length > 0) score++;
    if (templateText.includes('ADJECTIVE') && categorizedWords.ADJECTIVE.length > 0) score++;
    if (templateText.includes('EMOTION') && categorizedWords.EMOTION.length > 0) score++;
    if (templateText.includes('ACTION') && categorizedWords.ACTION.length > 0) score++;
    
    return { template, score };
  });
  
  // Sort by score (highest first)
  templateScores.sort((a, b) => b.score - a.score);
  
  // Return the highest scoring template
  return templateScores[0].template;
};

// Fill template with appropriate words from categorized list
const fillTemplate = (template, categorizedWords) => {
  let storyTitle = template.title;
  let storySections = [...template.sections];
  
  // Track used words to avoid repetition unless necessary
  const usedWords = {
    SUBJECT: [],
    POSESSIVE_ADJECTIVE: [],
    PERSON: [],
    ANIMAL: [],
    PLACE: [],
    OBJECT: [],
    ADJECTIVE: [],
    EMOTION: [],
    ACTION: []
  };
  
  // Find and replace placeholders with appropriate words
  storySections = storySections.map(section => {
    let filledSection = section;
    
    // Replace all placeholder patterns
    Object.keys(categorizedWords).forEach(category => {
      if (categorizedWords[category].length === 0) return;
      
      // Replace all occurrences of this category placeholder
      while (filledSection.includes(category)) {
        // First try to use a word that hasn't been used yet
        const unusedWords = categorizedWords[category].filter(
          word => !usedWords[category].includes(word)
        );
        
        let selectedWord;
        if (unusedWords.length > 0) {
          // Pick a random unused word
          selectedWord = unusedWords[Math.floor(Math.random() * unusedWords.length)];
        } else {
          // If all words in this category have been used, reuse one
          selectedWord = categorizedWords[category][
            Math.floor(Math.random() * categorizedWords[category].length)
          ];
        }
        
        // Record this word as used
        usedWords[category].push(selectedWord);
        
        // Replace the first occurrence of the placeholder with the selected word
        filledSection = filledSection.replace(category, selectedWord);
        
        // Make grammatical adjustments
        filledSection = correctGrammar(filledSection);
      }
    });
    
    return filledSection;
  });
  
  return { title: storyTitle, content: storySections };
};

// Make grammatical corrections
const correctGrammar = (sentence) => {
  // Fix subject-verb agreement
  sentence = sentence.replace(/I has /g, "I have ");
  sentence = sentence.replace(/I is /g, "I am ");
  sentence = sentence.replace(/We has /g, "We have ");
  sentence = sentence.replace(/We is /g, "We are ");
  sentence = sentence.replace(/They has /g, "They have ");
  sentence = sentence.replace(/They is /g, "They are ");
  sentence = sentence.replace(/You has /g, "You have ");
  sentence = sentence.replace(/You is /g, "You are ");
  
  // Fix article usage
  const vowelRegex = /^[aeiou]/i;
  sentence = sentence.replace(/\ba ([aeiou])/gi, "an $1");
  
  // Capitalize first letter of the sentence
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  
  return sentence;
};

// Adjust story complexity based on grade level
const adjustComplexityForGrade = (story, grade) => {
  // For younger grades, ensure sentences are shorter and simpler
  if (grade <= 1) {
    return {
      ...story,
      content: story.content.map(sentence => {
        // Simplify long sentences by breaking them up
        if (sentence.length > 40 && !sentence.includes('"')) {
          const parts = sentence.split(', ');
          if (parts.length > 1) {
            // Convert some commas to periods to create shorter sentences
            return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('. ');
          }
        }
        return sentence;
      })
    };
  }
  
  // For middle grades, add some transition words
  if (grade <= 3) {
    return story; // Keep as is
  }
  
  // For upper grades, potentially combine some sentences and add more descriptive elements
  if (grade <= 5) {
    return story; // Keep as is for now
  }
  
  return story;
};

// Adjust story for specific learning needs
const adjustForLearningNeeds = (story, learningNeeds) => {
  let adjustedStory = { ...story };
  
  // For ADHD: shorter paragraphs, more direct language
  if (learningNeeds.adhd) {
    adjustedStory.content = adjustedStory.content.map(sentence => {
      // Shorten very long sentences
      if (sentence.length > 60 && !sentence.includes('"')) {
        return sentence.split(', ').map(part => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join('. ');
      }
      return sentence;
    });
  }
  
  // For dyslexia: simpler vocabulary, clearer structure
  if (learningNeeds.dyslexia) {
    // For dyslexia, we mainly rely on CSS adjustments (font, spacing, etc.)
    // But we can also simplify very complex words if needed
  }
  
  // For ESL: more concrete language, clearer concepts
  if (learningNeeds.esl) {
    // Simplify vocabulary for ESL students
  }
  
  return adjustedStory;
};

// Main function to generate a coherent story
export const generateCoherentStory = (words, grade, learningNeeds) => {
  // Step 1: Categorize the provided words
  const categorizedWords = categorizeWords(words, grade);
  
  // Step 2: Get appropriate templates for this grade level
  const templates = getStoryTemplates(grade);
  
  // Step 3: Select the best template based on available words
  const selectedTemplate = selectAppropriateTemplate(categorizedWords, templates);
  
  // Step 4: Fill the template with the categorized words
  let story = fillTemplate(selectedTemplate, categorizedWords);
  
  // Step 5: Adjust complexity based on grade level
  story = adjustComplexityForGrade(story, grade);
  
  // Step 6: Make additional adjustments for specific learning needs
  story = adjustForLearningNeeds(story, learningNeeds);
  
  // Return the final story
  return {
    id: Date.now(),
    title: story.title,
    content: story.content,
    words: [...words],
    usedWords: words.filter(word => 
      story.content.some(sentence => 
        sentence.toLowerCase().includes(word.toLowerCase())
      )
    ),
    timestamp: new Date().toISOString()
  };
};

// Export all functions that might be useful elsewhere
export {
  getSightWordsForGrade,
  categorizeWords,
  getStoryTemplates,
  selectAppropriateTemplate,
  fillTemplate,
  correctGrammar,
  adjustComplexityForGrade,
  adjustForLearningNeeds
};