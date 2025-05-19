/**
 * Improved SVG Generation for Sight Word Story Generator
 * 
 * Features:
 * - Simple, child-friendly illustrations
 * - Diverse character representation
 * - Meaningful scene generation based on sentence content
 * - Consistent style with your previous images
 */

/**
 * Generate an SVG illustration based on sentence content
 * @param {string} sentence - The sentence to illustrate
 * @param {object} options - Configuration options
 * @returns {string} - Complete SVG code
 */
export const generateIllustration = (sentence, options = {}) => {
  // Extract key elements from the sentence
  const elements = extractElements(sentence);
  
  // SVG dimensions
  const width = 400;
  const height = 200;
  
  // Start SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`;
  
  // Add background based on location
  svg += generateBackground(elements.location);
  
  // Add characters
  svg += generateCharacters(elements.characters, elements.action);
  
  // Add objects or other elements
  if (elements.objects.length > 0) {
    svg += generateObjects(elements.objects);
  }
  
  // Close SVG
  svg += '</svg>';
  
  return svg;
};

/**
 * Extract key elements from a sentence
 * @param {string} sentence - The sentence to analyze
 * @returns {object} - Extracted elements
 */
const extractElements = (sentence) => {
  const lowerSentence = sentence.toLowerCase();
  
  // Locations in the sentence
  const locations = {
    school: ['school', 'classroom', 'class'],
    park: ['park', 'playground', 'outside'],
    home: ['home', 'house', 'room'],
    beach: ['beach', 'ocean', 'water'],
    library: ['library', 'book', 'read'],
    store: ['store', 'shop', 'buy']
  };
  
  // Determine location
  let location = 'default';
  Object.entries(locations).forEach(([key, terms]) => {
    if (terms.some(term => lowerSentence.includes(term))) {
      location = key;
    }
  });
  
  // Extract people
  const characters = [];
  
  // Check for common roles
  const roles = {
    teacher: ['teacher', 'teaches'],
    student: ['student', 'pupil'],
    friend: ['friend', 'buddy', 'pal'],
    parent: ['mom', 'dad', 'mother', 'father', 'parent']
  };
  
  Object.entries(roles).forEach(([role, terms]) => {
    if (terms.some(term => lowerSentence.includes(term))) {
      characters.push({ role, gender: Math.random() > 0.5 ? 'male' : 'female' });
    }
  });
  
  // If no specific roles found, add generic character
  if (characters.length === 0) {
    characters.push({ role: 'person', gender: Math.random() > 0.5 ? 'male' : 'female' });
  }
  
  // If only one character, add a second one for better illustration
  if (characters.length === 1) {
    const secondRole = characters[0].role === 'teacher' ? 'student' : 'friend';
    characters.push({ role: secondRole, gender: Math.random() > 0.5 ? 'male' : 'female' });
  }
  
  // Randomize skin tones for diversity (0 = light, 1 = medium, 2 = dark)
  characters.forEach(char => {
    char.skinTone = Math.floor(Math.random() * 3);
  });
  
  // Extract action
  let action = 'standing';
  if (lowerSentence.includes('jump')) action = 'jumping';
  if (lowerSentence.includes('run')) action = 'running';
  if (lowerSentence.includes('walk')) action = 'walking';
  if (lowerSentence.includes('sit')) action = 'sitting';
  if (lowerSentence.includes('play')) action = 'playing';
  if (lowerSentence.includes('read')) action = 'reading';
  
  // Extract objects
  const objects = [];
  const commonObjects = {
    ball: ['ball'],
    book: ['book', 'reading'],
    toy: ['toy', 'game'],
    pencil: ['pencil', 'write'],
    apple: ['apple', 'fruit'],
    backpack: ['backpack', 'bag']
  };
  
  Object.entries(commonObjects).forEach(([object, terms]) => {
    if (terms.some(term => lowerSentence.includes(term))) {
      objects.push(object);
    }
  });
  
  return {
    location,
    characters,
    action,
    objects
  };
};

/**
 * Generate background based on location
 * @param {string} location - The location name
 * @returns {string} - SVG elements for background
 */
const generateBackground = (location) => {
  // Standard sky and sun
  const sky = '<rect width="400" height="200" fill="#87CEEB" />';
  const sun = '<circle cx="350" cy="50" r="30" fill="#FFFF00" />';
  
  // Different grounds based on location
  let ground = '';
  let extras = '';
  
  switch(location) {
    case 'school':
      ground = '<rect x="0" y="130" width="400" height="70" fill="#A9A9A9" />'; // Gray ground
      extras = `
        <rect x="100" y="40" width="200" height="110" fill="#FFF8DC" stroke="#000" stroke-width="1" /> <!-- Building -->
        <rect x="185" y="110" width="30" height="40" fill="#8B4513" /> <!-- Door -->
        <rect x="130" y="60" width="30" height="30" fill="#ADD8E6" stroke="#000" stroke-width="1" /> <!-- Window -->
        <rect x="240" y="60" width="30" height="30" fill="#ADD8E6" stroke="#000" stroke-width="1" /> <!-- Window -->
        <polygon points="100,40 200,10 300,40" fill="#FF6347" stroke="#000" stroke-width="1" /> <!-- Roof -->
        <rect x="320" y="60" width="2" height="80" fill="#000" /> <!-- Flagpole -->
        <rect x="322" y="60" width="15" height="10" fill="#0000FF" /> <!-- Flag -->
      `;
      break;
    case 'park':
      ground = '<rect x="0" y="130" width="400" height="70" fill="#7CFC00" />'; // Bright green
      extras = `
        <rect x="70" y="90" width="10" height="40" fill="#8B4513" /> <!-- Tree trunk -->
        <circle cx="75" cy="80" r="25" fill="#006400" /> <!-- Tree top -->
        <rect x="290" y="100" width="10" height="30" fill="#8B4513" /> <!-- Tree trunk -->
        <circle cx="295" cy="90" r="20" fill="#006400" /> <!-- Tree top -->
        <ellipse cx="200" cy="140" rx="100" ry="10" fill="#7FFF00" /> <!-- Grass mound -->
      `;
      break;
    case 'home':
      ground = '<rect x="0" y="130" width="400" height="70" fill="#8FBC8F" />'; // Dark sea green
      extras = `
        <rect x="120" y="50" width="160" height="80" fill="#F5DEB3" stroke="#000" stroke-width="1" /> <!-- House -->
        <rect x="180" y="90" width="40" height="40" fill="#8B4513" /> <!-- Door -->
        <rect x="140" y="70" width="30" height="30" fill="#87CEFA" stroke="#000" stroke-width="1" /> <!-- Window -->
        <rect x="230" y="70" width="30" height="30" fill="#87CEFA" stroke="#000" stroke-width="1" /> <!-- Window -->
        <polygon points="120,50 200,20 280,50" fill="#A52A2A" stroke="#000" stroke-width="1" /> <!-- Roof -->
      `;
      break;
    case 'beach':
      ground = '<rect x="0" y="130" width="400" height="70" fill="#F0E68C" />'; // Khaki (sand)
      extras = `
        <rect x="0" y="110" width="400" height="20" fill="#1E90FF" /> <!-- Water -->
        <path d="M0,110 Q100,90 200,110 Q300,130 400,110" fill="#1E90FF" /> <!-- Waves -->
        <circle cx="100" cy="150" r="10" fill="#FF0000" stroke="#000" stroke-width="1" /> <!-- Beach ball -->
        <line x1="300" y1="120" x2="300" y2="150" stroke="#8B4513" stroke-width="2" /> <!-- Umbrella pole -->
        <path d="M270,120 Q300,100 330,120" fill="#FF6347" stroke="#000" stroke-width="1" /> <!-- Umbrella top -->
      `;
      break;
    case 'library':
      ground = '<rect x="0" y="130" width="400" height="70" fill="#DEB887" />'; // Burlywood
      extras = `
        <rect x="50" y="40" width="300" height="90" fill="#D2B48C" stroke="#000" stroke-width="1" /> <!-- Library -->
        <rect x="180" y="90" width="40" height="40" fill="#8B4513" /> <!-- Door -->
        <rect x="80" y="50" width="40" height="30" fill="#FFE4C4" stroke="#000" stroke-width="1" /> <!-- Window -->
        <rect x="280" y="50" width="40" height="30" fill="#FFE4C4" stroke="#000" stroke-width="1" /> <!-- Window -->
        <rect x="70" y="60" width="260" height="10" fill="#A0522D" /> <!-- Bookshelf -->
      `;
      break;
    case 'store':
      ground = '<rect x="0" y="130" width="400" height="70" fill="#808080" />'; // Gray
      extras = `
        <rect x="100" y="40" width="200" height="90" fill="#F5F5DC" stroke="#000" stroke-width="1" /> <!-- Store -->
        <rect x="180" y="90" width="40" height="40" fill="#4682B4" /> <!-- Door -->
        <rect x="250" y="50" width="40" height="30" fill="#B0C4DE" stroke="#000" stroke-width="1" /> <!-- Window -->
        <rect x="120" y="50" width="120" height="30" fill="#FF6347" /> <!-- Store sign -->
        <text x="150" y="70" font-family="Arial" font-size="16" fill="#FFFFFF">STORE</text>
      `;
      break;
    default:
      ground = '<rect x="0" y="130" width="400" height="70" fill="#90EE90" />'; // Light green
      extras = '';
  }
  
  return sky + sun + ground + extras;
};

/**
 * Generate characters based on extracted info
 * @param {Array} characters - Array of character objects
 * @param {string} action - The action being performed
 * @returns {string} - SVG elements for characters
 */
const generateCharacters = (characters, action) => {
  let svg = '';
  
  // Position characters evenly
  const positions = [
    { x: 160, y: 130 }, // Left character
    { x: 240, y: 130 }  // Right character
  ];
  
  // Skin tone colors
  const skinTones = [
    '#FFE0BD', // Light
    '#C68642', // Medium
    '#6A4928'  // Dark
  ];
  
  // Role-based colors for clothing
  const roleColors = {
    teacher: '#008000', // Green
    student: '#1E90FF', // Blue
    friend: '#9932CC',  // Purple
    parent: '#FF8C00',  // Orange
    person: '#4169E1'   // Royal Blue
  };
  
  // Generate each character
  characters.forEach((character, index) => {
    if (index >= positions.length) return; // Only draw up to 2 characters
    
    const { x, y } = positions[index];
    const skinTone = skinTones[character.skinTone];
    const shirtColor = roleColors[character.role] || '#4169E1';
    
    // Height adjustment based on role
    const heightAdjust = character.role === 'teacher' || character.role === 'parent' ? -10 : 0;
    
    // Draw the character
    svg += `
      <!-- ${character.role} character -->
      <g>
        <!-- Head -->
        <circle cx="${x}" cy="${y - 40 + heightAdjust}" r="15" fill="${skinTone}" />
        
        <!-- Face -->
        <circle cx="${x - 5}" cy="${y - 42 + heightAdjust}" r="2" fill="#000" />
        <circle cx="${x + 5}" cy="${y - 42 + heightAdjust}" r="2" fill="#000" />
        <path d="M${x-4},${y-35+heightAdjust} Q${x},${y-33+heightAdjust} ${x+4},${y-35+heightAdjust}" stroke="#000" stroke-width="1" fill="none" />
        
        <!-- Hair - different styles -->
        ${character.gender === 'female' ? 
          `<path d="M${x-15},${y-45+heightAdjust} Q${x},${y-55+heightAdjust} ${x+15},${y-45+heightAdjust}" fill="${Math.random() > 0.5 ? '#FF6347' : '#8B4513'}" />` :
          `<rect x="${x-15}" y="${y-55+heightAdjust}" width="30" height="10" fill="${Math.random() > 0.5 ? '#8B4513' : '#000'}" />`
        }
        
        <!-- Body -->
        <rect x="${x-15}" y="${y-25+heightAdjust}" width="30" height="40" fill="${shirtColor}" />
        
        <!-- Arms -->
        <rect x="${x-25}" y="${y-20+heightAdjust}" width="10" height="20" fill="${skinTone}" />
        <rect x="${x+15}" y="${y-20+heightAdjust}" width="10" height="20" fill="${skinTone}" />
        
        <!-- Legs -->
        <rect x="${x-12}" y="${y+15+heightAdjust}" width="10" height="25" fill="#000" />
        <rect x="${x+2}" y="${y+15+heightAdjust}" width="10" height="25" fill="#000" />
        
        <!-- Feet -->
        <rect x="${x-15}" y="${y+40+heightAdjust}" width="13" height="5" rx="2" fill="#000" />
        <rect x="${x+2}" y="${y+40+heightAdjust}" width="13" height="5" rx="2" fill="#000" />
      </g>
    `;
  });
  
  // Add action-specific elements
  if (action === 'jumping') {
    // Move characters up to show jumping
    svg = svg.replace(/y="\d+"/g, (match) => {
      const y = parseInt(match.match(/\d+/)[0]);
      return `y="${y - 10}"`;
    });
  } else if (action === 'reading') {
    // Add books to characters' hands
    characters.forEach((character, index) => {
      if (index >= positions.length) return;
      const { x, y } = positions[index];
      const heightAdjust = character.role === 'teacher' || character.role === 'parent' ? -10 : 0;
      
      svg += `
        <!-- Book -->
        <rect x="${x-10}" y="${y-10+heightAdjust}" width="20" height="15" fill="#8B4513" />
        <rect x="${x-8}" y="${y-8+heightAdjust}" width="16" height="11" fill="#FFF8DC" />
      `;
    });
  }
  
  return svg;
};

/**
 * Generate objects based on extracted info
 * @param {Array} objects - Array of object names
 * @returns {string} - SVG elements for objects
 */
const generateObjects = (objects) => {
  let svg = '';
  
  // Position objects in appropriate locations
  const positions = [
    { x: 200, y: 160 }, // Center front
    { x: 100, y: 150 }, // Left side
    { x: 300, y: 150 }  // Right side
  ];
  
  // Generate objects
  objects.forEach((object, index) => {
    if (index >= positions.length) return; // Only draw up to 3 objects
    
    const { x, y } = positions[index];
    
    switch(object) {
      case 'ball':
        svg += `
          <circle cx="${x}" cy="${y}" r="15" fill="#FF0000" stroke="#000" stroke-width="1" />
          <path d="M${x-10},${y} Q${x},${y-5} ${x+10},${y}" stroke="#FFF" stroke-width="1" fill="none" />
          <path d="M${x},${y-10} Q${x+5},${y} ${x},${y+10}" stroke="#FFF" stroke-width="1" fill="none" />
        `;
        break;
      case 'book':
        svg += `
          <rect x="${x-15}" y="${y-10}" width="30" height="20" fill="#8B4513" stroke="#000" stroke-width="1" />
          <rect x="${x-13}" y="${y-8}" width="26" height="16" fill="#FFF8DC" stroke="#000" stroke-width="0.5" />
          <line x1="${x}" y1="${y-8}" x2="${x}" y2="${y+8}" stroke="#000" stroke-width="0.5" />
        `;
        break;
      case 'toy':
        svg += `
          <rect x="${x-10}" y="${y-10}" width="20" height="20" rx="3" fill="#FF6347" stroke="#000" stroke-width="1" />
          <circle cx="${x-5}" cy="${y-5}" r="2" fill="#FFF" />
          <circle cx="${x+5}" cy="${y-5}" r="2" fill="#FFF" />
          <path d="M${x-5},${y+5} Q${x},${y+7} ${x+5},${y+5}" stroke="#FFF" stroke-width="1" fill="none" />
        `;
        break;
      case 'pencil':
        svg += `
          <rect x="${x-15}" y="${y-5}" width="30" height="5" fill="#FFD700" stroke="#000" stroke-width="0.5" />
          <polygon points="${x+15},${y-5} ${x+15},${y} ${x+20},${y-2.5}" fill="#FF0000" stroke="#000" stroke-width="0.5" />
          <rect x="${x-17}" y="${y-5}" width="2" height="5" fill="#808080" stroke="#000" stroke-width="0.5" />
        `;
        break;
      case 'apple':
        svg += `
          <circle cx="${x}" cy="${y}" r="10" fill="#FF0000" stroke="#000" stroke-width="1" />
          <line x1="${x}" y1="${y-10}" x2="${x}" y2="${y-15}" stroke="#8B4513" stroke-width="2" />
          <path d="M${x+2},${y-10} Q${x+5},${y-15} ${x+3},${y-20}" stroke="#008000" stroke-width="1" fill="none" />
        `;
        break;
      case 'backpack':
        svg += `
          <rect x="${x-15}" y="${y-25}" width="30" height="35" rx="5" fill="#4682B4" stroke="#000" stroke-width="1" />
          <rect x="${x-10}" y="${y-20}" width="20" height="10" rx="2" fill="#4169E1" stroke="#000" stroke-width="0.5" />
          <rect x="${x-5}" y="${y-30}" width="10" height="5" fill="#4682B4" stroke="#000" stroke-width="0.5" />
        `;
        break;
      default:
        // Generic object
        svg += `
          <rect x="${x-10}" y="${y-10}" width="20" height="20" fill="#A9A9A9" stroke="#000" stroke-width="1" />
        `;
    }
  });
  
  return svg;
};

/**
 * Convert SVG string to a data URL
 * @param {string} svg - The SVG content
 * @returns {string} - Data URL representation
 */
export const svgToDataURL = (svg) => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};