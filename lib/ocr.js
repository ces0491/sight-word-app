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
 * - Words checked against the Dolch lists (lib/wordLists.js), so a scan adds
 *   only Dolch sight words
 */

import { createWorker } from 'tesseract.js';
import { DOLCH_LISTS } from './wordLists';

/** All 220 Dolch words, lower-cased: the words a scan can add. */
const SIGHT_WORDS = [...new Set(DOLCH_LISTS.flatMap((list) => list.words.map((word) => word.toLowerCase())))];

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
 * Pick the Dolch sight words out of text read from an image.
 *
 * Only exact matches count. Guessing the nearest Dolch word for a misread
 * also turns ordinary words into wrong ones ("tree" into "three", "dog" into
 * "do"), and a wrong word on a child's practice list is worse than a missing
 * one, which can be typed.
 *
 * @param {string} text - Raw text from OCR
 * @return {string[]} - Sight words found, lower-cased, in reading order, each once
 */
const validateExtractedWords = (text) => {
  if (!text) return [];

  // Split into words, keeping apostrophes inside a word ("don't")
  const potentialWords = text
    .toLowerCase()
    .replace(/[‘’]/g, "'") // Curly apostrophes
    .replace(/[^\w\s']/g, ' ')
    .split(/\s+/)
    .map((word) => word.replace(/^'+|'+$/g, ''));

  return [...new Set(potentialWords.filter((word) => SIGHT_WORDS.includes(word)))];
};

/**
 * Main OCR function with improved text extraction
 *
 * @param {File} imageFile - Image file from input
 * @return {Promise<object>} - OCR results
 */
export const performEnhancedOCR = async (imageFile) => {
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
    const extractedWords = validateExtractedWords(combinedText);
    
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
  preprocessImage,
  validateExtractedWords
};