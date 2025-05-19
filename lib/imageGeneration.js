// lib/enhancedSvgIllustrations.js

/**
 * Enhanced SVG Illustration System for Sight Word Story Generator
 * 
 * Features:
 * - Improved visual quality with better colors and details
 * - Greater variety of characters, locations, and objects
 * - More accessible designs with proper contrast
 * - Support for different learning needs
 * - Modular and extensible architecture
 * - Responsive design with viewBox approach
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
 * Extract key elements from sentence text to determine what to display
 * @param {string} sentence - The sentence to analyze
 * @returns {Object} - Object containing key elements
 */
const extractSvgElements = (sentence) => {
  const lowercaseSentence = sentence.toLowerCase();
  
  // Define locations that might be in the sentence
  const locations = {
    park: ['park', 'playground', 'garden', 'yard', 'outside'],
    school: ['school', 'classroom', 'library', 'class'],
    home: ['home', 'house', 'room', 'bedroom', 'kitchen', 'living room'],
    beach: ['beach', 'ocean', 'sea', 'lake', 'water'],
    zoo: ['zoo', 'farm', 'animal'],
    store: ['store', 'shop', 'mall', 'market']
  };
  
  // Find location
  let location = 'default';
  Object.entries(locations).forEach(([key, terms]) => {
    if (terms.some(term => lowercaseSentence.includes(term))) {
      location = key;
    }
  });
  
  // Extract characters from sentence
  const characters = [];
  
  // Check for first person narrator
  if (lowercaseSentence.includes(' i ') || lowercaseSentence.startsWith('i ')) {
    characters.push({
      type: 'child',
      role: 'narrator'
    });
  }
  
  // Check for names (simple approach - words starting with capital letters that aren't at sentence start)
  const words = sentence.split(/\s+/);
  const namePattern = /^[A-Z][a-z]{2,}$/;
  words.slice(1).forEach(word => {
    if (namePattern.test(word) && !['I', 'My', 'The', 'A', 'An'].includes(word)) {
      characters.push({
        type: 'person',
        role: 'named',
        name: word
      });
    }
  });
  
  // Check for animals
  const animals = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'lion', 'tiger', 'bear', 'elephant', 'monkey', 'giraffe', 'zebra', 'frog'];
  animals.forEach(animal => {
    if (lowercaseSentence.includes(animal)) {
      characters.push({
        type: 'animal',
        species: animal
      });
    }
  });
  
  // Check for people
  const people = ['friend', 'teacher', 'mom', 'dad', 'mother', 'father', 'brother', 'sister', 'girl', 'boy', 'man', 'woman', 'baby', 'grandma', 'grandpa'];
  people.forEach(person => {
    if (lowercaseSentence.includes(person)) {
      characters.push({
        type: 'person',
        role: person
      });
    }
  });
  
  // Add default character if none found
  if (characters.length === 0) {
    characters.push({
      type: 'child',
      role: 'default'
    });
  }
  
  // Extract actions
  const actions = [];
  const actionVerbs = {
    movement: ['go', 'went', 'walk', 'walked', 'run', 'ran', 'jump', 'jumped', 'climb', 'climbed', 'swim', 'swam'],
    observation: ['see', 'saw', 'look', 'looked', 'watch', 'watched', 'find', 'found'],
    play: ['play', 'played', 'draw', 'drew', 'color', 'colored', 'paint', 'painted', 'build', 'built'],
    consumption: ['eat', 'ate', 'drink', 'drank'],
    communication: ['say', 'said', 'tell', 'told', 'talk', 'talked', 'read', 'write', 'wrote'],
    emotion: ['smile', 'smiled', 'laugh', 'laughed', 'cry', 'cried', 'feel', 'felt']
  };
  
  Object.entries(actionVerbs).forEach(([category, verbs]) => {
    verbs.forEach(verb => {
      if (lowercaseSentence.includes(` ${verb} `) || 
          lowercaseSentence.endsWith(` ${verb}`) || 
          lowercaseSentence.startsWith(`${verb} `)) {
        actions.push({
          type: category,
          verb: verb
        });
      }
    });
  });
  
  // Add default action if none found
  if (actions.length === 0) {
    actions.push({
      type: 'observation',
      verb: 'looked'
    });
  }
  
  // Extract objects
  const objects = [];
  const commonObjects = {
    toys: ['ball', 'toy', 'game', 'doll', 'block', 'puzzle', 'kite'],
    school: ['book', 'pencil', 'crayon', 'paper', 'backpack', 'computer', 'notebook'],
    furniture: ['chair', 'desk', 'table', 'bed', 'couch', 'sofa'],
    food: ['apple', 'banana', 'cookie', 'sandwich', 'ice cream', 'cake', 'fruit'],
    vehicles: ['car', 'bike', 'bicycle', 'bus', 'train', 'truck', 'boat'],
    nature: ['tree', 'flower', 'plant', 'rock', 'leaf', 'stick', 'sand']
  };
  
  Object.entries(commonObjects).forEach(([category, items]) => {
    items.forEach(item => {
      if (lowercaseSentence.includes(item)) {
        objects.push({
          type: category,
          name: item
        });
      }
    });
  });
  
  // Extract weather/time
  let timeOfDay = 'day';  // default
  if (lowercaseSentence.includes('night') || lowercaseSentence.includes('dark')) {
    timeOfDay = 'night';
  } else if (lowercaseSentence.includes('morning')) {
    timeOfDay = 'morning';
  } else if (lowercaseSentence.includes('evening') || lowercaseSentence.includes('sunset')) {
    timeOfDay = 'evening';
  }
  
  let weather = 'clear';  // default
  if (lowercaseSentence.includes('rain') || lowercaseSentence.includes('wet')) {
    weather = 'rainy';
  } else if (lowercaseSentence.includes('snow') || lowercaseSentence.includes('cold')) {
    weather = 'snowy';
  } else if (lowercaseSentence.includes('cloud')) {
    weather = 'cloudy';
  }
  
  // Extract colors mentioned
  const colors = [];
  const colorTerms = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 
                      'brown', 'black', 'white', 'gray', 'silver', 'gold'];
  
  colorTerms.forEach(color => {
    if (lowercaseSentence.includes(color)) {
      colors.push(color);
    }
  });
  
  // Extract emotions
  let emotion = 'neutral';  // default
  const emotions = {
    happy: ['happy', 'glad', 'excited', 'joy', 'laugh', 'smile', 'fun'],
    sad: ['sad', 'upset', 'unhappy', 'cry', 'tear'],
    scared: ['scared', 'afraid', 'frightened', 'nervous', 'worry'],
    angry: ['angry', 'mad', 'upset', 'frustrated'],
    surprised: ['surprised', 'amazed', 'shocked', 'wonder']
  };
  
  Object.entries(emotions).forEach(([emo, terms]) => {
    if (terms.some(term => lowercaseSentence.includes(term))) {
      emotion = emo;
    }
  });
  
  return {
    location,
    characters,
    actions,
    objects,
    timeOfDay,
    weather,
    colors,
    emotion
  };
};

// Color palette system for consistent visuals
const colorPalettes = {
  default: {
    primary: '#4F46E5',    // Indigo primary
    secondary: '#10B981',  // Emerald secondary
    accent: '#F59E0B',     // Amber accent
    background: '#F3F4F6', // Light gray background
    text: '#1F2937',       // Dark gray text
    // Character colors
    skin: {
      light: '#FFEDD5',    // Light skin tone
      medium: '#F59E0B',   // Medium skin tone
      dark: '#92400E'      // Dark skin tone
    },
    hair: {
      blonde: '#FDE68A',
      brown: '#92400E',
      black: '#1F2937',
      red: '#DC2626'
    }
  },
  accessible: {
    // High contrast palette for visual accessibility
    primary: '#0000FF',    // Blue
    secondary: '#FF0000',  // Red
    accent: '#FFFF00',     // Yellow
    background: '#FFFFFF', // White
    text: '#000000',       // Black
    skin: {
      light: '#FFE4C4',
      medium: '#CD853F',
      dark: '#8B4513'
    },
    hair: {
      blonde: '#FFD700',
      brown: '#8B4513',
      black: '#000000',
      red: '#FF0000'
    }
  },
  nightMode: {
    // Dark theme for evening/night scenes
    primary: '#818CF8',    // Light indigo
    secondary: '#34D399',  // Light emerald
    accent: '#FBBF24',     // Light amber
    background: '#1F2937', // Dark blue-gray
    text: '#F9FAFB',       // White
    skin: {
      light: '#FFEDD5',
      medium: '#F59E0B',
      dark: '#92400E'
    },
    hair: {
      blonde: '#FDE68A',
      brown: '#92400E',
      black: '#1F2937',
      red: '#DC2626'
    }
  }
};

// Choose a random item from an array
const randomChoice = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to get a specific palette
const getPalette = (learning = {}) => {
  if (learning.visualProcessing) {
    return colorPalettes.accessible;
  }
  return colorPalettes.default;
};

/**
 * Generate location background for SVG
 * @param {string} location - The location name
 * @param {object} options - Additional options (timeOfDay, weather, etc)
 * @returns {string} - SVG elements for the background
 */
const generateBackground = (location, options = {}) => {
  const { timeOfDay = 'day', weather = 'clear', learning = {} } = options;
  const width = 400;
  const height = 200;
  const palette = getPalette(learning);
  
  // Common sky and ground elements
  let sky = '';
  let ground = '';
  
  // Set sky color based on time of day
  if (timeOfDay === 'day') {
    sky = `<rect width="${width}" height="${height}" fill="#90CAF9"/>`;
  } else if (timeOfDay === 'night') {
    sky = `<rect width="${width}" height="${height}" fill="#1A237E"/>`;
  } else if (timeOfDay === 'morning') {
    sky = `
      <defs>
        <linearGradient id="morningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FF9800"/>
          <stop offset="100%" stop-color="#90CAF9"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#morningGradient)"/>
    `;
  } else if (timeOfDay === 'evening') {
    sky = `
      <defs>
        <linearGradient id="eveningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FF3D00"/>
          <stop offset="100%" stop-color="#4A148C"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#eveningGradient)"/>
    `;
  }
  
  // Set ground based on location
  switch (location) {
    case 'park':
      ground = `<rect width="${width}" height="70" y="130" fill="#66BB6A" />`;
      break;
    case 'beach':
      ground = `<rect width="${width}" height="70" y="130" fill="#FFECB3" />`;
      break;
    case 'school':
      ground = `<rect width="${width}" height="70" y="130" fill="#BDBDBD" />`;
      break;
    default:
      ground = `<rect width="${width}" height="70" y="130" fill="#A5D6A7" />`;
  }
  
  // Add sun/moon based on time of day
  let celestialBody = '';
  if (timeOfDay === 'day' || timeOfDay === 'morning') {
    celestialBody = `<circle cx="350" cy="40" r="20" fill="#FFEB3B" />`;
  } else if (timeOfDay === 'night') {
    celestialBody = `
      <circle cx="350" cy="40" r="15" fill="#F5F5F5" />
      <circle cx="340" cy="35" r="5" fill="#1A237E" />
      <circle cx="355" cy="45" r="3" fill="#1A237E" />
    `;
  } else if (timeOfDay === 'evening') {
    celestialBody = `
      <circle cx="350" cy="40" r="20" fill="#FF9800" />
    `;
  }
  
  // Add weather effects
  let weatherEffects = '';
  if (weather === 'rainy') {
    weatherEffects = `
      <g opacity="0.7">
        ${Array.from({length: 20}).map((_, i) => {
          const x = 30 + Math.random() * 340;
          const y = 20 + Math.random() * 100;
          const length = 10 + Math.random() * 10;
          return `<line x1="${x}" y1="${y}" x2="${x-5}" y2="${y+length}" stroke="#90CAF9" stroke-width="2" />`;
        }).join('')}
      </g>
    `;
  } else if (weather === 'cloudy') {
    weatherEffects = `
      <g>
        <ellipse cx="100" cy="60" rx="30" ry="20" fill="#E0E0E0" />
        <ellipse cx="130" cy="50" rx="25" ry="15" fill="#E0E0E0" />
        <ellipse cx="70" cy="55" rx="20" ry="15" fill="#E0E0E0" />
        <ellipse cx="280" cy="40" rx="35" ry="20" fill="#E0E0E0" />
        <ellipse cx="310" cy="30" rx="25" ry="15" fill="#E0E0E0" />
        <ellipse cx="250" cy="35" rx="20" ry="15" fill="#E0E0E0" />
      </g>
    `;
  } else if (weather === 'snowy') {
    weatherEffects = `
      <g>
        ${Array.from({length: 30}).map((_, i) => {
          const x = 20 + Math.random() * 360;
          const y = 20 + Math.random() * 120;
          const size = 1 + Math.random() * 3;
          return `<circle cx="${x}" cy="${y}" r="${size}" fill="white" />`;
        }).join('')}
      </g>
      <rect width="${width}" height="70" y="130" fill="white" />
    `;
  }
  
  // Location-specific backgrounds
  switch (location) {
    case 'park':
      return `
        ${sky}
        ${weatherEffects}
        ${celestialBody}
        ${ground}
        
        <!-- Trees -->
        <path d="M80,130 L80,90 Q50,90 65,60 Q80,30 95,60 Q110,90 80,90" fill="#2E7D32" />
        <rect x="75" y="130" width="10" height="20" fill="#795548" />
        
        <path d="M200,130 L200,90 Q170,90 185,60 Q200,30 215,60 Q230,90 200,90" fill="#2E7D32" />
        <rect x="195" y="130" width="10" height="20" fill="#795548" />
        
        <path d="M330,130 L330,100 Q310,100 320,80 Q330,60 340,80 Q350,100 330,100" fill="#2E7D32" />
        <rect x="325" y="130" width="10" height="15" fill="#795548" />
        
        <!-- Bushes -->
        <ellipse cx="120" cy="140" rx="25" ry="15" fill="#388E3C" />
        <ellipse cx="280" cy="150" rx="30" ry="20" fill="#388E3C" />
        
        <!-- Path -->
        <path d="M120,200 Q200,130 280,200" fill="none" stroke="#D7CCC8" stroke-width="15" stroke-linecap="round" />
      `;
      
    case 'school':
      return `
        ${sky}
        ${weatherEffects}
        ${celestialBody}
        ${ground}
        
        <!-- School building -->
        <rect x="100" y="50" width="200" height="100" fill="#FFECB3" stroke="#795548" stroke-width="2" />
        <rect x="180" y="100" width="40" height="50" fill="#795548" />
        <rect x="120" y="70" width="30" height="30" fill="#BBDEFB" stroke="#1565C0" stroke-width="1" />
        <rect x="250" y="70" width="30" height="30" fill="#BBDEFB" stroke="#1565C0" stroke-width="1" />
        <path d="M100,50 L200,20 L300,50" fill="#EF5350" stroke="#B71C1C" stroke-width="2" />
        
        <!-- Flag pole -->
        <line x1="330" y1="130" x2="330" y2="70" stroke="#616161" stroke-width="2" />
        <rect x="330" y="70" width="30" height="20" fill="#0D47A1" />
        
        <!-- Playground area -->
        <rect x="30" y="140" width="60" height="20" fill="#FFD54F" />
      `;
      
    case 'home':
      return `
        ${sky}
        ${weatherEffects}
        ${celestialBody}
        ${ground}
        
        <!-- House -->
        <rect x="120" y="70" width="160" height="80" fill="#FFCCBC" stroke="#5D4037" stroke-width="2" />
        <rect x="180" y="110" width="40" height="40" fill="#5D4037" />
        <rect x="140" y="90" width="30" height="30" fill="#BBDEFB" stroke="#1565C0" stroke-width="1" />
        <rect x="230" y="90" width="30" height="30" fill="#BBDEFB" stroke="#1565C0" stroke-width="1" />
        <path d="M120,70 L200,30 L280,70" fill="#FF7043" stroke="#E64A19" stroke-width="2" />
        
        <!-- Chimney -->
        <rect x="250" y="40" width="15" height="30" fill="#795548" />
        <rect x="247" y="40" width="21" height="5" fill="#5D4037" />
        
        <!-- Walkway -->
        <path d="M200,150 L200,180" stroke="#BDBDBD" stroke-width="15" stroke-linecap="round" />
        
        <!-- Yard elements -->
        <ellipse cx="90" cy="150" rx="30" ry="10" fill="#81C784" />
        <ellipse cx="310" cy="150" rx="30" ry="10" fill="#81C784" />
      `;
      
    case 'beach':
      return `
        ${sky}
        ${weatherEffects}
        ${celestialBody}
        
        <!-- Ocean -->
        <rect x="0" y="100" width="${width}" height="100" fill="#29B6F6" />
        <path d="M0,100 Q100,80 200,100 Q300,120 400,100" fill="#29B6F6" stroke="#0288D1" stroke-width="1" />
        
        <!-- Beach sand -->
        <path d="M0,140 Q100,120 150,140 Q200,160 250,140 Q300,120 400,140 L400,200 L0,200 Z" fill="#FFECB3" />
        
        <!-- Waves -->
        <path d="M0,110 Q30,105 60,110 Q90,115 120,110" fill="none" stroke="#B3E5FC" stroke-width="2" />
        <path d="M150,115 Q180,110 210,115 Q240,120 270,115" fill="none" stroke="#B3E5FC" stroke-width="2" />
        <path d="M280,112 Q310,107 340,112 Q370,117 400,112" fill="none" stroke="#B3E5FC" stroke-width="2" />
        
        <!-- Beach umbrella -->
        <line x1="300" y1="160" x2="300" y2="130" stroke="#795548" stroke-width="3" />
        <path d="M270,130 Q300,110 330,130" fill="#EF5350" stroke="#B71C1C" stroke-width="1" />
        
        <!-- Beach ball -->
        <circle cx="100" cy="150" r="10" fill="#FFFFFF" stroke="#4CAF50" stroke-width="1" />
        <path d="M90,150 Q100,140 110,150" fill="none" stroke="#F44336" stroke-width="1" />
        <path d="M90,150 Q100,160 110,150" fill="none" stroke="#2196F3" stroke-width="1" />
      `;
      
    case 'zoo':
      return `
        ${sky}
        ${weatherEffects}
        ${celestialBody}
        ${ground}
        
        <!-- Zoo entrance -->
        <rect x="150" y="60" width="100" height="70" fill="#A1887F" stroke="#5D4037" stroke-width="2" />
        <rect x="185" y="90" width="30" height="40" fill="#5D4037" />
        <path d="M150,60 L200,40 L250,60" fill="#8D6E63" stroke="#5D4037" stroke-width="2" />
        <text x="170" y="80" font-family="Arial" font-size="12" fill="#FFFFFF">ZOO</text>
        
        <!-- Enclosures -->
        <rect x="30" y="100" width="80" height="50" fill="none" stroke="#795548" stroke-width="2" rx="5" />
        <rect x="290" y="100" width="80" height="50" fill="none" stroke="#795548" stroke-width="2" rx="5" />
        
        <!-- Path -->
        <path d="M200,130 L200,180" stroke="#BDBDBD" stroke-width="20" stroke-linecap="round" />
        <path d="M200,130 Q100,150 70,130" stroke="#BDBDBD" stroke-width="10" stroke-linecap="round" />
        <path d="M200,130 Q300,150 330,130" stroke="#BDBDBD" stroke-width="10" stroke-linecap="round" />
        
        <!-- Trees -->
        <circle cx="40" cy="80" r="15" fill="#388E3C" />
        <line x1="40" y1="80" x2="40" y2="100" stroke="#5D4037" stroke-width="3" />
        <circle cx="360" cy="80" r="15" fill="#388E3C" />
        <line x1="360" y1="80" x2="360" y2="100" stroke="#5D4037" stroke-width="3" />
      `;
      
    case 'store':
      return `
        ${sky}
        ${weatherEffects}
        ${celestialBody}
        ${ground}
        
        <!-- Store building -->
        <rect x="100" y="50" width="200" height="100" fill="#E0E0E0" stroke="#616161" stroke-width="2" />
        <rect x="170" y="110" width="60" height="40" fill="#9E9E9E" />
        <rect x="120" y="70" width="40" height="30" fill="#BBDEFB" stroke="#1565C0" stroke-width="1" />
        <rect x="240" y="70" width="40" height="30" fill="#BBDEFB" stroke="#1565C0" stroke-width="1" />
        
        <!-- Store sign -->
        <rect x="140" y="40" width="120" height="20" fill="#4CAF50" />
        <text x="173" y="55" font-family="Arial" font-size="12" fill="#FFFFFF">STORE</text>
        
        <!-- Parking lot -->
        <rect x="30" y="150" width="60" height="20" fill="#424242" />
        <rect x="310" y="150" width="60" height="20" fill="#424242" />
        <line x1="60" y1="150" x2="60" y2="170" stroke="#FFFFFF" stroke-width="1" />
        <line x1="340" y1="150" x2="340" y2="170" stroke="#FFFFFF" stroke-width="1" />
      `;
      
    default:
      return `
        ${sky}
        ${weatherEffects}
        ${celestialBody}
        ${ground}
      `;
  }
};

/**
 * Generate character for SVG
 * @param {object} character - Character specification
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {object} options - Additional options like emotion
 * @returns {string} - SVG elements for the character
 */
const generateCharacter = (character, x, y, options = {}) => {
  const { emotion = 'neutral', learning = {} } = options;
  const palette = getPalette(learning);
  
  // Get random skin and hair colors
  const skinColors = Object.values(palette.skin);
  const hairColors = Object.values(palette.hair);
  const skinColor = randomChoice(skinColors);
  const hairColor = randomChoice(hairColors);
  
  switch (character.type) {
    case 'child': {
      // Create character with more diverse appearance
      const hairStyles = [
        // Short hair
        `
          <path d="M${x-15},${y-16} Q${x},${y-30} ${x+15},${y-16}" fill="${hairColor}" />
          <path d="M${x-15},${y-16} Q${x-10},${y-14} ${x-10},${y-10}" fill="${hairColor}" />
          <path d="M${x+15},${y-16} Q${x+10},${y-14} ${x+10},${y-10}" fill="${hairColor}" />
        `,
        // Long hair
        `
          <path d="M${x-15},${y-16} Q${x},${y-30} ${x+15},${y-16}" fill="${hairColor}" />
          <path d="M${x-15},${y-16} Q${x-15},${y-5} ${x-15},${y+5}" fill="${hairColor}" />
          <path d="M${x+15},${y-16} Q${x+15},${y-5} ${x+15},${y+5}" fill="${hairColor}" />
        `,
        // Curly hair
        `
          <path d="M${x-15},${y-16} Q${x},${y-30} ${x+15},${y-16}" fill="${hairColor}" />
          <circle cx="${x-12}" cy="${y-12}" r="4" fill="${hairColor}" />
          <circle cx="${x-5}" cy="${y-18}" r="4" fill="${hairColor}" />
          <circle cx="${x+5}" cy="${y-18}" r="4" fill="${hairColor}" />
          <circle cx="${x+12}" cy="${y-12}" r="4" fill="${hairColor}" />
        `
      ];
      
      // Emotions for face
      let face = '';
      if (emotion === 'happy') {
        face = `
          <circle cx="${x-5}" cy="${y-5}" r="2" fill="#1F2937" />
          <circle cx="${x+5}" cy="${y-5}" r="2" fill="#1F2937" />
          <path d="M${x-8},${y+5} Q${x},${y+10} ${x+8},${y+5}" stroke="#1F2937" stroke-width="1.5" fill="none" />
        `;
      } else if (emotion === 'sad') {
        face = `
          <circle cx="${x-5}" cy="${y-5}" r="2" fill="#1F2937" />
          <circle cx="${x+5}" cy="${y-5}" r="2" fill="#1F2937" />
          <path d="M${x-8},${y+8} Q${x},${y+3} ${x+8},${y+8}" stroke="#1F2937" stroke-width="1.5" fill="none" />
        `;
      } else if (emotion === 'surprised') {
        face = `
          <circle cx="${x-5}" cy="${y-5}" r="2" fill="#1F2937" />
          <circle cx="${x+5}" cy="${y-5}" r="2" fill="#1F2937" />
          <circle cx="${x}" cy="${y+5}" r="3" fill="#1F2937" />
        `;
      } else {
        face = `
          <circle cx="${x-5}" cy="${y-5}" r="2" fill="#1F2937" />
          <circle cx="${x+5}" cy="${y-5}" r="2" fill="#1F2937" />
          <path d="M${x-5},${y+5} L${x+5},${y+5}" stroke="#1F2937" stroke-width="1.5" />
        `;
      }
      
      // Random clothing colors
      const shirtColor = randomChoice(['#EF5350', '#42A5F5', '#66BB6A', '#FFEE58', '#AB47BC']);
      const pantsColor = randomChoice(['#1565C0', '#1B5E20', '#37474F', '#6D4C41', '#6A1B9A']);
      
      // Create the child character
      return `
        <!-- Child character at ${x},${y} -->
        <g>
          <!-- Head -->
          <circle cx="${x}" cy="${y-10}" r="15" fill="${skinColor}" stroke="#5D4037" stroke-width="1" />
          
          <!-- Hair -->
          ${randomChoice(hairStyles)}
          
          <!-- Face -->
          ${face}
          
          <!-- Body -->
          <rect x="${x-15}" y="${y+5}" width="30" height="30" rx="2" fill="${shirtColor}" stroke="${learning.visualProcessing ? '#000000' : '#303F9F'}" stroke-width="1" />
          
          <!-- Arms -->
          <rect x="${x-25}" y="${y+10}" width="10" height="20" rx="5" fill="${skinColor}" />
          <rect x="${x+15}" y="${y+10}" width="10" height="20" rx="5" fill="${skinColor}" />
          
          <!-- Legs -->
          <rect x="${x-15}" y="${y+35}" width="10" height="20" fill="${pantsColor}" />
          <rect x="${x+5}" y="${y+35}" width="10" height="20" fill="${pantsColor}" />
          
          <!-- Shoes -->
          <rect x="${x-18}" y="${y+55}" width="13" height="5" rx="2" fill="#37474F" />
          <rect x="${x+5}" y="${y+55}" width="13" height="5" rx="2" fill="#37474F" />
        </g>
      `;
    }
    
    case 'person': {
      // Determine if it's an adult
      const isAdult = ['teacher', 'mom', 'dad', 'mother', 'father', 'man', 'woman', 'grandma', 'grandpa'].includes(character.role);
      const height = isAdult ? 0 : 10; // Adults are taller (lower y value)
      
      // Determine clothing based on role
      let clothingColor = randomChoice(['#3949AB', '#D32F2F', '#00796B', '#7B1FA2']);
      if (character.role === 'teacher') {
        clothingColor = '#1976D2'; // Blue for teacher
      } else if (['mom', 'mother', 'woman', 'grandma'].includes(character.role)) {
        clothingColor = randomChoice(['#AD1457', '#6A1B9A', '#00796B']); // Colors for women
      } else if (['dad', 'father', 'man', 'grandpa'].includes(character.role)) {
        clothingColor = randomChoice(['#1565C0', '#0D47A1', '#1B5E20']); // Colors for men
      }
      
      // Emotions for face
      let face = '';
      if (emotion === 'happy') {
        face = `
          <circle cx="${x-5}" cy="${y-5+height}" r="2" fill="#1F2937" />
          <circle cx="${x+5}" cy="${y-5+height}" r="2" fill="#1F2937" />
          <path d="M${x-8},${y+5+height} Q${x},${y+10+height} ${x+8},${y+5+height}" stroke="#1F2937" stroke-width="1.5" fill="none" />
        `;
      } else if (emotion === 'sad') {
        face = `
          <circle cx="${x-5}" cy="${y-5+height}" r="2" fill="#1F2937" />
          <circle cx="${x+5}" cy="${y-5+height}" r="2" fill="#1F2937" />
          <path d="M${x-8},${y+8+height} Q${x},${y+3+height} ${x+8},${y+8+height}" stroke="#1F2937" stroke-width="1.5" fill="none" />
        `;
      } else {
        face = `
          <circle cx="${x-5}" cy="${y-5+height}" r="2" fill="#1F2937" />
          <circle cx="${x+5}" cy="${y-5+height}" r="2" fill="#1F2937" />
          <path d="M${x-5},${y+5+height} L${x+5},${y+5+height}" stroke="#1F2937" stroke-width="1.5" />
        `;
      }
      
      // Adult specifics
      let adultSpecifics = '';
      if (isAdult) {
        // Add glasses, facial hair, or other adult features
        if (Math.random() > 0.7) { // 30% chance for glasses
          adultSpecifics = `
            <path d="M${x-12},${y-5+height} L${x-5},${y-5+height}" stroke="#1F2937" stroke-width="1" fill="none" />
            <path d="M${x+5},${y-5+height} L${x+12},${y-5+height}" stroke="#1F2937" stroke-width="1" fill="none" />
            <circle cx="${x-8}" cy="${y-5+height}" r="5" stroke="#1F2937" stroke-width="1" fill="none" />
            <circle cx="${x+8}" cy="${y-5+height}" r="5" stroke="#1F2937" stroke-width="1" fill="none" />
          `;
        }
        
        // For older characters, add aging features
        if (['grandma', 'grandpa'].includes(character.role)) {
          adultSpecifics += `
            <path d="M${x-10},${y-15+height} Q${x},${y-18+height} ${x+10},${y-15+height}" stroke="${hairColor}" stroke-width="1" fill="none" />
            <path d="M${x-12},${y-10+height} L${x-10},${y-12+height}" stroke="#1F2937" stroke-width="0.5" fill="none" />
            <path d="M${x+12},${y-10+height} L${x+10},${y-12+height}" stroke="#1F2937" stroke-width="0.5" fill="none" />
          `;
        }
      }
      
      // Create the person character
      return `
        <!-- Person character at ${x},${y} -->
        <g>
          <!-- Head -->
          <circle cx="${x}" cy="${y-10+height}" r="15" fill="${skinColor}" stroke="#5D4037" stroke-width="1" />
          
          <!-- Hair -->
          <path d="M${x-15},${y-16+height} Q${x},${y-28+height} ${x+15},${y-16+height}" fill="${hairColor}" />
          <path d="M${x-15},${y-16+height} Q${x-17},${y-10+height} ${x-15},${y-5+height}" fill="${hairColor}" />
          <path d="M${x+15},${y-16+height} Q${x+17},${y-10+height} ${x+15},${y-5+height}" fill="${hairColor}" />
          
          <!-- Face -->
          ${face}
          
          <!-- Adult-specific features -->
          ${adultSpecifics}
          
          <!-- Body -->
          <rect x="${x-15}" y="${y+5+height}" width="30" height="${isAdult ? 35 : 30}" rx="2" fill="${clothingColor}" stroke="${learning.visualProcessing ? '#000000' : '#303F9F'}" stroke-width="1" />
          
          <!-- Arms -->
          <rect x="${x-25}" y="${y+10+height}" width="10" height="${isAdult ? 25 : 20}" rx="5" fill="${skinColor}" />
          <rect x="${x+15}" y="${y+10+height}" width="10" height="${isAdult ? 25 : 20}" rx="5" fill="${skinColor}" />
          
          <!-- Legs -->
          <rect x="${x-15}" y="${y+40+height}" width="10" height="${isAdult ? 25 : 20}" fill="#424242" />
          <rect x="${x+5}" y="${y+40+height}" width="10" height="${isAdult ? 25 : 20}" fill="#424242" />
          
          <!-- Shoes -->
          <rect x="${x-18}" y="${y+65+height}" width="13" height="5" rx="2" fill="#212121" />
          <rect x="${x+5}" y="${y+65+height}" width="13" height="5" rx="2" fill="#212121" />
        </g>
      `;
    }
    
    case 'animal': {
      const species = character.species || 'dog';
      
      switch (species) {
        case 'dog':
          return `
            <!-- Dog character at ${x},${y} -->
            <g>
              <!-- Body -->
              <ellipse cx="${x}" cy="${y+40}" rx="25" ry="15" fill="#A1887F" stroke="#5D4037" stroke-width="1" />
              
              <!-- Head -->
              <circle cx="${x-15}" cy="${y+25}" r="12" fill="#A1887F" stroke="#5D4037" stroke-width="1" />
              
              <!-- Face -->
              <circle cx="${x-20}" cy="${y+22}" r="2" fill="#5D4037" />
              <circle cx="${x-10}" cy="${y+22}" r="2" fill="#5D4037" />
              <ellipse cx="${x-15}" cy="${y+28}" rx="3" ry="2" fill="#5D4037" />
              
              <!-- Ears -->
              <path d="M${x-25},${y+15} L${x-32},${y+10} L${x-28},${y+20}" fill="#A1887F" />
              <path d="M${x-5},${y+15} L${x+2},${y+10} L${x-2},${y+20}" fill="#A1887F" />
              
              <!-- Tail -->
              <path d="M${x+20},${y+40} Q${x+35},${y+20} ${x+35},${y+30}" stroke="#A1887F" stroke-width="5" stroke-linecap="round" fill="none" />
              
              <!-- Legs -->
              <rect x="${x-25}" y="${y+45}" width="8" height="15" rx="3" fill="#A1887F" />
              <rect x="${x-5}" y="${y+45}" width="8" height="15" rx="3" fill="#A1887F" />
              <rect x="${x+10}" y="${y+45}" width="8" height="15" rx="3" fill="#A1887F" />
              <rect x="${x+20}" y="${y+45}" width="8" height="15" rx="3" fill="#A1887F" />
            </g>
          `;
          
        case 'cat':
          return `
            <!-- Cat character at ${x},${y} -->
            <g>
              <!-- Body -->
              <ellipse cx="${x}" cy="${y+40}" rx="20" ry="12" fill="#BDBDBD" stroke="#757575" stroke-width="1" />
              
              <!-- Head -->
              <circle cx="${x-10}" cy="${y+25}" r="10" fill="#BDBDBD" stroke="#757575" stroke-width="1" />
              
              <!-- Face -->
              <circle cx="${x-13}" cy="${y+22}" r="2" fill="#424242" />
              <circle cx="${x-7}" cy="${y+22}" r="2" fill="#424242" />
              <ellipse cx="${x-10}" cy="${y+27}" rx="2" ry="1" fill="#424242" />
              
              <!-- Ears -->
              <path d="M${x-18},${y+18} L${x-25},${y+10} L${x-15},${y+15}" fill="#BDBDBD" />
              <path d="M${x-2},${y+18} L${x+5},${y+10} L${x-5},${y+15}" fill="#BDBDBD" />
              
              <!-- Tail -->
              <path d="M${x+15},${y+40} Q${x+35},${y+20} ${x+30},${y+35}" stroke="#BDBDBD" stroke-width="3" fill="none" />
              
              <!-- Legs -->
              <rect x="${x-18}" y="${y+45}" width="5" height="12" rx="2" fill="#BDBDBD" />
              <rect x="${x-5}" y="${y+45}" width="5" height="12" rx="2" fill="#BDBDBD" />
              <rect x="${x+5}" y="${y+45}" width="5" height="12" rx="2" fill="#BDBDBD" />
              <rect x="${x+15}" y="${y+45}" width="5" height="12" rx="2" fill="#BDBDBD" />
            </g>
          `;
          
        case 'bird':
          return `
            <!-- Bird character at ${x},${y} -->
            <g>
              <!-- Body -->
              <ellipse cx="${x}" cy="${y+30}" rx="15" ry="10" fill="#42A5F5" stroke="#1976D2" stroke-width="1" />
              
              <!-- Head -->
              <circle cx="${x+10}" cy="${y+25}" r="8" fill="#42A5F5" stroke="#1976D2" stroke-width="1" />
              
              <!-- Face -->
              <circle cx="${x+13}" cy="${y+22}" r="2" fill="#212121" />
              <path d="M${x+15},${y+22} L${x+22},${y+20} L${x+18},${y+25}" fill="#FFC107" />
              
              <!-- Wings -->
              <path d="M${x-5},${y+25} L${x-15},${y+15} L${x-5},${y+20}" fill="#90CAF9" stroke="#1976D2" stroke-width="1" />
              
              <!-- Tail -->
              <path d="M${x-15},${y+30} L${x-25},${y+25} L${x-25},${y+35}" fill="#90CAF9" stroke="#1976D2" stroke-width="1" />
              
              <!-- Legs -->
              <path d="M${x},${y+40} L${x},${y+45}" stroke="#FFC107" stroke-width="2" stroke-linecap="round" />
              <path d="M${x+5},${y+40} L${x+5},${y+45}" stroke="#FFC107" stroke-width="2" stroke-linecap="round" />
            </g>
          `;
          
        case 'rabbit':
          return `
            <!-- Rabbit character at ${x},${y} -->
            <g>
              <!-- Body -->
              <ellipse cx="${x}" cy="${y+40}" rx="15" ry="12" fill="#F5F5F5" stroke="#E0E0E0" stroke-width="1" />
              
              <!-- Head -->
              <circle cx="${x}" cy="${y+25}" r="10" fill="#F5F5F5" stroke="#E0E0E0" stroke-width="1" />
              
              <!-- Face -->
              <circle cx="${x-3}" cy="${y+22}" r="1.5" fill="#424242" />
              <circle cx="${x+3}" cy="${y+22}" r="1.5" fill="#424242" />
              <ellipse cx="${x}" cy="${y+26}" rx="2" ry="1" fill="#F48FB1" />
              
              <!-- Ears -->
              <ellipse cx="${x-5}" cy="${y+10}" rx="3" ry="10" fill="#F5F5F5" stroke="#E0E0E0" stroke-width="1" />
              <ellipse cx="${x+5}" cy="${y+10}" rx="3" ry="10" fill="#F5F5F5" stroke="#E0E0E0" stroke-width="1" />
              <ellipse cx="${x-5}" cy="${y+10}" rx="1.5" ry="8" fill="#FFECB3" />
              <ellipse cx="${x+5}" cy="${y+10}" rx="1.5" ry="8" fill="#FFECB3" />
              
              <!-- Tail -->
              <circle cx="${x+12}" cy="${y+40}" r="4" fill="#F5F5F5" stroke="#E0E0E0" stroke-width="1" />
              
              <!-- Legs -->
              <ellipse cx="${x-8}" cy="${y+50}" rx="3" ry="5" fill="#F5F5F5" />
              <ellipse cx="${x+8}" cy="${y+50}" rx="3" ry="5" fill="#F5F5F5" />
              <ellipse cx="${x-4}" cy="${y+50}" rx="2" ry="3" fill="#F5F5F5" />
              <ellipse cx="${x+4}" cy="${y+50}" rx="2" ry="3" fill="#F5F5F5" />
            </g>
          `;
          
        case 'fish':
          return `
            <!-- Fish character at ${x},${y} -->
            <g>
              <!-- Body -->
              <ellipse cx="${x}" cy="${y+30}" rx="15" ry="8" fill="#4FC3F7" stroke="#0288D1" stroke-width="1" />
              
              <!-- Tail -->
              <path d="M${x-15},${y+30} L${x-25},${y+35} L${x-25},${y+25} Z" fill="#4FC3F7" stroke="#0288D1" stroke-width="1" />
              
              <!-- Fins -->
              <path d="M${x},${y+22} L${x+5},${y+15} L${x+10},${y+22}" fill="#4FC3F7" stroke="#0288D1" stroke-width="1" />
              <path d="M${x},${y+38} L${x+5},${y+45} L${x+10},${y+38}" fill="#4FC3F7" stroke="#0288D1" stroke-width="1" />
              
              <!-- Face -->
              <circle cx="${x+10}" cy="${y+28}" r="2" fill="#01579B" />
              <circle cx="${x+10}" cy="${y+32}" r="2" fill="#01579B" />
            </g>
          `;
          
        default:
          // Generic animal shape
          return `
            <!-- Generic animal at ${x},${y} -->
            <g>
              <!-- Body -->
              <ellipse cx="${x}" cy="${y+40}" rx="20" ry="15" fill="#A1887F" stroke="#5D4037" stroke-width="1" />
              
              <!-- Head -->
              <circle cx="${x-10}" cy="${y+25}" r="10" fill="#A1887F" stroke="#5D4037" stroke-width="1" />
              
              <!-- Eyes -->
              <circle cx="${x-13}" cy="${y+22}" r="2" fill="#424242" />
              <circle cx="${x-7}" cy="${y+22}" r="2" fill="#424242" />
              
              <!-- Legs -->
              <rect x="${x-18}" y="${y+45}" width="5" height="12" rx="2" fill="#A1887F" />
              <rect x="${x-5}" y="${y+45}" width="5" height="12" rx="2" fill="#A1887F" />
              <rect x="${x+5}" y="${y+45}" width="5" height="12" rx="2" fill="#A1887F" />
              <rect x="${x+15}" y="${y+45}" width="5" height="12" rx="2" fill="#A1887F" />
            </g>
          `;
      }
    }
    
    default:
      // Fallback generic character
      return `
        <!-- Generic character at ${x},${y} -->
        <g>
          <circle cx="${x}" cy="${y}" r="15" fill="#FFCCBC" stroke="#5D4037" stroke-width="1" />
          <circle cx="${x-5}" cy="${y-5}" r="2" fill="#5D4037" />
          <circle cx="${x+5}" cy="${y-5}" r="2" fill="#5D4037" />
          <path d="M${x-5},${y+5} L${x+5},${y+5}" stroke="#5D4037" stroke-width="1.5" />
          <line x1="${x}" y1="${y+15}" x2="${x}" y2="${y+50}" stroke="#5D4037" stroke-width="2" />
          <line x1="${x}" y1="${y+25}" x2="${x-15}" y2="${y+35}" stroke="#5D4037" stroke-width="2" />
          <line x1="${x}" y1="${y+25}" x2="${x+15}" y2="${y+35}" stroke="#5D4037" stroke-width="2" />
          <line x1="${x}" y1="${y+50}" x2="${x-10}" y2="${y+70}" stroke="#5D4037" stroke-width="2" />
          <line x1="${x}" y1="${y+50}" x2="${x+10}" y2="${y+70}" stroke="#5D4037" stroke-width="2" />
        </g>
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
  if (!objects || objects.length === 0) return '';
  
  let objectsHTML = '';
  
  // Position objects in different areas of the scene
  const positions = [
    { x: 50, y: 140 },  // Left bottom
    { x: 350, y: 140 }, // Right bottom
    { x: 300, y: 100 }, // Right middle
    { x: 100, y: 100 }, // Left middle
    { x: 200, y: 150 }  // Center bottom
  ];
  
  // Distribute objects in different positions
  objects.forEach((obj, index) => {
    const position = positions[index % positions.length];
    const { x, y } = position;
    
    switch (obj.type) {
      case 'toys':
        if (obj.name === 'ball') {
          objectsHTML += `
            <circle cx="${x}" cy="${y}" r="15" fill="#F44336" stroke="#B71C1C" stroke-width="1" />
            <path d="M${x-10},${y} A15,15 0 0,0 ${x+10},${y}" stroke="white" stroke-width="1" fill="none" />
            <path d="M${x},${y-10} A15,15 0 0,0 ${x},${y+10}" stroke="white" stroke-width="1" fill="none" />
          `;
        } else if (obj.name === 'kite') {
          objectsHTML += `
            <path d="M${x-15},${y-15} L${x+15},${y-15} L${x},${y+15} Z" fill="#4CAF50" stroke="#388E3C" stroke-width="1" />
            <line x1="${x}" y1="${y+15}" x2="${x}" y2="${y+30}" stroke="#795548" stroke-width="1" />
            <path d="M${x},${y+15} L${x-10},${y+20} M${x},${y+15} L${x+10},${y+20}" stroke="#795548" stroke-width="1" />
          `;
        } else if (obj.name === 'doll') {
          objectsHTML += `
            <circle cx="${x}" cy="${y-15}" r="8" fill="#FFCCBC" stroke="#5D4037" stroke-width="1" />
            <path d="M${x-3},${y-17} A4,4 0 0,0 ${x+3},${y-17}" stroke="#5D4037" stroke-width="0.5" fill="none" />
            <circle cx="${x-3}" cy="${y-15}" r="1" fill="#5D4037" />
            <circle cx="${x+3}" cy="${y-15}" r="1" fill="#5D4037" />
            <rect x="${x-5}" y="${y-7}" width="10" height="15" fill="#E91E63" stroke="#C2185B" stroke-width="1" />
            <line x1="${x-5}" y1="${y+8}" x2="${x-10}" y2="${y+12}" stroke="#FFCCBC" stroke-width="4" stroke-linecap="round" />
            <line x1="${x+5}" y1="${y+8}" x2="${x+10}" y2="${y+12}" stroke="#FFCCBC" stroke-width="4" stroke-linecap="round" />
            <path d="M${x-3},${y+8} L${x-3},${y+20} M${x+3},${y+8} L${x+3},${y+20}" stroke="#E91E63" stroke-width="4" stroke-linecap="round" />
          `;
        } else {
          // Generic toy
          objectsHTML += `
            <rect x="${x-10}" y="${y-10}" width="20" height="20" rx="2" fill="#FF9800" stroke="#F57C00" stroke-width="1" />
            <circle cx="${x-3}" cy="${y-3}" r="2" fill="#FFF" />
            <circle cx="${x+3}" cy="${y-3}" r="2" fill="#FFF" />
            <path d="M${x-3},${y+3} A5,5 0 0,0 ${x+3},${y+3}" stroke="#FFF" stroke-width="1" fill="none" />
          `;
        }
        break;
        
      case 'school':
        if (obj.name === 'book') {
          objectsHTML += `
            <rect x="${x-15}" y="${y-10}" width="30" height="20" fill="#BBDEFB" stroke="#1565C0" stroke-width="1" />
            <rect x="${x-15}" y="${y-10}" width="5" height="20" fill="#1565C0" />
            <path d="M${x-5},${y-5} L${x+10},${y-5} M${x-5},${y} L${x+5},${y} M${x-5},${y+5} L${x+7},${y+5}" stroke="#1565C0" stroke-width="1" />
          `;
        } else if (obj.name === 'pencil') {
          objectsHTML += `
            <rect x="${x-15}" y="${y-2}" width="25" height="4" fill="#FFC107" />
            <polygon points="${x+10},${y-2} ${x+10},${y+2} ${x+15},${y}" fill="#FF5722" />
            <path d="M${x-15},${y-2} L${x-15},${y+2}" stroke="#5D4037" stroke-width="1" />
          `;
        } else {
          // Generic school item
          objectsHTML += `
            <rect x="${x-10}" y="${y-15}" width="20" height="25" fill="#BBDEFB" stroke="#1565C0" stroke-width="1" />
            <path d="M${x-7},${y-10} L${x+7},${y-10} M${x-7},${y-5} L${x+7},${y-5} M${x-7},${y} L${x+7},${y} M${x-7},${y+5} L${x+7},${y+5}" stroke="#1565C0" stroke-width="1" />
          `;
        }
        break;
        
      case 'food':
        if (obj.name === 'apple') {
          objectsHTML += `
            <circle cx="${x}" cy="${y}" r="10" fill="#F44336" stroke="#D32F2F" stroke-width="1" />
            <path d="M${x},${y-10} C${x+5},${y-13} ${x+10},${y-15} ${x+5},${y-18}" stroke="#795548" stroke-width="1" fill="none" />
            <path d="M${x+2},${y-10} L${x+2},${y-15}" stroke="#4CAF50" stroke-width="1" />
          `;
        } else if (obj.name === 'ice cream') {
          objectsHTML += `
            <path d="M${x-10},${y} L${x},${y+20} L${x+10},${y}" fill="#795548" stroke="#5D4037" stroke-width="1" />
            <path d="M${x-10},${y} A10,10 0 0,1 ${x+10},${y}" fill="#F48FB1" stroke="#EC407A" stroke-width="1" />
            <circle cx="${x-3}" cy="${y-5}" r="3" fill="#F8BBD0" />
            <circle cx="${x+4}" cy="${y-6}" r="2" fill="#F8BBD0" />
          `;
        } else {
          // Generic food
          objectsHTML += `
            <rect x="${x-10}" y="${y-5}" width="20" height="10" rx="2" fill="#FFA000" stroke="#FF6F00" stroke-width="1" />
            <path d="M${x-8},${y} L${x+8},${y}" stroke="#FFF" stroke-width="1" stroke-dasharray="2,2" />
          `;
        }
        break;
        
      case 'vehicles':
        if (obj.name === 'car') {
          objectsHTML += `
            <rect x="${x-20}" y="${y-10}" width="40" height="12" rx="4" fill="#2196F3" stroke="#1565C0" stroke-width="1" />
            <rect x="${x-15}" y="${y-15}" width="30" height="8" rx="2" fill="#64B5F6" stroke="#1565C0" stroke-width="1" />
            <circle cx="${x-10}" cy="${y+2}" r="5" fill="#424242" stroke="#212121" stroke-width="1" />
            <circle cx="${x+10}" cy="${y+2}" r="5" fill="#424242" stroke="#212121" stroke-width="1" />
            <circle cx="${x-10}" cy="${y+2}" r="2" fill="#BDBDBD" />
            <circle cx="${x+10}" cy="${y+2}" r="2" fill="#BDBDBD" />
            <rect x="${x-3}" y="${y-12}" width="6" height="3" fill="#BBDEFB" />
          `;
        } else if (obj.name === 'bike' || obj.name === 'bicycle') {
          objectsHTML += `
            <circle cx="${x-10}" cy="${y}" r="8" fill="none" stroke="#424242" stroke-width="2" />
            <circle cx="${x+10}" cy="${y}" r="8" fill="none" stroke="#424242" stroke-width="2" />
            <path d="M${x-10},${y} L${x},${y-10} L${x+10},${y}" stroke="#F44336" stroke-width="2" fill="none" />
            <path d="M${x},${y-10} L${x},${y-15}" stroke="#F44336" stroke-width="2" />
            <path d="M${x-10},${y} L${x+10},${y}" stroke="#F44336" stroke-width="1" />
          `;
        } else {
          // Generic vehicle
          objectsHTML += `
            <rect x="${x-15}" y="${y-10}" width="30" height="15" rx="3" fill="#9C27B0" stroke="#7B1FA2" stroke-width="1" />
            <rect x="${x-12}" y="${y-15}" width="24" height="5" rx="1" fill="#CE93D8" stroke="#7B1FA2" stroke-width="1" />
            <circle cx="${x-7}" cy="${y+5}" r="4" fill="#424242" />
            <circle cx="${x+7}" cy="${y+5}" r="4" fill="#424242" />
          `;
        }
        break;
        
      case 'nature':
        if (obj.name === 'tree') {
          objectsHTML += `
            <rect x="${x-3}" y="${y-20}" width="6" height="30" fill="#795548" />
            <ellipse cx="${x}" cy="${y-25}" rx="15" ry="20" fill="#4CAF50" stroke="#388E3C" stroke-width="1" />
          `;
        } else if (obj.name === 'flower') {
          objectsHTML += `
            <line x1="${x}" y1="${y}" x2="${x}" y2="${y-15}" stroke="#4CAF50" stroke-width="2" />
            <circle cx="${x}" cy="${y-20}" r="5" fill="#FFC107" stroke="#FF9800" stroke-width="1" />
            <circle cx="${x-5}" cy="${y-25}" r="5" fill="#EF5350" stroke="#D32F2F" stroke-width="1" />
            <circle cx="${x+5}" cy="${y-25}" r="5" fill="#EF5350" stroke="#D32F2F" stroke-width="1" />
            <circle cx="${x-5}" cy="${y-15}" r="5" fill="#EF5350" stroke="#D32F2F" stroke-width="1" />
            <circle cx="${x+5}" cy="${y-15}" r="5" fill="#EF5350" stroke="#D32F2F" stroke-width="1" />
          `;
        } else {
          // Generic nature element
          objectsHTML += `
            <ellipse cx="${x}" cy="${y}" rx="15" ry="10" fill="#4CAF50" stroke="#388E3C" stroke-width="1" />
            <path d="M${x-10},${y} Q${x},${y-5} ${x+10},${y}" stroke="#81C784" stroke-width="1" fill="none" />
          `;
        }
        break;
        
      case 'furniture':
        if (obj.name === 'chair') {
          objectsHTML += `
            <rect x="${x-10}" y="${y-15}" width="20" height="5" fill="#A1887F" stroke="#795548" stroke-width="1" />
            <rect x="${x-10}" y="${y-15}" width="5" height="20" fill="#A1887F" stroke="#795548" stroke-width="1" />
            <rect x="${x+5}" y="${y-15}" width="5" height="20" fill="#A1887F" stroke="#795548" stroke-width="1" />
            <rect x="${x-10}" y="${y-20}" width="20" height="5" fill="#A1887F" stroke="#795548" stroke-width="1" />
          `;
        } else if (obj.name === 'table') {
          objectsHTML += `
            <rect x="${x-15}" y="${y-5}" width="30" height="5" fill="#A1887F" stroke="#795548" stroke-width="1" />
            <rect x="${x-12}" y="${y}" width="4" height="10" fill="#A1887F" stroke="#795548" stroke-width="1" />
            <rect x="${x+8}" y="${y}" width="4" height="10" fill="#A1887F" stroke="#795548" stroke-width="1" />
          `;
        } else {
          // Generic furniture
          objectsHTML += `
            <rect x="${x-15}" y="${y-10}" width="30" height="20" fill="#A1887F" stroke="#795548" stroke-width="1" />
            <rect x="${x-12}" y="${y-7}" width="24" height="3" fill="#8D6E63" />
          `;
        }
        break;
        
      default:
        // Generic object
        objectsHTML += `
          <rect x="${x-10}" y="${y-10}" width="20" height="20" rx="2" fill="#9E9E9E" stroke="#616161" stroke-width="1" />
          <path d="M${x-7},${y} L${x+7},${y} M${x},${y-7} L${x},${y+7}" stroke="#E0E0E0" stroke-width="1" />
        `;
    }
  });
  
  return objectsHTML;
};

/**
 * Create a complete SVG illustration based on a sentence
 * @param {string} sentence - The sentence to illustrate
 * @param {object} options - Additional options like learning needs
 * @returns {string} - Complete SVG code
 */
export const generateEnhancedSVG = (sentence, options = {}) => {
  const { learning = {} } = options;
  
  // Extract key elements from the sentence
  const elements = extractSvgElements(sentence);
  
  // Sanitize sentence for caption (if needed)
  const sanitizedSentence = sanitizeText(sentence);
  
  // Determine if we need an accessible version
  const needsHighContrast = learning.visualProcessing || false;
  
  // Define dimensions of the SVG
  const width = 400;
  const height = 200;
  
  // Base SVG with accessibility attributes
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" 
              ${needsHighContrast ? 'role="img" aria-label="Illustration for: ' + sanitizedSentence + '"' : ''}>`;
  
  // Optional title and description for accessibility
  if (needsHighContrast) {
    svg += `
      <title>Illustration for: ${sanitizedSentence}</title>
      <desc>A visual representation of the sentence: ${sanitizedSentence}</desc>
    `;
  }
  
  // Add background with weather and time of day effects
  svg += generateBackground(elements.location, {
    timeOfDay: elements.timeOfDay,
    weather: elements.weather,
    learning
  });
  
  // Add objects
  svg += generateObjects(elements.objects, elements.location);
  
  // Add characters (positioned differently based on number of characters)
  const characterCount = elements.characters.length;
  
  if (characterCount === 1) {
    // Single character centered
    svg += generateCharacter(
      elements.characters[0],
      width / 2,
      height / 2 - 20,
      { emotion: elements.emotion, learning }
    );
  } else if (characterCount === 2) {
    // Two characters side by side
    svg += generateCharacter(
      elements.characters[0],
      width / 3,
      height / 2 - 20,
      { emotion: elements.emotion, learning }
    );
    svg += generateCharacter(
      elements.characters[1],
      (width / 3) * 2,
      height / 2 - 20,
      { emotion: elements.emotion, learning }
    );
  } else {
    // Multiple characters spread across
    elements.characters.forEach((character, index) => {
      const x = (width / (characterCount + 1)) * (index + 1);
      svg += generateCharacter(
        character,
        x,
        height / 2 - 20,
        { emotion: elements.emotion, learning }
      );
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

const imageGenerationUtils = {
  generateEnhancedSVG,
  svgToDataURL,
  extractSvgElements
};

export default imageGenerationUtils;