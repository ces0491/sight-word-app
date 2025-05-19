// lib/ocr.js - OCR implementation with Tesseract.js

import { createWorker } from 'tesseract.js';

// OCR implementation for extracting sight words from images
export const performOCR = async (imageFile) => {
  // Create a preview URL for display
  const imageUrl = URL.createObjectURL(imageFile);
  
  try {
    // Initialize the Tesseract worker
    const worker = await createWorker('eng');
    
    // Recognize text from the image
    const { data: { text } } = await worker.recognize(imageFile);
    
    // Clean up and terminate the worker
    await worker.terminate();
    
    // Process the recognized text to extract words
    const extractedWords = processExtractedText(text);
    
    return {
      imageUrl,
      words: extractedWords,
      success: true
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      imageUrl,
      words: [],
      success: false,
      error: error.message
    };
  }
};

// Process the raw text from OCR to extract valid sight words
const processExtractedText = (text) => {
  // Remove special characters and extra whitespace
  const cleanedText = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
    .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
    .trim();
  
  // Split into words and filter out very short words (likely OCR errors)
  // and very long words (unlikely to be sight words)
  const words = cleanedText
    .split(' ')
    .filter(word => word.length >= 2 && word.length <= 8)
    .filter(word => !/\d/.test(word)); // Filter out words containing numbers
  
  // Filter for common sight words
  // In a real application, you might have a more comprehensive list
  const commonSightWords = [
    'the', 'and', 'a', 'to', 'is', 'you', 'that', 'it', 'he', 'was',
    'for', 'on', 'are', 'as', 'with', 'his', 'they', 'I', 'at', 'be',
    'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but',
    'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said',
    'there', 'use', 'an', 'each', 'which', 'she', 'do', 'how', 'their',
    'if', 'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them',
    'these', 'so', 'some', 'her', 'would', 'make', 'like', 'him', 'into',
    'time', 'has', 'look', 'two', 'more', 'write', 'go', 'see', 'number',
    'no', 'way', 'could', 'people', 'my', 'than', 'first', 'water', 'been',
    'call', 'who', 'oil', 'its', 'now', 'find', 'long', 'down', 'day',
    'did', 'get', 'come', 'made', 'may', 'part', 'over', 'new', 'sound',
    'take', 'only', 'little', 'work', 'know', 'place', 'year', 'live',
    'me', 'back', 'give', 'most', 'very', 'after', 'thing', 'our', 'just',
    'name', 'good', 'sentence', 'man', 'think', 'say', 'great', 'where',
    'help', 'through', 'much', 'before', 'line', 'right', 'too', 'mean',
    'old', 'any', 'same', 'tell', 'boy', 'follow', 'came', 'want', 'show',
    'also', 'around', 'form', 'three', 'small', 'set', 'put', 'end', 'does',
    'another', 'well', 'large', 'must', 'big', 'even', 'such', 'because',
    'turn', 'here', 'why', 'ask', 'went', 'men', 'read', 'need', 'land',
    'different', 'home', 'us', 'move', 'try', 'kind', 'hand', 'picture',
    'again', 'change', 'off', 'play', 'spell', 'air', 'away', 'animal',
    'house', 'point', 'page', 'letter', 'mother', 'answer', 'found', 'study',
    'still', 'learn', 'should', 'South', 'Africa', 'world'
  ];
  
  // Only keep recognized words that are in our sight words list or are 2-5 letters
  // (short words are often sight words)
  const sightWords = words.filter(word => 
    commonSightWords.includes(word) || (word.length >= 2 && word.length <= 5)
  );
  
  // Remove duplicates
  return [...new Set(sightWords)];
};

export default performOCR;