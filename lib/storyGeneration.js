// lib/storyGeneration.js

/**
 * Enhanced Story Generator Module for the Sight Word Story Generator
 * This module adds randomness and ensures all sight words are used
 */

// Import any functions we want to keep from the original implementation
import { correctGrammar, correctStoryGrammar } from './grammarCheck';

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
// List of proper names to use for characters
const PROPER_NAMES = [
  "Mason", "Emma", "Noah", "Olivia", "Liam", "Ava", "Ethan", "Sophia", 
  "Lucas", "Isabella", "Jackson", "Mia", "Aiden", "Charlotte", "Elijah", 
  "Amelia", "Grayson", "Harper", "Oliver", "Evelyn", "Jacob", "Abigail", 
  "Carter", "Emily", "James", "Ella", "Jayden", "Scarlett", "Benjamin", "Aria"
];

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
  
  // Is this a proper name?
  if (PROPER_NAMES.map(name => name.toLowerCase()).includes(word)) {
    return 'NAME';
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
    UNKNOWN: [],
    NAME: [] // Add a new category for proper names
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
  
  // Always add "Mason" as a default proper name
  if (categories.NAME.length === 0) {
    const randomIndex = Math.floor(Math.random() * PROPER_NAMES.length);
    categories.NAME.push(PROPER_NAMES[randomIndex]);
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
          "SUBJECT saw NAME.",
          "They read a OBJECT.",
          "It was a ADJECTIVE day."
        ]
      },
      {
        title: "The Playground",
        sections: [
          "SUBJECT went to the playground.",
          "SUBJECT saw a ADJECTIVE OBJECT.",
          "NAME was there too.",
          "They played with the OBJECT together."
        ]
      },
      {
        title: "My Friend",
        sections: [
          "SUBJECT have a friend named NAME.",
          "SUBJECT and NAME like to play.",
          "They saw a ANIMAL at the PLACE.",
          "The ANIMAL was ADJECTIVE."
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
          "\"Where did it go?\" SUBJECT asked NAME.",
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
          "\"Would you like to play?\" SUBJECT asked NAME.",
          "They had fun with the OBJECT until it was time to go home.",
          "It was a ADJECTIVE day that SUBJECT will remember."
        ]
      },
      {
        title: "The Surprise",
        sections: [
          "NAME had a surprise for SUBJECT.",
          "\"Close your eyes,\" said NAME.",
          "SUBJECT was feeling EMOTION.",
          "The surprise was a ADJECTIVE OBJECT!",
          "SUBJECT and NAME played with the OBJECT at the PLACE.",
          "The ANIMAL wanted to join them too.",
          "They all had a ADJECTIVE time together."
        ]
      },
      {
        title: "Helping a Friend",
        sections: [
          "NAME needed help with POSESSIVE_ADJECTIVE OBJECT.",
          "SUBJECT went to the PLACE to help NAME.",
          "The OBJECT was very ADJECTIVE.",
          "Together, they fixed the OBJECT.",
          "The ANIMAL watched them work.",
          "\"Thank you for helping me,\" said NAME.",
          "SUBJECT felt EMOTION to help a friend."
        ]
      },
      {
        title: "The School Trip",
        sections: [
          "SUBJECT's class went on a trip to the PLACE.",
          "NAME sat next to SUBJECT on the bus.",
          "They saw many ADJECTIVE things at the PLACE.",
          "SUBJECT's favorite was the OBJECT.",
          "A friendly ANIMAL was there too.",
          "Everyone felt EMOTION about the trip.",
          "It was the best day at school."
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
        "SUBJECT and NAME discovered a mysterious OBJECT.",
        "\"What do you think it is?\" whispered NAME.",
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
        "\"Can you help me?\" SUBJECT asked NAME at the PLACE.",
        "They gathered materials including a ADJECTIVE OBJECT from POSESSIVE_ADJECTIVE collection.",
        "Working together, they built a model of where the ANIMAL lives.",
        "\"This looks really ADJECTIVE,\" said NAME, admiring their work.",
        "SUBJECT felt EMOTION when the teacher praised their project.",
        "They learned many interesting facts about ANIMAL behavior.",
        "The project earned them the highest grade in the class."
      ]
    },
    {
      title: "The Adventure in the Woods",
      sections: [
        "SUBJECT and NAME decided to explore the ADJECTIVE woods near the PLACE.",
        "They packed POSESSIVE_ADJECTIVE backpacks with snacks and a OBJECT for emergencies.",
        "\"Do you think we'll see any wildlife?\" NAME asked excitedly.",
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
        "SUBJECT and NAME decided to spend their Saturday helping out.",
        "They brought POSESSIVE_ADJECTIVE ADJECTIVE OBJECT to assist with the gardening.",
        "\"This garden will help feed many families,\" explained the garden coordinator.",
        "SUBJECT carefully planted vegetables while NAME watered the flower beds.",
        "A friendly ANIMAL kept them company throughout the day.",
        "By afternoon, the garden looked ADJECTIVE and full of life.",
        "SUBJECT felt EMOTION knowing they had made a difference in their community."
      ]
    },
    {
      title: "The School Play",
      sections: [
        "SUBJECT was chosen to be in the school play at the PLACE.",
        "NAME would play the role of a ADJECTIVE character.",
        "SUBJECT practiced POSESSIVE_ADJECTIVE lines every day with the OBJECT.",
        "\"You're going to do great!\" NAME said encouragingly.",
        "On opening night, SUBJECT felt EMOTION waiting backstage.",
        "The audience clapped as a ANIMAL appeared in the first scene.",
        "When it was SUBJECT's turn, everything went perfectly.",
        "The play was a ADJECTIVE success that everyone enjoyed."
      ]
    }
  ];
};

/**
 * IMPROVED: Select a template with randomization to prevent the same story every time
 * This function now selects randomly from the top-scoring templates
 */
// Enhanced version of selectAppropriateTemplate with improved randomness
const selectAppropriateTemplate = (categorizedWords, templates) => {
  // Calculate score for each template based on how many categories it uses
  const templateScores = templates.map(template => {
    let score = 0;
    const templateText = template.sections.join(' ');
    
    if (templateText.includes('SUBJECT') && categorizedWords.SUBJECT.length > 0) score++;
    if (templateText.includes('POSESSIVE_ADJECTIVE') && categorizedWords.POSESSIVE_ADJECTIVE.length > 0) score++;
    if (templateText.includes('PERSON') && categorizedWords.PERSON.length > 0) score++;
    if (templateText.includes('NAME') && categorizedWords.NAME.length > 0) score += 2; // Higher score for templates with NAME
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
  
  // Instead of only considering the top score, take the top 3 (or available number)
  const topCount = Math.min(3, templateScores.length);
  const topTemplates = templateScores.slice(0, topCount);
  
  // Add some randomness - even if scores are different
  // Use weighted random selection based on scores
  const totalScore = topTemplates.reduce((sum, item) => sum + item.score, 0);
  const random = Math.random() * totalScore;
  
  let cumulativeScore = 0;
  for (const item of topTemplates) {
    cumulativeScore += item.score;
    if (random <= cumulativeScore) {
      return item.template;
    }
  }
  
  // Fallback to a random template from the top templates
  return topTemplates[Math.floor(Math.random() * topTemplates.length)].template;
};

// Enhanced version of fillTemplate with improved grammar handling
const fillTemplate = (template, categorizedWords, originalWords) => {
  let storyTitle = template.title;
  let storySections = [...template.sections];
  
  // Create a map to track which original words have been used
  const wordUsageMap = {};
  originalWords.forEach(word => {
    wordUsageMap[word.toLowerCase()] = false;
  });
  
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
    ACTION: [],
    SIGHT_WORD: [],
    UNKNOWN: [],
    NAME: []
  };
  
  // Store context for better grammar handling
  const sentenceContext = {
    currentSubject: null,
    usedNames: new Set(),
    previousSentenceEnding: null
  };
  
  // Helper function to detect if we need a proper name
  const isProperNameContext = (section, category) => {
    if (category !== 'PERSON') return false;
    
    // Check if the placeholder is in a context that requires a proper name
    const lowerSection = section.toLowerCase();
    return lowerSection.includes('named person') || 
           lowerSection.includes('called person') ||
           lowerSection.includes('says person') || 
           lowerSection.includes('said person') ||
           lowerSection.includes('" person ') ||
           (/ person and /i.test(lowerSection)) ||
           (/^person /i.test(lowerSection)); // Person at start of sentence is likely a name
  };
  
  // Helper function to check grammatical coherence when selecting a word
  const isGrammaticallyCoherent = (category, word, section, placeholder) => {
    // Check if using this word would create a grammatical issue
    const testSection = section.replace(placeholder, word);
    
    // Simple coherence checks
    if (category === 'SUBJECT' && sentenceContext.currentSubject && word !== sentenceContext.currentSubject) {
      // Avoid subject switching in the same sentence
      if (!testSection.includes(',') && !testSection.includes('and')) {
        return false;
      }
    }
    
    // Avoid specific problematic patterns
    if (/ I and /i.test(testSection)) return false;
    if (/^I and /i.test(testSection)) return false;
    
    return true;
  };
  
  // Helper function to select the best word from a category
  const selectBestWord = (category, section, placeholder = category) => {
    // If this is a context that needs a proper name, use NAME instead of PERSON
    if (isProperNameContext(section, category)) {
      category = 'NAME';
      
      // If we don't have names provided by user, use our predefined list
      if (categorizedWords.NAME.length === 0) {
        const PROPER_NAMES = [
          "Mason", "Emma", "Noah", "Olivia", "Liam", "Ava", "Ethan", "Sophia", 
          "Lucas", "Isabella", "Jackson", "Mia", "Aiden", "Charlotte"
        ];
        
        // Choose a name we haven't used yet if possible
        const unusedNames = PROPER_NAMES.filter(name => !sentenceContext.usedNames.has(name));
        if (unusedNames.length > 0) {
          const randomName = unusedNames[Math.floor(Math.random() * unusedNames.length)];
          sentenceContext.usedNames.add(randomName);
          return randomName;
        }
        return PROPER_NAMES[Math.floor(Math.random() * PROPER_NAMES.length)];
      }
    }
    
    const availableWords = categorizedWords[category];
    if (availableWords.length === 0) {
      // Special case for NAME category - always use Mason or another proper name
      if (category === 'NAME') {
        return 'Mason';
      }
      return null;
    }
    
    // Create a list of candidate words with priority scores
    const candidates = availableWords.map(word => {
      let priority = 0;
      
      // Prioritize words that match the original list but haven't been used yet
      if (originalWords.includes(word) && !wordUsageMap[word.toLowerCase()]) {
        priority += 5;
      }
      
      // Prioritize words that haven't been used in this story yet
      if (!usedWords[category].includes(word)) {
        priority += 3;
      }
      
      // Deprioritize words that would create grammar issues
      if (!isGrammaticallyCoherent(category, word, section, placeholder)) {
        priority -= 10;
      }
      
      // Check if the word would be a good fit for sentence coherence
      if (category === 'SUBJECT') {
        if (sentenceContext.currentSubject === word) {
          priority += 2; // Favor subject consistency
        }
      }
      
      return { word, priority };
    });
    
    // Sort by priority (highest first)
    candidates.sort((a, b) => b.priority - a.priority);
    
    // Choose from the top 3 candidates with some randomness
    const topCount = Math.min(3, candidates.length);
    if (topCount === 0) return null;
    
    const selectedCandidate = candidates[Math.floor(Math.random() * topCount)];
    const selectedWord = selectedCandidate.word;
    
    // Update context
    if (category === 'SUBJECT') {
      sentenceContext.currentSubject = selectedWord;
    } else if (category === 'NAME') {
      sentenceContext.usedNames.add(selectedWord);
    }
    
    // If it's from the original list, mark it as used
    if (originalWords.includes(selectedWord)) {
      wordUsageMap[selectedWord.toLowerCase()] = true;
    }
    
    // Record this word as used
    usedWords[category].push(selectedWord);
    
    return selectedWord;
  };
  
  // Find and replace placeholders with appropriate words
  storySections = storySections.map((section, index) => {
    let filledSection = section;
    
    // Reset sentence context for each new section
    if (index > 0) {
      sentenceContext.currentSubject = null;
    }
    
    // Replace all placeholder patterns
    Object.keys(categorizedWords).forEach(category => {
      if (categorizedWords[category].length === 0) return;
      
      // Replace all occurrences of this category placeholder
      while (filledSection.includes(category)) {
        // Select the best word for this position
        const selectedWord = selectBestWord(category, filledSection);
        
        if (!selectedWord) {
          // No word available, skip this replacement
          break;
        }
        
        // Replace the first occurrence of the placeholder with the selected word
        filledSection = filledSection.replace(category, selectedWord);
      }
    });
    
    // Store the sentence ending for context in the next sentence
    sentenceContext.previousSentenceEnding = filledSection.match(/[.!?]$/) 
      ? filledSection.slice(-10) 
      : null;
    
    return filledSection;
  });
  
  // Check if any words weren't used and try to add them to the story
  const unusedWords = originalWords.filter(word => !wordUsageMap[word.toLowerCase()]);
  
  if (unusedWords.length > 0) {
    // Try to add unused words to the story by extending it
    const additionalSentences = [];
    
    // Group unused words in a way that can make coherent sentences
    let remainingWords = [...unusedWords];
    
    while (remainingWords.length > 0) {
      // Take up to 3 words for a sentence
      const wordsForSentence = remainingWords.slice(0, Math.min(3, remainingWords.length));
      remainingWords = remainingWords.slice(wordsForSentence.length);
      
      // Categorize the words
      const wordCategories = wordsForSentence.map(word => {
        const category = Object.keys(categorizedWords).find(cat => 
          categorizedWords[cat].includes(word)
        ) || 'UNKNOWN';
        return { word, category };
      });
      
      // Try to create a sensible sentence
      let sentence = createCoherentSentence(wordCategories, sentenceContext);
      if (sentence) {
        additionalSentences.push(sentence);
        // Mark these words as used
        wordsForSentence.forEach(word => {
          wordUsageMap[word.toLowerCase()] = true;
        });
      }
    }
    
    // Add any additional sentences to the story
    if (additionalSentences.length > 0) {
      storySections = [...storySections, ...additionalSentences];
    }
  }
  
  // Count how many original words were used
  const resultUsedWords = originalWords.filter(word => wordUsageMap[word.toLowerCase()]);
  
  return { 
    title: storyTitle, 
    content: storySections,
    usedWords: resultUsedWords,
    usedWordsCount: usedWords.length
  };
};

// New helper function to create coherent sentences from random words
function createCoherentSentence(wordCategories, context) {
  // Find if we have subjects, verbs, objects
  const subjects = wordCategories.filter(wc => 
    wc.category === 'SUBJECT' || wc.category === 'NAME' || wc.category === 'PERSON'
  );
  
  const actions = wordCategories.filter(wc => wc.category === 'ACTION');
  const objects = wordCategories.filter(wc => 
    wc.category === 'OBJECT' || wc.category === 'ANIMAL'
  );
  const descriptors = wordCategories.filter(wc => 
    wc.category === 'ADJECTIVE' || wc.category === 'EMOTION'
  );
  const places = wordCategories.filter(wc => wc.category === 'PLACE');
  
  // Simple sentence templates
  const templates = [
    // Subject + verb
    { 
      condition: () => subjects.length > 0, 
      create: () => {
        const subject = subjects[0].word;
        let verb = actions.length > 0 ? actions[0].word : "liked";
        
        // Handle grammar for verbs
        if (subject.toLowerCase() === "i") {
          if (verb === "is") verb = "am";
          if (verb.endsWith("s") && !verb.endsWith("ss")) {
            verb = verb.substring(0, verb.length - 1);
          }
        } else if (subject.toLowerCase() !== "you" && subject.toLowerCase() !== "they" && 
                   subject.toLowerCase() !== "we" && !subject.endsWith("s")) {
          if (verb === "am") verb = "is";
          if (!verb.endsWith("s") && !verb.endsWith("ed") && !verb.endsWith("ing")) {
            verb += "s";
          }
        }
        
        return `${subject} ${verb}.`;
      }
    },
    
    // Subject + verb + object
    {
      condition: () => subjects.length > 0 && objects.length > 0,
      create: () => {
        const subject = subjects[0].word;
        const object = objects[0].word;
        let verb = actions.length > 0 ? actions[0].word : "liked";
        
        // Handle grammar for verbs
        if (subject.toLowerCase() === "i") {
          if (verb === "is") verb = "am";
          if (verb.endsWith("s") && !verb.endsWith("ss")) {
            verb = verb.substring(0, verb.length - 1);
          }
        } else if (subject.toLowerCase() !== "you" && subject.toLowerCase() !== "they" && 
                   subject.toLowerCase() !== "we" && !subject.endsWith("s")) {
          if (verb === "am") verb = "is";
          if (!verb.endsWith("s") && !verb.endsWith("ed") && !verb.endsWith("ing")) {
            verb += "s";
          }
        }
        
        // Add article if needed
        let objectPhrase = object;
        if (!["i", "you", "he", "she", "they", "we", "my", "your", "his", "her", "their", "our"].includes(object.toLowerCase())) {
          objectPhrase = `the ${object}`;
        }
        
        return `${subject} ${verb} ${objectPhrase}.`;
      }
    },
    
    // Subject + verb + adjective + object
    {
      condition: () => subjects.length > 0 && objects.length > 0 && descriptors.length > 0,
      create: () => {
        const subject = subjects[0].word;
        const object = objects[0].word;
        const adjective = descriptors[0].word;
        let verb = actions.length > 0 ? actions[0].word : "liked";
        
        // Handle grammar for verbs
        if (subject.toLowerCase() === "i") {
          if (verb === "is") verb = "am";
          if (verb.endsWith("s") && !verb.endsWith("ss")) {
            verb = verb.substring(0, verb.length - 1);
          }
        } else if (subject.toLowerCase() !== "you" && subject.toLowerCase() !== "they" && 
                   subject.toLowerCase() !== "we" && !subject.endsWith("s")) {
          if (verb === "am") verb = "is";
          if (!verb.endsWith("s") && !verb.endsWith("ed") && !verb.endsWith("ing")) {
            verb += "s";
          }
        }
        
        // Add article if needed
        let objectPhrase = `the ${adjective} ${object}`;
        
        return `${subject} ${verb} ${objectPhrase}.`;
      }
    },
    
    // Subject + verb + place
    {
      condition: () => subjects.length > 0 && places.length > 0,
      create: () => {
        const subject = subjects[0].word;
        const place = places[0].word;
        let verb = actions.length > 0 ? actions[0].word : "went to";
        
        if (verb.toLowerCase() !== "went to" && verb.toLowerCase() !== "visited") {
          verb = "went to";
        }
        
        // Handle grammar for verbs
        if (subject.toLowerCase() === "i") {
          if (verb === "is") verb = "am";
          if (verb.endsWith("s") && !verb.endsWith("ss")) {
            verb = verb.substring(0, verb.length - 1);
          }
        } else if (subject.toLowerCase() !== "you" && subject.toLowerCase() !== "they" && 
                   subject.toLowerCase() !== "we" && !subject.endsWith("s")) {
          if (verb === "am") verb = "is";
          if (!verb.endsWith("s") && !verb.endsWith("ed") && !verb.endsWith("ing")) {
            if (verb !== "went to" && verb !== "visited") {
              verb += "s";
            }
          }
        }
        
        // Add article if needed
        let placePhrase = place;
        if (!["home", "school", "work"].includes(place.toLowerCase())) {
          placePhrase = `the ${place}`;
        }
        
        return `${subject} ${verb} ${placePhrase}.`;
      }
    }
  ];
  
  // Find the first template that can be used
  for (const template of templates) {
    if (template.condition()) {
      return template.create();
    }
  }
  
  // If we can't create a coherent sentence, use a very simple one
  if (wordCategories.length > 0) {
    // Just list the words in a simple sentence
    const words = wordCategories.map(wc => wc.word);
    return `The words are ${words.join(', ')}.`;
  }
  
  return null;
}

// Export the enhanced functions
export {
  selectAppropriateTemplate,
  fillTemplate,
  createCoherentSentence
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

/**
 * IMPROVED: Main function to generate a coherent story
 * - Adds randomness to template selection
 * - Ensures all sight words are used when possible
 * - Tracks which words were actually used
 */
export const generateEnhancedStory = (words, grade, learningNeeds) => {
  // Step 1: Categorize the provided words
  const categorizedWords = categorizeWords(words, grade);
  
  // Step 2: Get appropriate templates for this grade level
  const templates = getStoryTemplates(grade);
  
  // Step 3: Select the best template based on available words (now with randomness)
  const selectedTemplate = selectAppropriateTemplate(categorizedWords, templates);
  
  // Step 4: Fill the template with the categorized words (prioritizing all words being used)
  let story = fillTemplate(selectedTemplate, categorizedWords, words);
  
  // Step 5: Adjust complexity based on grade level
  story = adjustComplexityForGrade(story, grade);
  
  // Step 6: Make additional adjustments for specific learning needs
  story = adjustForLearningNeeds(story, learningNeeds);
  
  const correctedContent = correctStoryGrammar(story.content);

  // Return the final story
  return {
    ...story,
    content: correctedContent,
  };
};

// Export all functions that might be useful elsewhere
export {
  getSightWordsForGrade,
  categorizeWords,
  getStoryTemplates,
  correctGrammar,
  adjustComplexityForGrade,
  adjustForLearningNeeds
};