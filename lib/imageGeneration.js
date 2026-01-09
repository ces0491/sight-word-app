/**
 * Enhanced SVG Generation for Sight Word Story Generator
 *
 * Features:
 * - Simple, child-friendly illustrations
 * - Diverse character representation (3 skin tones, varied hair/clothing)
 * - Meaningful scene generation based on sentence content
 * - Dynamic weather effects (sunny, rainy, snowy, cloudy, night)
 * - Emotional expressions (happy, sad, angry, surprised, neutral)
 * - 12 animal types (dog, cat, bird, fish, horse, cow, pig, chicken, rabbit, bee, butterfly, duck)
 * - 6 vehicle types (car, bus, bike, train, truck, boat)
 * - 6 locations (school, park, home, beach, library, store)
 * - 21 object types (ball, book, toy, furniture, nature items, etc.)
 * - 9 actions (standing, jumping, running, walking, sitting, playing, reading, eating, sleeping)
 * - Context-aware illustration generation
 * - 100% free - no API costs!
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

  // Add background based on location and weather
  svg += generateBackground(elements.location, elements.weather);

  // Add vehicles (rendered behind characters)
  if (elements.vehicles.length > 0) {
    svg += generateVehicles(elements.vehicles);
  }

  // Add animals
  if (elements.animals.length > 0) {
    svg += generateAnimals(elements.animals);
  }

  // Add characters with emotions
  svg += generateCharacters(elements.characters, elements.action, elements.emotion);

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
  // Handle null/undefined input
  if (!sentence || typeof sentence !== 'string') {
    sentence = '';
  }

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
  if (lowerSentence.includes('eat')) action = 'eating';
  if (lowerSentence.includes('sleep')) action = 'sleeping';

  // Extract animals
  const animals = [];
  const animalTypes = {
    dog: ['dog', 'puppy', 'dogs'],
    cat: ['cat', 'kitten', 'cats'],
    bird: ['bird', 'birds'],
    fish: ['fish'],
    horse: ['horse', 'pony'],
    cow: ['cow', 'cows'],
    pig: ['pig', 'pigs'],
    chicken: ['chicken', 'chick'],
    rabbit: ['rabbit', 'bunny'],
    bee: ['bee', 'bees'],
    butterfly: ['butterfly', 'butterflies'],
    duck: ['duck', 'ducks']
  };

  Object.entries(animalTypes).forEach(([animal, terms]) => {
    if (terms.some(term => lowerSentence.includes(term))) {
      animals.push(animal);
    }
  });

  // Extract weather
  let weather = 'sunny';
  if (lowerSentence.includes('rain') || lowerSentence.includes('rainy')) weather = 'rainy';
  if (lowerSentence.includes('snow') || lowerSentence.includes('snowy')) weather = 'snowy';
  if (lowerSentence.includes('cloud') || lowerSentence.includes('cloudy')) weather = 'cloudy';
  if (lowerSentence.includes('night') || lowerSentence.includes('dark')) weather = 'night';

  // Extract emotion/mood
  let emotion = 'neutral';
  if (lowerSentence.includes('happy') || lowerSentence.includes('glad') || lowerSentence.includes('joy')) emotion = 'happy';
  if (lowerSentence.includes('sad') || lowerSentence.includes('cry')) emotion = 'sad';
  if (lowerSentence.includes('angry') || lowerSentence.includes('mad')) emotion = 'angry';
  if (lowerSentence.includes('surprise') || lowerSentence.includes('wow')) emotion = 'surprised';

  // Extract vehicles
  const vehicles = [];
  const vehicleTypes = {
    car: ['car', 'cars'],
    bus: ['bus', 'buses'],
    bike: ['bike', 'bicycle'],
    train: ['train', 'trains'],
    truck: ['truck', 'trucks'],
    boat: ['boat', 'boats']
  };

  Object.entries(vehicleTypes).forEach(([vehicle, terms]) => {
    if (terms.some(term => lowerSentence.includes(term))) {
      vehicles.push(vehicle);
    }
  });

  // Extract objects
  const objects = [];
  const commonObjects = {
    ball: ['ball', 'balls'],
    book: ['book', 'books'],
    toy: ['toy', 'toys', 'game'],
    pencil: ['pencil', 'pen', 'write', 'writing'],
    apple: ['apple', 'fruit'],
    backpack: ['backpack', 'bag'],
    chair: ['chair', 'chairs'],
    table: ['table', 'desk'],
    door: ['door', 'doors'],
    window: ['window', 'windows'],
    bed: ['bed', 'beds'],
    plate: ['plate', 'dish'],
    cup: ['cup', 'glass'],
    hat: ['hat', 'hats'],
    shoe: ['shoe', 'shoes'],
    coat: ['coat', 'jacket'],
    flower: ['flower', 'flowers'],
    tree: ['tree', 'trees'],
    sun: ['sun', 'sunny'],
    moon: ['moon', 'night'],
    star: ['star', 'stars']
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
    objects,
    animals,
    weather,
    emotion,
    vehicles
  };
};

/**
 * Generate background based on location and weather
 * @param {string} location - The location name
 * @param {string} weather - The weather condition
 * @returns {string} - SVG elements for background
 */
const generateBackground = (location, weather = 'sunny') => {
  // Sky and weather effects based on weather condition
  let sky = '';
  let weatherEffects = '';

  switch(weather) {
    case 'night':
      sky = '<rect width="400" height="200" fill="#191970" />'; // Midnight blue
      weatherEffects = `
        <circle cx="350" cy="50" r="25" fill="#F0E68C" /> <!-- Moon -->
        <circle cx="80" cy="30" r="2" fill="#FFF" /> <!-- Stars -->
        <circle cx="120" cy="50" r="2" fill="#FFF" />
        <circle cx="300" cy="35" r="2" fill="#FFF" />
        <circle cx="250" cy="60" r="2" fill="#FFF" />
        <circle cx="150" cy="25" r="2" fill="#FFF" />
      `;
      break;
    case 'rainy':
      sky = '<rect width="400" height="200" fill="#708090" />'; // Slate gray
      weatherEffects = `
        <!-- Rain drops -->
        <line x1="50" y1="10" x2="45" y2="30" stroke="#4682B4" stroke-width="2" opacity="0.6" />
        <line x1="100" y1="20" x2="95" y2="40" stroke="#4682B4" stroke-width="2" opacity="0.6" />
        <line x1="150" y1="5" x2="145" y2="25" stroke="#4682B4" stroke-width="2" opacity="0.6" />
        <line x1="200" y1="15" x2="195" y2="35" stroke="#4682B4" stroke-width="2" opacity="0.6" />
        <line x1="250" y1="10" x2="245" y2="30" stroke="#4682B4" stroke-width="2" opacity="0.6" />
        <line x1="300" y1="20" x2="295" y2="40" stroke="#4682B4" stroke-width="2" opacity="0.6" />
        <line x1="350" y1="8" x2="345" y2="28" stroke="#4682B4" stroke-width="2" opacity="0.6" />
        <!-- Dark clouds -->
        <ellipse cx="100" cy="40" rx="50" ry="20" fill="#696969" opacity="0.7" />
        <ellipse cx="150" cy="35" rx="40" ry="18" fill="#696969" opacity="0.7" />
        <ellipse cx="300" cy="45" rx="55" ry="22" fill="#696969" opacity="0.7" />
      `;
      break;
    case 'snowy':
      sky = '<rect width="400" height="200" fill="#B0C4DE" />'; // Light steel blue
      weatherEffects = `
        <!-- Snowflakes -->
        <circle cx="50" cy="20" r="3" fill="#FFF" opacity="0.8" />
        <circle cx="100" cy="40" r="3" fill="#FFF" opacity="0.8" />
        <circle cx="150" cy="15" r="3" fill="#FFF" opacity="0.8" />
        <circle cx="200" cy="35" r="3" fill="#FFF" opacity="0.8" />
        <circle cx="250" cy="25" r="3" fill="#FFF" opacity="0.8" />
        <circle cx="300" cy="45" r="3" fill="#FFF" opacity="0.8" />
        <circle cx="350" cy="30" r="3" fill="#FFF" opacity="0.8" />
        <circle cx="80" cy="50" r="3" fill="#FFF" opacity="0.8" />
        <circle cx="320" cy="18" r="3" fill="#FFF" opacity="0.8" />
        <!-- Snow clouds -->
        <ellipse cx="120" cy="35" rx="45" ry="18" fill="#D3D3D3" opacity="0.6" />
        <ellipse cx="280" cy="40" rx="50" ry="20" fill="#D3D3D3" opacity="0.6" />
      `;
      break;
    case 'cloudy':
      sky = '<rect width="400" height="200" fill="#A9C5E0" />'; // Pale blue
      weatherEffects = `
        <!-- Clouds -->
        <ellipse cx="80" cy="40" rx="50" ry="20" fill="#FFF" opacity="0.8" />
        <ellipse cx="120" cy="35" rx="40" ry="18" fill="#FFF" opacity="0.8" />
        <ellipse cx="250" cy="50" rx="55" ry="22" fill="#FFF" opacity="0.8" />
        <ellipse cx="300" cy="45" rx="45" ry="20" fill="#FFF" opacity="0.8" />
      `;
      break;
    default: // sunny
      sky = '<rect width="400" height="200" fill="#87CEEB" />';
      weatherEffects = '<circle cx="350" cy="50" r="30" fill="#FFFF00" />'; // Sun
  }
  
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
  
  return sky + weatherEffects + ground + extras;
};

/**
 * Generate characters based on extracted info
 * @param {Array} characters - Array of character objects
 * @param {string} action - The action being performed
 * @param {string} emotion - The emotion to display
 * @returns {string} - SVG elements for characters
 */
const generateCharacters = (characters, action, emotion = 'neutral') => {
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
        
        <!-- Face with emotion -->
        <circle cx="${x - 5}" cy="${y - 42 + heightAdjust}" r="2" fill="#000" />
        <circle cx="${x + 5}" cy="${y - 42 + heightAdjust}" r="2" fill="#000" />
        ${emotion === 'happy' ?
          `<path d="M${x-5},${y-33+heightAdjust} Q${x},${y-30+heightAdjust} ${x+5},${y-33+heightAdjust}" stroke="#000" stroke-width="1.5" fill="none" />` :
        emotion === 'sad' ?
          `<path d="M${x-5},${y-30+heightAdjust} Q${x},${y-33+heightAdjust} ${x+5},${y-30+heightAdjust}" stroke="#000" stroke-width="1.5" fill="none" />` :
        emotion === 'angry' ?
          `<path d="M${x-5},${y-32+heightAdjust} L${x+5},${y-32+heightAdjust}" stroke="#000" stroke-width="2" />
           <line x1="${x-8}" y1="${y-45+heightAdjust}" x2="${x-3}" y2="${y-43+heightAdjust}" stroke="#000" stroke-width="1.5" />
           <line x1="${x+8}" y1="${y-45+heightAdjust}" x2="${x+3}" y2="${y-43+heightAdjust}" stroke="#000" stroke-width="1.5" />` :
        emotion === 'surprised' ?
          `<ellipse cx="${x}" cy="${y-32+heightAdjust}" rx="4" ry="5" fill="none" stroke="#000" stroke-width="1.5" />` :
          `<path d="M${x-4},${y-32+heightAdjust} L${x+4},${y-32+heightAdjust}" stroke="#000" stroke-width="1" />`
        }
        
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
 * Generate animals based on extracted info
 * @param {Array} animals - Array of animal names
 * @returns {string} - SVG elements for animals
 */
const generateAnimals = (animals) => {
  let svg = '';

  // Position animals
  const positions = [
    { x: 120, y: 150 }, // Left
    { x: 280, y: 150 }  // Right
  ];

  animals.forEach((animal, index) => {
    if (index >= positions.length) return;

    const { x, y } = positions[index];

    switch(animal) {
      case 'dog':
        svg += `
          <!-- Dog -->
          <ellipse cx="${x}" cy="${y}" rx="20" ry="15" fill="#8B4513" />
          <circle cx="${x-8}" cy="${y-10}" r="8" fill="#8B4513" />
          <circle cx="${x-10}" cy="${y-13}" r="2" fill="#000" />
          <ellipse cx="${x-5}" cy="${y-8}" rx="3" ry="2" fill="#000" />
          <ellipse cx="${x-25}" cy="${y-12}" rx="5" ry="8" fill="#8B4513" />
          <ellipse cx="${x+10}" cy="${y-12}" rx="5" ry="8" fill="#8B4513" />
          <line x1="${x+15}" y1="${y}" x2="${x+25}" y2="${y-5}" stroke="#8B4513" stroke-width="3" />
        `;
        break;
      case 'cat':
        svg += `
          <!-- Cat -->
          <ellipse cx="${x}" cy="${y}" rx="18" ry="12" fill="#FF8C00" />
          <circle cx="${x-6}" cy="${y-8}" r="7" fill="#FF8C00" />
          <circle cx="${x-8}" cy="${y-11}" r="2" fill="#000" />
          <polygon points="${x-13},${y-15} ${x-10},${y-10} ${x-8},${y-13}" fill="#FF8C00" />
          <polygon points="${x+3},${y-15} ${x},${y-10} ${x-2},${y-13}" fill="#FF8C00" />
          <line x1="${x+15}" y1="${y-2}" x2="${x+22}" y2="${y+2}" stroke="#FF8C00" stroke-width="2" />
        `;
        break;
      case 'bird':
        svg += `
          <!-- Bird -->
          <ellipse cx="${x}" cy="${y-15}" rx="12" ry="10" fill="#4169E1" />
          <circle cx="${x-5}" cy="${y-17}" r="6" fill="#4169E1" />
          <circle cx="${x-7}" cy="${y-18}" r="2" fill="#000" />
          <polygon points="${x-10},${y-17} ${x-15},${y-17} ${x-12},${y-19}" fill="#FFA500" />
          <path d="M${x-12},${y-10} L${x-25},${y-5}" stroke="#4169E1" stroke-width="2" fill="none" />
          <path d="M${x+12},${y-10} L${x+25},${y-5}" stroke="#4169E1" stroke-width="2" fill="none" />
        `;
        break;
      case 'fish':
        svg += `
          <!-- Fish -->
          <ellipse cx="${x}" cy="${y-10}" rx="18" ry="10" fill="#FF6347" />
          <circle cx="${x+8}" cy="${y-10}" r="2" fill="#000" />
          <polygon points="${x-18},${y-10} ${x-28},${y-18} ${x-28},${y-2}" fill="#FF6347" />
          <path d="M${x},${y-20} L${x+5},${y-10} L${x},${y}" stroke="#FF6347" stroke-width="2" fill="none" />
        `;
        break;
      case 'horse':
        svg += `
          <!-- Horse -->
          <ellipse cx="${x}" cy="${y-5}" rx="25" ry="18" fill="#A0522D" />
          <ellipse cx="${x-15}" cy="${y-18}" rx="10" ry="12" fill="#A0522D" />
          <circle cx="${x-18}" cy="${y-22}" r="2" fill="#000" />
          <polygon points="${x-12},${y-30} ${x-10},${y-25} ${x-14},${y-25}" fill="#8B4513" />
          <rect x="${x-5}" y="${y+10}" width="3" height="15" fill="#A0522D" />
          <rect x="${x+5}" y="${y+10}" width="3" height="15" fill="#A0522D" />
        `;
        break;
      case 'cow':
        svg += `
          <!-- Cow -->
          <ellipse cx="${x}" cy="${y}" rx="25" ry="18" fill="#FFF" stroke="#000" stroke-width="1" />
          <ellipse cx="${x-15}" cy="${y-12}" rx="10" ry="12" fill="#FFF" stroke="#000" stroke-width="1" />
          <circle cx="${x-18}" cy="${y-15}" r="2" fill="#000" />
          <ellipse cx="${x-20}" cy="${y-18}" rx="4" ry="7" fill="#FFF" stroke="#000" stroke-width="1" />
          <ellipse cx="${x-10}" cy="${y-18}" rx="4" ry="7" fill="#FFF" stroke="#000" stroke-width="1" />
          <ellipse cx="${x-5}" cy="${y+3}" rx="8" ry="6" fill="#000" />
          <ellipse cx="${x+10}" cy="${y+3}" rx="8" ry="6" fill="#000" />
        `;
        break;
      case 'pig':
        svg += `
          <!-- Pig -->
          <ellipse cx="${x}" cy="${y}" rx="22" ry="16" fill="#FFB6C1" />
          <circle cx="${x-10}" cy="${y-8}" r="9" fill="#FFB6C1" />
          <circle cx="${x-8}" cy="${y-10}" r="2" fill="#000" />
          <circle cx="${x-10}" cy="${y-5}" r="2" fill="#FF69B4" />
          <circle cx="${x-13}" cy="${y-5}" r="2" fill="#FF69B4" />
          <path d="M${x+20},${y-5} Q${x+25},${y-3} ${x+23},${y}" stroke="#FFB6C1" stroke-width="2" fill="none" />
        `;
        break;
      case 'chicken':
        svg += `
          <!-- Chicken -->
          <ellipse cx="${x}" cy="${y}" rx="15" ry="12" fill="#FFF" stroke="#000" stroke-width="1" />
          <circle cx="${x-8}" cy="${y-8}" r="7" fill="#FFF" stroke="#000" stroke-width="1" />
          <circle cx="${x-10}" cy="${y-10}" r="2" fill="#000" />
          <polygon points="${x-13},${y-8} ${x-18},${y-8} ${x-15},${y-10}" fill="#FFA500" />
          <path d="M${x-8},${y-15} Q${x-5},${y-18} ${x-3},${y-15}" fill="#FF0000" />
          <rect x="${x-3}" y="${y+10}" width="2" height="8" fill="#FFA500" />
          <rect x="${x+3}" y="${y+10}" width="2" height="8" fill="#FFA500" />
        `;
        break;
      case 'rabbit':
        svg += `
          <!-- Rabbit -->
          <circle cx="${x}" cy="${y}" r="12" fill="#D3D3D3" />
          <circle cx="${x-5}" cy="${y-8}" r="8" fill="#D3D3D3" />
          <circle cx="${x-7}" cy="${y-10}" r="2" fill="#000" />
          <ellipse cx="${x-12}" cy="${y-20}" rx="3" ry="12" fill="#D3D3D3" />
          <ellipse cx="${x-5}" cy="${y-20}" rx="3" ry="12" fill="#D3D3D3" />
          <circle cx="${x+10}" cy="${y+5}" r="5" fill="#FFF" />
        `;
        break;
      case 'bee':
        svg += `
          <!-- Bee -->
          <ellipse cx="${x}" cy="${y-15}" rx="10" ry="8" fill="#FFD700" />
          <rect x="${x-10}" y="${y-18}" width="20" height="3" fill="#000" />
          <rect x="${x-10}" y="${y-12}" width="20" height="3" fill="#000" />
          <ellipse cx="${x-12}" cy="${y-15}" rx="8" ry="3" fill="#ADD8E6" opacity="0.5" />
          <ellipse cx="${x+12}" cy="${y-15}" rx="8" ry="3" fill="#ADD8E6" opacity="0.5" />
        `;
        break;
      case 'butterfly':
        svg += `
          <!-- Butterfly -->
          <ellipse cx="${x}" cy="${y-15}" rx="3" ry="10" fill="#000" />
          <ellipse cx="${x-8}" cy="${y-18}" rx="8" ry="10" fill="#FF69B4" stroke="#000" stroke-width="1" />
          <ellipse cx="${x+8}" cy="${y-18}" rx="8" ry="10" fill="#FF69B4" stroke="#000" stroke-width="1" />
          <ellipse cx="${x-8}" cy="${y-8}" rx="6" ry="8" fill="#FF1493" stroke="#000" stroke-width="1" />
          <ellipse cx="${x+8}" cy="${y-8}" rx="6" ry="8" fill="#FF1493" stroke="#000" stroke-width="1" />
          <line x1="${x}" y1="${y-25}" x2="${x-3}" y2="${y-30}" stroke="#000" stroke-width="1" />
          <line x1="${x}" y1="${y-25}" x2="${x+3}" y2="${y-30}" stroke="#000" stroke-width="1" />
        `;
        break;
      case 'duck':
        svg += `
          <!-- Duck -->
          <ellipse cx="${x}" cy="${y}" rx="18" ry="13" fill="#FFD700" />
          <circle cx="${x-10}" cy="${y-8}" r="8" fill="#FFD700" />
          <circle cx="${x-13}" cy="${y-10}" r="2" fill="#000" />
          <ellipse cx="${x-15}" cy="${y-5}" rx="5" ry="3" fill="#FFA500" />
          <rect x="${x-3}" y="${y+10}" width="3" height="5" fill="#FFA500" />
          <rect x="${x+3}" y="${y+10}" width="3" height="5" fill="#FFA500" />
        `;
        break;
    }
  });

  return svg;
};

/**
 * Generate vehicles based on extracted info
 * @param {Array} vehicles - Array of vehicle names
 * @returns {string} - SVG elements for vehicles
 */
const generateVehicles = (vehicles) => {
  let svg = '';

  // Position vehicles
  const positions = [
    { x: 100, y: 160 }, // Left
    { x: 280, y: 160 }  // Right
  ];

  vehicles.forEach((vehicle, index) => {
    if (index >= positions.length) return;

    const { x, y } = positions[index];

    switch(vehicle) {
      case 'car':
        svg += `
          <!-- Car -->
          <rect x="${x-25}" y="${y-10}" width="50" height="20" rx="5" fill="#FF0000" stroke="#000" stroke-width="1" />
          <rect x="${x-15}" y="${y-20}" width="30" height="12" rx="3" fill="#FF0000" stroke="#000" stroke-width="1" />
          <rect x="${x-12}" y="${y-18}" width="10" height="8" fill="#87CEEB" stroke="#000" stroke-width="0.5" />
          <rect x="${x+2}" y="${y-18}" width="10" height="8" fill="#87CEEB" stroke="#000" stroke-width="0.5" />
          <circle cx="${x-15}" cy="${y+10}" r="6" fill="#000" stroke="#696969" stroke-width="2" />
          <circle cx="${x+15}" cy="${y+10}" r="6" fill="#000" stroke="#696969" stroke-width="2" />
        `;
        break;
      case 'bus':
        svg += `
          <!-- Bus -->
          <rect x="${x-35}" y="${y-15}" width="70" height="25" rx="3" fill="#FFD700" stroke="#000" stroke-width="1" />
          <rect x="${x-30}" y="${y-12}" width="12" height="10" fill="#87CEEB" stroke="#000" stroke-width="0.5" />
          <rect x="${x-15}" y="${y-12}" width="12" height="10" fill="#87CEEB" stroke="#000" stroke-width="0.5" />
          <rect x="${x}" y="${y-12}" width="12" height="10" fill="#87CEEB" stroke="#000" stroke-width="0.5" />
          <rect x="${x+15}" y="${y-12}" width="12" height="10" fill="#87CEEB" stroke="#000" stroke-width="0.5" />
          <circle cx="${x-25}" cy="${y+10}" r="6" fill="#000" stroke="#696969" stroke-width="2" />
          <circle cx="${x+25}" cy="${y+10}" r="6" fill="#000" stroke="#696969" stroke-width="2" />
        `;
        break;
      case 'bike':
        svg += `
          <!-- Bike -->
          <circle cx="${x-15}" cy="${y+5}" r="10" fill="none" stroke="#000" stroke-width="2" />
          <circle cx="${x+15}" cy="${y+5}" r="10" fill="none" stroke="#000" stroke-width="2" />
          <line x1="${x-15}" y1="${y+5}" x2="${x}" y2="${y-10}" stroke="#4169E1" stroke-width="2" />
          <line x1="${x}" y1="${y-10}" x2="${x+15}" y2="${y+5}" stroke="#4169E1" stroke-width="2" />
          <line x1="${x}" y1="${y-10}" x2="${x}" y2="${y-5}" stroke="#4169E1" stroke-width="2" />
          <rect x="${x-3}" y="${y-15}" width="6" height="5" rx="1" fill="#8B4513" />
        `;
        break;
      case 'train':
        svg += `
          <!-- Train -->
          <rect x="${x-30}" y="${y-20}" width="60" height="30" rx="5" fill="#4169E1" stroke="#000" stroke-width="1" />
          <rect x="${x-25}" y="${y-15}" width="15" height="12" fill="#87CEEB" stroke="#000" stroke-width="0.5" />
          <rect x="${x-5}" y="${y-15}" width="15" height="12" fill="#87CEEB" stroke="#000" stroke-width="0.5" />
          <circle cx="${x-18}" cy="${y+10}" r="5" fill="#000" stroke="#696969" stroke-width="2" />
          <circle cx="${x-5}" cy="${y+10}" r="5" fill="#000" stroke="#696969" stroke-width="2" />
          <circle cx="${x+8}" cy="${y+10}" r="5" fill="#000" stroke="#696969" stroke-width="2" />
          <rect x="${x+30}" y="${y-25}" width="8" height="8" fill="#FFD700" stroke="#000" stroke-width="1" />
        `;
        break;
      case 'truck':
        svg += `
          <!-- Truck -->
          <rect x="${x-30}" y="${y-15}" width="60" height="25" rx="3" fill="#FF6347" stroke="#000" stroke-width="1" />
          <rect x="${x+10}" y="${y-25}" width="20" height="12" rx="2" fill="#FF6347" stroke="#000" stroke-width="1" />
          <rect x="${x+12}" y="${y-23}" width="8" height="8" fill="#87CEEB" stroke="#000" stroke-width="0.5" />
          <circle cx="${x-15}" cy="${y+10}" r="7" fill="#000" stroke="#696969" stroke-width="2" />
          <circle cx="${x+15}" cy="${y+10}" r="7" fill="#000" stroke="#696969" stroke-width="2" />
        `;
        break;
      case 'boat':
        svg += `
          <!-- Boat -->
          <polygon points="${x-30},${y} ${x+30},${y} ${x+20},${y+15} ${x-20},${y+15}" fill="#8B4513" stroke="#000" stroke-width="1" />
          <rect x="${x-3}" y="${y-30}" width="6" height="30" fill="#8B4513" />
          <polygon points="${x+3},${y-25} ${x+25},${y-15} ${x+3},${y-5}" fill="#FFF" stroke="#000" stroke-width="1" />
          <path d="M${x-30},${y+15} Q${x},${y+18} ${x+30},${y+15}" stroke="#1E90FF" stroke-width="2" fill="none" />
        `;
        break;
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