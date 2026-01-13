// lib/ocr.js
/**
 * Enhanced OCR Module with improved word detection for sight words
 * 
 * This module provides more accurate OCR capabilities specifically optimized
 * for detecting sight words in images or photos taken by the user.
 * 
 * Features:
 * - Image preprocessing to improve OCR accuracy
 * - Advanced text extraction and cleaning
 * - Sight word validation against grade-appropriate dictionaries
 * - Confidence scoring and fuzzy matching for ambiguous results
 */

import { createWorker } from 'tesseract.js';

/**
 * Common sight words by grade level for validation
 */
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

/**
 * Get all sight words up to and including a specific grade level
 * 
 * @param {number} grade - The grade level (0-5)
 * @return {string[]} - Array of sight words
 */
const getSightWordsForGrade = (grade) => {
  let allWords = [];
  for (let i = 0; i <= grade; i++) {
    if (sightWordsByGrade[i]) {
      allWords = [...allWords, ...sightWordsByGrade[i]];
    }
  }
  return [...new Set(allWords)]; // Remove duplicates
};

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching of OCR results against sight words
 * 
 * @param {string} a - First string
 * @param {string} b - Second string
 * @return {number} - Edit distance
 */
const levenshteinDistance = (a, b) => {
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Find the closest sight word to a given input
 * 
 * @param {string} word - Input word (potentially misspelled or misread)
 * @param {string[]} sightWords - Array of valid sight words
 * @return {object} - Best match and distance
 */
const findClosestSightWord = (word, sightWords) => {
  if (!word || word.length < 2) return { match: null, distance: Infinity };
  
  word = word.toLowerCase();
  
  // Exact match
  if (sightWords.includes(word)) {
    return { match: word, distance: 0 };
  }
  
  // Find the closest match
  let closestMatch = null;
  let minDistance = Infinity;
  
  // Only check against words of similar length (efficiency)
  const candidateWords = sightWords.filter(
    sw => Math.abs(sw.length - word.length) <= 2
  );
  
  for (const sightWord of candidateWords) {
    const distance = levenshteinDistance(word, sightWord);
    
    // Better match found
    if (distance < minDistance) {
      minDistance = distance;
      closestMatch = sightWord;
    }
  }
  
  return { match: closestMatch, distance: minDistance };
};

/**
 * Create a canvas from an image for preprocessing
 * 
 * @param {File} imageFile - Image file from input
 * @return {Promise<HTMLCanvasElement>} - Canvas with the image
 */
const createCanvasFromImage = async (imageFile) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    
    img.onerror = (error) => {
      reject(error);
    };
    
    // Set source
    img.src = URL.createObjectURL(imageFile);
  });
};

/**
 * Apply preprocessing to improve OCR on sight word images
 * 
 * @param {File} imageFile - Image file from input
 * @return {Promise<Blob>} - Processed image as Blob
 */
const preprocessImage = async (imageFile) => {
  try {
    const canvas = await createCanvasFromImage(imageFile);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert to grayscale and increase contrast
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      // Apply thresholding (increase contrast)
      // This helps with recognizing text on various backgrounds
      const threshold = 128;
      const newValue = gray > threshold ? 255 : 0;
      
      // Set new pixel values
      data[i] = newValue;     // R
      data[i + 1] = newValue; // G
      data[i + 2] = newValue; // B
      // Keep alpha (data[i + 3]) as is
    }
    
    // Put processed image data back to canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
  } catch (error) {
    console.error('Image preprocessing failed:', error);
    // Fall back to original image if preprocessing fails
    return imageFile;
  }
};

/**
 * Validate and clean extracted text from OCR
 * 
 * @param {string} text - Raw text from OCR
 * @param {number} grade - Grade level for sight word validation
 * @return {string[]} - Array of validated sight words
 */
const validateExtractedWords = (text, grade = 2) => {
  if (!text) return [];
  
  // Get all grade-appropriate sight words
  const allSightWords = getSightWordsForGrade(grade);
  
  // Clean and normalize input text
  const cleanedText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
    .replace(/\s+/g, ' ')     // Replace multiple spaces with a single space
    .trim();
  
  // Split text into potential words
  const potentialWords = cleanedText
    .split(' ')
    .filter(word => word.length >= 2 && word.length <= 8)  // Filter by length
    .filter(word => !/\d/.test(word));                    // Remove words with numbers
  
  // Validate against sight word list
  const validatedWords = [];
  const usedWords = new Set(); // To avoid duplicates
  
  for (const word of potentialWords) {
    // Skip short words and already used words
    if (word.length < 2 || usedWords.has(word)) continue;
    
    // Direct match
    if (allSightWords.includes(word)) {
      validatedWords.push(word);
      usedWords.add(word);
      continue;
    }
    
    // Check for fuzzy matches (for OCR errors)
    const { match, distance } = findClosestSightWord(word, allSightWords);
    
    // If there's a close match and the distance is small enough
    if (match && (distance <= 1 || (word.length > 3 && distance <= 2))) {
      if (!usedWords.has(match)) {
        validatedWords.push(match);
        usedWords.add(match);
      }
    }
  }
  
  return validatedWords;
};

/**
 * Main OCR function with improved text extraction
 * 
 * @param {File} imageFile - Image file from input
 * @param {number} grade - Grade level
 * @return {Promise<object>} - OCR results
 */
export const performEnhancedOCR = async (imageFile, grade = 2) => {
  try {
    // Preprocess image
    const processedImage = await preprocessImage(imageFile);
    
    // Create image URL for display
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Initialize Tesseract with optimal configuration (v6 API)
    // In Tesseract.js v6, createWorker takes language as parameter and auto-initializes
    const worker = await createWorker('eng');

    // First try with default settings
    const result1 = await worker.recognize(processedImage);

    // For additional recognition attempts, we'll use the same worker
    // Tesseract.js v6 handles parameters differently
    const result2 = await worker.recognize(processedImage);
    const result3 = await worker.recognize(processedImage);
    
    // Cleanup worker
    await worker.terminate();
    
    // Combine results from all attempts
    const combinedText = `${result1.data.text} ${result2.data.text} ${result3.data.text}`;
    
    // Validate and clean extracted words
    const extractedWords = validateExtractedWords(combinedText, grade);
    
    // Prepare debug info for development
    const debugInfo = {
      rawText: combinedText,
      confidence: Math.max(
        result1.data.confidence, 
        result2.data.confidence, 
        result3.data.confidence
      )
    };
    
    return {
      imageUrl,
      words: extractedWords,
      success: extractedWords.length > 0,
      debugInfo: debugInfo
    };
  } catch (error) {
    console.error('Enhanced OCR Error:', error);
    return {
      imageUrl: URL.createObjectURL(imageFile),
      words: [],
      success: false,
      error: error.message
    };
  }
};

// Export all functions that might be useful elsewhere
export {
  getSightWordsForGrade,
  levenshteinDistance,
  findClosestSightWord,
  preprocessImage,
  validateExtractedWords
};