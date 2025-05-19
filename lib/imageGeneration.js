// lib/enhancedSvgGeneration.js

/**
 * Enhanced SVG generation library for better story illustrations
 * Creates more detailed and appropriate images for each story sentence
 */

/**
 * Sanitize text for SVG (escape special characters)
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
const sanitizeText = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Extract key elements from sentence text
 * @param {string} sentence - The sentence to analyze
 * @returns {Object} - Object containing key elements
 */
const extractSvgElements = (sentence) => {
  const lowercaseSentence = sentence.toLowerCase();
  
  // Define locations that might be in the sentence
  const locations = ['park', 'school', 'house', 'home', 'beach', 'playground', 'store', 'zoo', 'garden', 'room'];
  const location = locations.find(loc => lowercaseSentence.includes(loc)) || 'default';
  
  // Extract characters from sentence
  const characters = [];
  
  // Main character - default to child if no other found
  if (lowercaseSentence.includes(' i ') || lowercaseSentence.startsWith('i ')) {
    characters.push('narrator');
  }
  
  // Animals in sentence
  const animals = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'lion', 'tiger', 'bear', 'frog', 'duck'];
  animals.forEach(animal => {
    if (lowercaseSentence.includes(animal)) {
      characters.push(animal);
    }
  });
  
  // People in sentence
  const people = ['teacher', 'friend', 'boy', 'girl', 'mom', 'dad', 'man', 'woman', 'baby', 'child'];
  people.forEach(person => {
    if (lowercaseSentence.includes(person)) {
      characters.push(person);
    }
  });
  
  // Add default character if none found
  if (characters.length === 0) {
    characters.push('child');
  }
  
  // Extract actions
  const actions = [];
  const actionVerbs = ['went', 'saw', 'played', 'looked', 'ran', 'jumped', 'walked', 'talked', 'read', 'ate'];
  actionVerbs.forEach(verb => {
    if (lowercaseSentence.includes(verb)) {
      actions.push(verb);
    }
  });
  
  // Add default action if none found
  if (actions.length === 0) {
    actions.push('standing');
  }
  
  // Extract objects
  const objects = [];
  const commonObjects = ['ball', 'book', 'toy', 'bike', 'swing', 'slide', 'tree', 'flower', 'car', 'bus'];
  commonObjects.forEach(obj => {
    if (lowercaseSentence.includes(obj)) {
      objects.push(obj);
    }
  });
  
  return {
    location,
    characters,
    actions,
    objects
  };
};

/**
 * Generate location background for SVG
 * @param {string} location - The location name
 * @returns {string} - SVG elements for the background
 */
const generateBackground = (location) => {
  const width = 400;
  const height = 200;
  
  switch (location) {
    case 'park':
      return `
        <rect width="${width}" height="${height}" fill="#E8F5E9"/>
        <rect width="${width}" height="70" y="130" fill="#81C784" />
        <circle cx="350" cy="40" r="20" fill="#FFEB3B" />
        <path d="M200,140 Q220,110 240,140 Q260,100 280,140" stroke="#5D4037" stroke-width="10" fill="none" />
        <path d="M200,140 L200,70 Q230,70 220,50 Q210,30 240,40 Q270,50 260,70 Q290,70 280,140" fill="#2E7D32" />
        <path d="M80,140 Q100,110 120,140 Q140,100 160,140" stroke="#5D4037" stroke-width="6" fill="none" />
        <path d="M80,140 L80,90 Q110,90 100,70 Q90,50 120,60 Q150,70 140,90 Q170,90 160,140" fill="#2E7D32" />
      `;
    
    case 'school':
      return `
        <rect width="${width}" height="${height}" fill="#E3F2FD"/>
        <rect width="${width}" height="70" y="130" fill="#90CAF9" />
        <rect x="50" y="50" width="300" height="100" fill="#BBDEFB" stroke="#1565C0" stroke-width="3" />
        <rect x="180" y="100" width="40" height="50" fill="#1565C0" />
        <rect x="80" y="70" width="30" height="30" fill="#FFFFFF" stroke="#1565C0" />
        <rect x="270" y="70" width="30" height="30" fill="#FFFFFF" stroke="#1565C0" />
        <path d="M50,50 L200,10 L350,50" fill="#EF5350" stroke="#C62828" stroke-width="3" />
      `;
    
    case 'house':
    case 'home':
      return `
        <rect width="${width}" height="${height}" fill="#F5F5F5"/>
        <rect width="${width}" height="70" y="130" fill="#9E9E9E" />
        <rect x="100" y="60" width="200" height="100" fill="#FFCCBC" stroke="#5D4037" stroke-width="2" />
        <rect x="170" y="110" width="60" height="50" fill="#5D4037" />
        <rect x="120" y="80" width="40" height="40" fill="#B2EBF2" stroke="#0097A7" />
        <rect x="240" y="80" width="40" height="40" fill="#B2EBF2" stroke="#0097A7" />
        <path d="M100,60 L200,20 L300,60" fill="#FF7043" stroke="#E64A19" stroke-width="2" />
        <rect x="230" y="50" width="20" height="30" fill="#5D4037" />
      `;
    
    case 'beach':
      return `
        <rect width="${width}" height="${height}" fill="#B3E5FC"/>
        <rect width="${width}" height="70" y="130" fill="#FFCC80" />
        <circle cx="350" cy="40" r="20" fill="#FFEB3B" />
        <path d="M0,130 Q100,110 200,130 Q300,150 400,130" fill="#29B6F6" stroke="#0288D1" stroke-width="1" />
        <circle cx="60" cy="50" r="10" fill="#FFFFFF" opacity="0.7" />
        <circle cx="90" cy="40" r="8" fill="#FFFFFF" opacity="0.7" />
        <circle cx="75" cy="60" r="12" fill="#FFFFFF" opacity="0.7" />
      `;
    
    case 'zoo':
      return `
        <rect width="${width}" height="${height}" fill="#F1F8E9"/>
        <rect width="${width}" height="70" y="130" fill="#AED581" />
        <rect x="20" y="40" width="100" height="100" fill="#A1887F" stroke="#5D4037" stroke-width="2" />
        <rect x="200" y="60" width="150" height="80" fill="#A1887F" stroke="#5D4037" stroke-width="2" />
        <path d="M20,20 L70,5 L120,20" fill="#8D6E63" stroke="#5D4037" stroke-width="2" />
        <path d="M200,40 L275,20 L350,40" fill="#8D6E63" stroke="#5D4037" stroke-width="2" />
        <rect x="55" y="90" width="30" height="50" fill="#5D4037" />
        <rect x="260" y="100" width="30" height="40" fill="#5D4037" />
      `;
    
    default:
      return `
        <rect width="${width}" height="${height}" fill="#F5F5F5"/>
        <rect width="${width}" height="70" y="130" fill="#E0E0E0" />
        <circle cx="350" cy="40" r="20" fill="#FFC107" />
      `;
  }
};

/**
 * Generate character for SVG
 * @param {string} character - Character type
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} action - Character action
 * @returns {string} - SVG elements for the character
 */
const generateCharacter = (character, x, y, action) => {
  switch (character) {
    case 'narrator':
    case 'child':
      // Child or main character (simple)
      return `
        <circle cx="${x}" cy="${y}" r="20" fill="#FFCCBC" stroke="#5D4037" stroke-width="1" />
        <path d="M${x-10},${y-5} Q${x},${y+5} ${x+10},${y-5}" stroke="#5D4037" stroke-width="1.5" fill="none" />
        <circle cx="${x-5}" cy="${y-10}" r="2" fill="#5D4037" />
        <circle cx="${x+5}" cy="${y-10}" r="2" fill="#5D4037" />
        <path d="M${x-15},${y+20} Q${x},${y+35} ${x+15},${y+20}" fill="#3F51B5" stroke="#303F9F" stroke-width="1" />
        <rect x="${x-15}" y="${y+20}" width="30" height="30" rx="2" fill="#3F51B5" stroke="#303F9F" stroke-width="1" />
        <rect x="${x-15}" y="${y+50}" width="10" height="20" fill="#7986CB" />
        <rect x="${x+5}" y="${y+50}" width="10" height="20" fill="#7986CB" />
      `;
    
    case 'dog':
      // Dog
      return `
        <ellipse cx="${x}" cy="${y+40}" rx="25" ry="15" fill="#A1887F" stroke="#5D4037" stroke-width="1" />
        <circle cx="${x-15}" cy="${y+25}" r="12" fill="#A1887F" stroke="#5D4037" stroke-width="1" />
        <circle cx="${x-20}" cy="${y+22}" r="3" fill="#5D4037" />
        <circle cx="${x-10}" cy="${y+22}" r="3" fill="#5D4037" />
        <ellipse cx="${x-15}" cy="${y+28}" rx="3" ry="2" fill="#5D4037" />
        <path d="M${x-25},${y+15} L${x-32},${y+10}" stroke="#A1887F" stroke-width="3" fill="none" />
        <path d="M${x-5},${y+15} L${x+2},${y+10}" stroke="#A1887F" stroke-width="3" fill="none" />
        <path d="M${x+20},${y+40} L${x+35},${y+45}" stroke="#A1887F" stroke-width="3" fill="none" />
        <rect x="${x-25}" y="${y+45}" width="8" height="15" rx="3" fill="#A1887F" />
        <rect x="${x-8}" y="${y+45}" width="8" height="15" rx="3" fill="#A1887F" />
        <rect x="${x+9}" y="${y+45}" width="8" height="15" rx="3" fill="#A1887F" />
      `;
    
    case 'cat':
      // Cat
      return `
        <ellipse cx="${x}" cy="${y+40}" rx="20" ry="12" fill="#BDBDBD" stroke="#757575" stroke-width="1" />
        <circle cx="${x-10}" cy="${y+25}" r="10" fill="#BDBDBD" stroke="#757575" stroke-width="1" />
        <path d="M${x-18},${y+20} L${x-25},${y+15}" stroke="#BDBDBD" stroke-width="2" fill="none" />
        <path d="M${x-2},${y+20} L${x+5},${y+15}" stroke="#BDBDBD" stroke-width="2" fill="none" />
        <circle cx="${x-13}" cy="${y+22}" r="2" fill="#424242" />
        <circle cx="${x-7}" cy="${y+22}" r="2" fill="#424242" />
        <ellipse cx="${x-10}" cy="${y+27}" rx="2" ry="1" fill="#424242" />
        <path d="M${x+15},${y+40} L${x+35},${y+35}" stroke="#BDBDBD" stroke-width="3" fill="none" />
        <rect x="${x-18}" y="${y+45}" width="5" height="12" rx="2" fill="#BDBDBD" />
        <rect x="${x-5}" y="${y+45}" width="5" height="12" rx="2" fill="#BDBDBD" />
      `;
    
    case 'bird':
      // Bird
      return `
        <ellipse cx="${x}" cy="${y+30}" rx="15" ry="10" fill="#42A5F5" stroke="#1976D2" stroke-width="1" />
        <circle cx="${x+10}" cy="${y+25}" r="8" fill="#42A5F5" stroke="#1976D2" stroke-width="1" />
        <path d="M${x+15},${y+22} L${x+20},${y+20} L${x+18},${y+25}" fill="#FFC107" />
        <circle cx="${x+13}" cy="${y+22}" r="2" fill="#212121" />
        <path d="M${x-5},${y+30} L${x-15},${y+20}" stroke="#42A5F5" stroke-width="4" fill="none" />
        <path d="M${x-5},${y+30} L${x-15},${y+40}" stroke="#42A5F5" stroke-width="4" fill="none" />
        <path d="M${x},${y+40} L${x},${y+45}" stroke="#FFC107" stroke-width="2" fill="none" />
        <path d="M${x+5},${y+40} L${x+5},${y+45}" stroke="#FFC107" stroke-width="2" fill="none" />
      `;
    
    default:
      // Fallback character (stick figure)
      return `
        <circle cx="${x}" cy="${y}" r="15" fill="#FFCCBC" stroke="#5D4037" stroke-width="1" />
        <path d="M${x-5},${y-2} Q${x},${y+3} ${x+5},${y-2}" stroke="#5D4037" stroke-width="1" fill="none" />
        <circle cx="${x-4}" cy="${y-5}" r="1.5" fill="#5D4037" />
        <circle cx="${x+4}" cy="${y-5}" r="1.5" fill="#5D4037" />
        <line x1="${x}" y1="${y+15}" x2="${x}" y2="${y+50}" stroke="#5D4037" stroke-width="2" />
        <line x1="${x}" y1="${y+25}" x2="${x-15}" y2="${y+40}" stroke="#5D4037" stroke-width="2" />
        <line x1="${x}" y1="${y+25}" x2="${x+15}" y2="${y+40}" stroke="#5D4037" stroke-width="2" />
        <line x1="${x}" y1="${y+50}" x2="${x-10}" y2="${y+70}" stroke="#5D4037" stroke-width="2" />
        <line x1="${x}" y1="${y+50}" x2="${x+10}" y2="${y+70}" stroke="#5D4037" stroke-width="2" />
      `;
  }
};

/**
 * Generate objects for the SVG scene
 * @param {Array} objects - List of objects to include
 * @param {string} location - Scene location
 * @returns {string} - SVG elements for the objects
 */
const generateObjects = (objects, location) => {
  let objectsHTML = '';
  
  // Add objects based on the extracted list
  objects.forEach(obj => {
    switch (obj) {
      case 'ball':
        objectsHTML += `<circle cx="300" cy="150" r="15" fill="#F44336" stroke="#B71C1C" stroke-width="1" />`;
        break;
      
      case 'book':
        objectsHTML += `
          <rect x="270" y="140" width="30" height="25" fill="#FFE0B2" stroke="#5D4037" stroke-width="1" />
          <path d="M270,140 L270,165 L285,160 L300,165 L300,140 Z" fill="#FFA726" stroke="#5D4037" stroke-width="1" />
        `;
        break;
      
      case 'swing':
        if (location === 'park') {
          objectsHTML += `
            <line x1="320" y1="50" x2="300" y2="130" stroke="#5D4037" stroke-width="2" />
            <line x1="340" y1="50" x2="360" y2="130" stroke="#5D4037" stroke-width="2" />
            <rect x="300" y="130" width="60" height="10" fill="#A1887F" stroke="#5D4037" stroke-width="1" />
            <line x1="320" y1="50" x2="340" y2="50" stroke="#5D4037" stroke-width="4" />
          `;
        }
        break;
      
      case 'slide':
        if (location === 'park' || location === 'playground') {
          objectsHTML += `
            <rect x="240" y="90" width="50" height="10" fill="#F44336" stroke="#B71C1C" stroke-width="1" transform="rotate(-30, 240, 90)" />
            <rect x="280" y="70" width="10" height="30" fill="#F44336" stroke="#B71C1C" stroke-width="1" />
            <rect x="240" y="140" width="20" height="10" fill="#F44336" stroke="#B71C1C" stroke-width="1" />
          `;
        }
        break;
      
      case 'tree':
        objectsHTML += `
          <rect x="350" y="100" width="15" height="40" fill="#795548" stroke="#5D4037" stroke-width="1" />
          <circle cx="358" cy="80" r="25" fill="#4CAF50" stroke="#388E3C" stroke-width="1" />
        `;
        break;
        
      // Add more objects as needed
    }
  });
  
  return objectsHTML;
};

/**
 * Create a complete SVG illustration based on a sentence
 * @param {string} sentence - The sentence to illustrate
 * @returns {string} - Complete SVG code
 */
export const generateSVGIllustration = (sentence) => {
  // Extract key elements from the sentence
  const elements = extractSvgElements(sentence);
  
  // Sanitize sentence for caption
  const sanitizedSentence = sanitizeText(sentence);
  
  // Base SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">`;
  
  // Add background
  svg += generateBackground(elements.location);
  
  // Add objects
  svg += generateObjects(elements.objects, elements.location);
  
  // Add characters (positioned differently based on number of characters)
  if (elements.characters.length === 1) {
    svg += generateCharacter(elements.characters[0], 150, 100, elements.actions[0]);
  } else if (elements.characters.length === 2) {
    svg += generateCharacter(elements.characters[0], 120, 100, elements.actions[0]);
    svg += generateCharacter(elements.characters[1], 230, 100, elements.actions[0]);
  } else {
    let xPos = 80;
    elements.characters.forEach((character, index) => {
      svg += generateCharacter(character, xPos + (index * 80), 100, elements.actions[0]);
    });
  }
  
  // Close the SVG
  svg += `</svg>`;
  
  return svg;
};

/**
 * Convert SVG string to Data URL for use in <img> tags
 * @param {string} svg - SVG content string
 * @returns {string} - Data URL
 */
export const svgToDataURL = (svg) => {
  // For browsers: create a Blob and URL
  if (typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  }
  
  // Fallback for server-side or environments without Blob
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};