// SVG illustration generator for story sentences
export const generateSVGIllustration = (sentence) => {
  // Parse the sentence to identify key elements
  const elements = parseStoryElements(sentence);
  
  // Generate SVG based on the elements found
  return createSVG(elements);
};

// Parse the sentence to extract key story elements
const parseStoryElements = (sentence) => {
  const lowerSentence = sentence.toLowerCase();
  
  // Default elements
  const elements = {
    setting: 'indoor', // indoor, outdoor, school, house, bedroom
    characters: [],    // child, adult, boy, girl, man, woman, dog, cat
    actions: [],       // reading, playing, walking, sleeping, eating
    objects: [],       // book, ball, toy, car, house, bed, food
    time: 'day',       // day, night
    emotion: 'happy',  // happy, sad, surprised, angry
  };
  
  // Detect setting
  if (lowerSentence.includes('school')) elements.setting = 'school';
  else if (lowerSentence.includes('park') || lowerSentence.includes('garden')) elements.setting = 'outdoor';
  else if (lowerSentence.includes('bedroom') || lowerSentence.includes('bed')) elements.setting = 'bedroom';
  else if (lowerSentence.includes('kitchen')) elements.setting = 'kitchen';
  else if (lowerSentence.includes('house')) elements.setting = 'house';
  
  // Detect time
  if (lowerSentence.includes('night') || lowerSentence.includes('dark') || 
      lowerSentence.includes('evening') || lowerSentence.includes('bedtime')) {
    elements.time = 'night';
  }
  
  // Detect characters
  if (lowerSentence.includes('boy')) elements.characters.push('boy');
  if (lowerSentence.includes('girl')) elements.characters.push('girl');
  if (lowerSentence.includes('man') || lowerSentence.includes('dad') || 
      lowerSentence.includes('father')) elements.characters.push('man');
  if (lowerSentence.includes('woman') || lowerSentence.includes('mom') || 
      lowerSentence.includes('mother')) elements.characters.push('woman');
  if (lowerSentence.includes('dog')) elements.characters.push('dog');
  if (lowerSentence.includes('cat')) elements.characters.push('cat');
  if (lowerSentence.includes('baby')) elements.characters.push('baby');
  if (lowerSentence.includes('teacher')) elements.characters.push('teacher');
  
  // If no specific characters detected but personal pronouns exist, add generic characters
  if (elements.characters.length === 0) {
    if (lowerSentence.includes('i') || lowerSentence.includes('my') || 
        lowerSentence.includes('we') || lowerSentence.includes('our')) {
      elements.characters.push('child');
    }
    if (lowerSentence.includes('he') || lowerSentence.includes('his')) {
      elements.characters.push('boy');
    }
    if (lowerSentence.includes('she') || lowerSentence.includes('her')) {
      elements.characters.push('girl');
    }
    if (lowerSentence.includes('they') || lowerSentence.includes('their')) {
      elements.characters.push('child');
      elements.characters.push(Math.random() > 0.5 ? 'man' : 'woman');
    }
  }
  
  // Ensure we have at least one character
  if (elements.characters.length === 0) {
    elements.characters.push('child');
  }
  
  // Detect actions
  if (lowerSentence.includes('read') || lowerSentence.includes('book')) elements.actions.push('reading');
  if (lowerSentence.includes('play')) elements.actions.push('playing');
  if (lowerSentence.includes('walk') || lowerSentence.includes('went')) elements.actions.push('walking');
  if (lowerSentence.includes('sleep')) elements.actions.push('sleeping');
  if (lowerSentence.includes('eat') || lowerSentence.includes('food') || 
      lowerSentence.includes('breakfast') || lowerSentence.includes('lunch') || 
      lowerSentence.includes('dinner')) elements.actions.push('eating');
  
  // Default action if none detected
  if (elements.actions.length === 0) {
    elements.actions.push(elements.setting === 'bedroom' ? 'sleeping' : 'standing');
  }
  
  // Detect objects
  if (lowerSentence.includes('book')) elements.objects.push('book');
  if (lowerSentence.includes('ball')) elements.objects.push('ball');
  if (lowerSentence.includes('toy')) elements.objects.push('toy');
  if (lowerSentence.includes('car')) elements.objects.push('car');
  if (lowerSentence.includes('bed')) elements.objects.push('bed');
  if (lowerSentence.includes('food') || lowerSentence.includes('breakfast') || 
      lowerSentence.includes('lunch') || lowerSentence.includes('dinner')) elements.objects.push('food');
  
  // Detect emotion
  if (lowerSentence.includes('happy') || lowerSentence.includes('smile') || 
      lowerSentence.includes('laugh') || lowerSentence.includes('joy')) {
    elements.emotion = 'happy';
  } else if (lowerSentence.includes('sad') || lowerSentence.includes('cry') || 
             lowerSentence.includes('unhappy')) {
    elements.emotion = 'sad';
  } else if (lowerSentence.includes('angry') || lowerSentence.includes('mad')) {
    elements.emotion = 'angry';
  } else if (lowerSentence.includes('surprise') || lowerSentence.includes('shocked')) {
    elements.emotion = 'surprised';
  }
  
  return elements;
};

// Create an SVG illustration based on the parsed elements
const createSVG = (elements) => {
  // SVG container
  let svg = `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">`;
  
  // Add background based on setting and time
  svg += createBackground(elements.setting, elements.time);
  
  // Add objects based on the setting and parsed objects
  svg += createObjects(elements.setting, elements.objects);
  
  // Add characters with their actions and emotions
  svg += createCharacters(elements.characters, elements.actions, elements.emotion);
  
  // Close SVG tag
  svg += `</svg>`;
  
  return svg;
};

// Create background based on setting and time
const createBackground = (setting, time) => {
  let background = '';
  
  // Sky color based on time
  const skyColor = time === 'night' ? '#191970' : '#87CEEB';
  
  if (setting === 'outdoor') {
    // Outdoor setting with sky and ground
    background += `<rect x="0" y="0" width="400" height="120" fill="${skyColor}" stroke="none"/>`; // Sky
    background += `<rect x="0" y="120" width="400" height="80" fill="#8FBC8F" stroke="none"/>`; // Ground
    
    // Add sun or moon
    if (time === 'day') {
      background += `
        <circle cx="350" cy="40" r="20" fill="#FFD700" stroke="#FF8C00" stroke-width="2"/>
        <line x1="350" y1="15" x2="350" y2="5" stroke="#FF8C00" stroke-width="2"/>
        <line x1="350" y1="65" x2="350" y2="75" stroke="#FF8C00" stroke-width="2"/>
        <line x1="325" y1="40" x2="315" y2="40" stroke="#FF8C00" stroke-width="2"/>
        <line x1="375" y1="40" x2="385" y2="40" stroke="#FF8C00" stroke-width="2"/>
      `;
    } else {
      background += `
        <circle cx="350" cy="40" r="15" fill="#FFFFFF" stroke="none"/>
        <circle cx="320" cy="30" r="1" fill="#FFFFFF" stroke="none"/>
        <circle cx="280" cy="50" r="1" fill="#FFFFFF" stroke="none"/>
        <circle cx="380" cy="60" r="1" fill="#FFFFFF" stroke="none"/>
      `;
    }
  } else if (setting === 'school') {
    // School setting
    background += `<rect x="0" y="0" width="400" height="200" fill="#F5F5DC" stroke="#000" stroke-width="2"/>`; // Room
    background += `<rect x="20" y="20" width="120" height="80" fill="#2F4F4F" stroke="#000" stroke-width="2"/>`; // Blackboard
    background += `<rect x="320" y="20" width="60" height="80" fill="${skyColor}" stroke="#000" stroke-width="2"/>`; // Window
  } else if (setting === 'bedroom') {
    // Bedroom setting
    background += `<rect x="0" y="0" width="400" height="200" fill="#E6E6FA" stroke="#000" stroke-width="2"/>`; // Room
    background += `<rect x="320" y="20" width="60" height="80" fill="${skyColor}" stroke="#000" stroke-width="2"/>`; // Window
    background += `<rect x="20" y="120" width="150" height="70" fill="#4169E1" stroke="#000" stroke-width="2"/>`; // Bed
    background += `<rect x="20" y="100" width="150" height="20" fill="#FFFFFF" stroke="#000" stroke-width="2"/>`; // Pillow
  } else if (setting === 'kitchen') {
    // Kitchen setting
    background += `<rect x="0" y="0" width="400" height="200" fill="#FFFAF0" stroke="#000" stroke-width="2"/>`; // Room
    background += `<rect x="300" y="20" width="80" height="60" fill="${skyColor}" stroke="#000" stroke-width="2"/>`; // Window
    background += `<rect x="20" y="80" width="150" height="80" fill="#A0522D" stroke="#000" stroke-width="2"/>`; // Cabinets
    background += `<rect x="20" y="120" width="150" height="40" fill="#696969" stroke="#000" stroke-width="2"/>`; // Counter
  } else if (setting === 'house') {
    // House interior general
    background += `<rect x="0" y="0" width="400" height="200" fill="#FFF8DC" stroke="#000" stroke-width="2"/>`; // Room
    background += `<rect x="300" y="20" width="80" height="60" fill="${skyColor}" stroke="#000" stroke-width="2"/>`; // Window
  } else {
    // Default indoor
    background += `<rect x="0" y="0" width="400" height="200" fill="#F5F5F5" stroke="#000" stroke-width="2"/>`; // Room
    background += `<rect x="300" y="20" width="80" height="60" fill="${skyColor}" stroke="#000" stroke-width="2"/>`; // Window
  }
  
  return background;
};

// Create objects based on setting and parsed objects
const createObjects = (setting, objects) => {
  let objectsSVG = '';
  
  // Add default objects based on setting
  if (setting === 'school') {
    objectsSVG += `<rect x="200" y="80" width="80" height="40" fill="#A0522D" stroke="#000" stroke-width="2"/>`; // Desk
  } else if (setting === 'kitchen') {
    objectsSVG += `<rect x="100" y="100" width="200" height="10" fill="#8B4513" stroke="#000" stroke-width="2"/>`; // Table
    objectsSVG += `<rect x="120" y="110" width="20" height="50" fill="#8B4513" stroke="#000" stroke-width="2"/>`; // Table leg
    objectsSVG += `<rect x="260" y="110" width="20" height="50" fill="#8B4513" stroke="#000" stroke-width="2"/>`; // Table leg
  }
  
  // Add specific objects that were detected
  objects.forEach(object => {
    if (object === 'book') {
      objectsSVG += `
        <rect x="160" y="100" width="30" height="20" fill="#B0E0E6" stroke="#000" stroke-width="2"/>
        <line x1="175" y1="100" x2="175" y2="120" stroke="#000" stroke-width="1"/>
      `;
    } else if (object === 'ball') {
      objectsSVG += `<circle cx="180" cy="140" r="15" fill="#FF6347" stroke="#000" stroke-width="2"/>`;
    } else if (object === 'toy') {
      objectsSVG += `
        <rect x="160" y="140" width="15" height="15" fill="#FFA07A" stroke="#000" stroke-width="1"/>
        <circle cx="167" cy="147" r="5" fill="#FFD700" stroke="#000" stroke-width="1"/>
      `;
    } else if (object === 'car' && setting === 'outdoor') {
      objectsSVG += `
        <rect x="100" y="130" width="60" height="25" rx="5" ry="5" fill="#4682B4" stroke="#000" stroke-width="2"/>
        <rect x="110" y="115" width="40" height="15" rx="3" ry="3" fill="#4682B4" stroke="#000" stroke-width="2"/>
        <circle cx="115" cy="155" r="10" fill="#000" stroke="#808080"/>
        <circle cx="145" cy="155" r="10" fill="#000" stroke="#808080"/>
      `;
    } else if (object === 'food') {
      objectsSVG += `
        <ellipse cx="180" cy="90" rx="15" ry="5" fill="#B22222" stroke="#000" stroke-width="1"/>
        <ellipse cx="180" cy="85" rx="12" ry="4" fill="#CD853F" stroke="#000" stroke-width="1"/>
      `;
    }
  });
  
  return objectsSVG;
};

// Create characters with their actions and emotions
const createCharacters = (characters, actions, emotion) => {
  let charactersSVG = '';
  
  // Position characters appropriately
  const positions = calculateCharacterPositions(characters.length);
  
  // Create each character
  characters.forEach((character, index) => {
    const x = positions[index].x;
    const y = positions[index].y;
    const action = actions[0]; // Use first action for all characters
    
    if (character === 'boy' || character === 'child') {
      charactersSVG += createChild(x, y, 'boy', action, emotion);
    } else if (character === 'girl') {
      charactersSVG += createChild(x, y, 'girl', action, emotion);
    } else if (character === 'man') {
      charactersSVG += createAdult(x, y, 'man', action, emotion);
    } else if (character === 'woman') {
      charactersSVG += createAdult(x, y, 'woman', action, emotion);
    } else if (character === 'dog') {
      charactersSVG += createAnimal(x, y, 'dog', action);
    } else if (character === 'cat') {
      charactersSVG += createAnimal(x, y, 'cat', action);
    } else if (character === 'baby') {
      charactersSVG += createBaby(x, y, emotion);
    } else if (character === 'teacher') {
      charactersSVG += createAdult(x, y, 'woman', 'teaching', emotion);
    }
  });
  
  return charactersSVG;
};

// Calculate positions for characters based on their number
const calculateCharacterPositions = (count) => {
  const positions = [];
  
  if (count === 1) {
    positions.push({ x: 200, y: 100 });
  } else if (count === 2) {
    positions.push({ x: 150, y: 100 });
    positions.push({ x: 250, y: 100 });
  } else if (count === 3) {
    positions.push({ x: 100, y: 100 });
    positions.push({ x: 200, y: 100 });
    positions.push({ x: 300, y: 100 });
  } else {
    // For 4 or more, create a row
    const spacing = 400 / (count + 1);
    for (let i = 0; i < count; i++) {
      positions.push({ x: spacing * (i + 1), y: 100 });
    }
  }
  
  return positions;
};

// Create a child character
const createChild = (x, y, gender, action, emotion) => {
  const hairColor = gender === 'boy' ? '#8B4513' : '#FFD700';
  const clothingColor = gender === 'boy' ? '#4682B4' : '#FF69B4';
  let childSVG = '';
  
  if (action === 'sleeping') {
    // Child sleeping
    childSVG += `
      <circle cx="${x}" cy="${y}" r="15" fill="#FFDAB9" stroke="#000"/>
      <rect x="${x-10}" y="${y+15}" width="20" height="30" fill="${clothingColor}" stroke="#000"/>
      <path d="M ${x-5},${y} Q ${x},${y+5} ${x+5},${y}" stroke="#000" stroke-width="2" fill="none"/>
      <path d="M ${x-5},${y+5} Q ${x},${y+10} ${x+5},${y+5}" stroke="#000" stroke-width="2" fill="none"/>
    `;
  } else if (action === 'reading') {
    // Child reading
    childSVG += `
      <circle cx="${x}" cy="${y}" r="15" fill="#FFDAB9" stroke="#000"/>
      <rect x="${x-10}" y="${y+15}" width="20" height="30" fill="${clothingColor}" stroke="#000"/>
      <rect x="${x-20}" y="${y+25}" width="30" height="20" fill="#FFFFFF" stroke="#000" stroke-width="1"/>
      ${createFace(x, y, emotion)}
    `;
  } else if (action === 'playing') {
    // Child playing
    childSVG += `
      <circle cx="${x}" cy="${y}" r="15" fill="#FFDAB9" stroke="#000"/>
      <rect x="${x-10}" y="${y+15}" width="20" height="30" fill="${clothingColor}" stroke="#000"/>
      <line x1="${x-10}" y1="${y+20}" x2="${x-25}" y2="${y+15}" stroke="#000" stroke-width="2"/>
      <line x1="${x+10}" y1="${y+20}" x2="${x+25}" y2="${y+15}" stroke="#000" stroke-width="2"/>
      ${createFace(x, y, emotion)}
    `;
  } else {
    // Default standing child
    childSVG += `
      <circle cx="${x}" cy="${y}" r="15" fill="#FFDAB9" stroke="#000"/>
      <rect x="${x-10}" y="${y+15}" width="20" height="30" fill="${clothingColor}" stroke="#000"/>
      ${createFace(x, y, emotion)}
    `;
  }
  
  return childSVG;
};

// Create an adult character
const createAdult = (x, y, gender, action, emotion) => {
  const hairColor = gender === 'man' ? '#8B4513' : '#FFD700';
  const clothingColor = gender === 'man' ? '#3CB371' : '#9370DB';
  let adultSVG = '';
  
  // Adults are taller than children
  if (action === 'teaching') {
    // Teaching adult
    adultSVG += `
      <circle cx="${x}" cy="${y-10}" r="20" fill="#FFDAB9" stroke="#000"/>
      <rect x="${x-15}" y="${y+10}" width="30" height="40" fill="${clothingColor}" stroke="#000"/>
      <rect x="${x-30}" y="${y+20}" width="20" height="15" fill="#FFFFFF" stroke="#000" stroke-width="1"/>
      ${createFace(x, y-10, emotion)}
    `;
  } else {
    // Default standing adult
    adultSVG += `
      <circle cx="${x}" cy="${y-10}" r="20" fill="#FFDAB9" stroke="#000"/>
      <rect x="${x-15}" y="${y+10}" width="30" height="40" fill="${clothingColor}" stroke="#000"/>
      ${createFace(x, y-10, emotion)}
    `;
  }
  
  return adultSVG;
};

// Create an animal character
const createAnimal = (x, y, type, action) => {
  if (type === 'dog') {
    // Dog
    return `
      <ellipse cx="${x}" cy="${y+10}" rx="20" ry="15" fill="#CD853F" stroke="#000"/>
      <circle cx="${x-10}" cy="${y-5}" r="12" fill="#CD853F" stroke="#000"/>
      <circle cx="${x-14}" cy="${y-8}" r="2" fill="#000"/>
      <circle cx="${x-6}" cy="${y-8}" r="2" fill="#000"/>
      <ellipse cx="${x-10}" cy="${y-2}" rx="4" ry="2" fill="#000"/>
      <polygon points="${x-20},${y-12} ${x-25},${y-18} ${x-15},${y-15}" fill="#CD853F" stroke="#000"/>
      <polygon points="${x-0},${y-12} ${x+5},${y-18} ${x-5},${y-15}" fill="#CD853F" stroke="#000"/>
    `;
  } else if (type === 'cat') {
    // Cat
    return `
      <ellipse cx="${x}" cy="${y+10}" rx="15" ry="10" fill="#808080" stroke="#000"/>
      <circle cx="${x-10}" cy="${y-5}" r="10" fill="#808080" stroke="#000"/>
      <circle cx="${x-14}" cy="${y-8}" r="2" fill="#000"/>
      <circle cx="${x-6}" cy="${y-8}" r="2" fill="#000"/>
      <ellipse cx="${x-10}" cy="${y-2}" rx="2" ry="1" fill="#000"/>
      <polygon points="${x-16},${y-12} ${x-20},${y-18} ${x-12},${y-15}" fill="#808080" stroke="#000"/>
      <polygon points="${x-4},${y-12} ${x-0},${y-18} ${x-8},${y-15}" fill="#808080" stroke="#000"/>
      <line x1="${x}" y1="${y+10}" x2="${x+15}" y2="${y+5}" stroke="#808080" stroke-width="3"/>
    `;
  }
  
  return '';
};

// Create a baby character
const createBaby = (x, y, emotion) => {
  return `
    <circle cx="${x}" cy="${y}" r="12" fill="#FFDAB9" stroke="#000"/>
    <rect x="${x-8}" y="${y+12}" width="16" height="15" fill="#FFC0CB" stroke="#000"/>
    ${createFace(x, y, emotion, true)}
  `;
};

// Create a face with the given emotion
const createFace = (x, y, emotion, isBaby = false) => {
  const scale = isBaby ? 0.7 : 1;
  const eyeDistance = 8 * scale;
  const eyeY = y - 2 * scale;
  
  let face = `
    <circle cx="${x - eyeDistance/2}" cy="${eyeY}" r="${2 * scale}" fill="#000"/>
    <circle cx="${x + eyeDistance/2}" cy="${eyeY}" r="${2 * scale}" fill="#000"/>
  `;
  
  if (emotion === 'happy') {
    face += `<path d="M ${x-5*scale},${y+5*scale} Q ${x},${y+10*scale} ${x+5*scale},${y+5*scale}" stroke="#000" stroke-width="${1.5 * scale}" fill="none"/>`;
  } else if (emotion === 'sad') {
    face += `<path d="M ${x-5*scale},${y+7*scale} Q ${x},${y+2*scale} ${x+5*scale},${y+7*scale}" stroke="#000" stroke-width="${1.5 * scale}" fill="none"/>`;
  } else if (emotion === 'surprised') {
    face += `<circle cx="${x}" cy="${y+5*scale}" r="${3 * scale}" fill="#000"/>`;
  } else if (emotion === 'angry') {
    face += `
      <path d="M ${x-5*scale},${y+5*scale} Q ${x},${y+2*scale} ${x+5*scale},${y+5*scale}" stroke="#000" stroke-width="${1.5 * scale}" fill="none"/>
      <line x1="${x-7*scale}" y1="${eyeY-3*scale}" x2="${x-2*scale}" y2="${eyeY}" stroke="#000" stroke-width="${1.5 * scale}"/>
      <line x1="${x+7*scale}" y1="${eyeY-3*scale}" x2="${x+2*scale}" y2="${eyeY}" stroke="#000" stroke-width="${1.5 * scale}"/>
    `;
  }
  
  return face;
};

// Convert the SVG string to an encoded data URL
export const svgToDataURL = (svg) => {
  const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
  return URL.createObjectURL(svgBlob);
};