// lib/ocr.js
/**
 * Read the Dolch words in a photo: turn it black and white, read it once with
 * Tesseract, and keep only exact Dolch words (lib/wordLists.js).
 */

import { createWorker } from 'tesseract.js';
import { DOLCH_LISTS } from './wordLists';
import { findWords } from './sightWords';

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
    
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };

    img.src = url;
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
  // Words are found as everywhere else in the app (lib/sightWords.js): quotes
  // and punctuation are left out, and curly apostrophes count as straight ones
  const keys = findWords(text).map((word) => word.key);
  return [...new Set(keys.filter((key) => SIGHT_WORDS.includes(key)))];
};

/**
 * Read the sight words in a photo or scanned page.
 *
 * @param {File} imageFile - Image file from input
 * @return {Promise<{ words: string[], success: boolean, error?: string }>}
 */
export const performEnhancedOCR = async (imageFile) => {
  let worker;
  try {
    const processedImage = await preprocessImage(imageFile);

    // In Tesseract.js v6, createWorker takes the language and initialises itself.
    // One pass: more passes with the same settings return the same text.
    worker = await createWorker('eng');
    const { data } = await worker.recognize(processedImage);

    const words = validateExtractedWords(data.text);
    return { words, success: words.length > 0 };
  } catch (error) {
    console.error('Enhanced OCR Error:', error);
    return { words: [], success: false, error: error.message };
  } finally {
    await worker?.terminate();
  }
};

// Exported for lib/__tests__/ocr.test.js
export {
  preprocessImage,
  validateExtractedWords
};