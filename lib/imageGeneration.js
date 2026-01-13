/**
 * Enhanced SVG Generation for Sight Word Story Generator
 *
 * Features:
 * - Context-aware illustrations based on sentence analysis
 * - Diverse character representation
 * - Dynamic scenes based on actions, locations, and objects
 * - Weather effects and time of day
 * - Animals, vehicles, and many objects
 * - 100% free - no API costs!
 */

/**
 * Generate an SVG illustration based on sentence content
 * @param {string} sentence - The sentence to illustrate
 * @param {object} options - Configuration options
 * @returns {string} - Complete SVG code
 */
export const generateIllustration = (sentence, options = {}) => {
  const elements = extractElements(sentence);
  const width = 400;
  const height = 200;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`;
  svg += generateBackground(elements.location, elements.weather, elements.timeOfDay);

  // Add scene-specific elements
  if (elements.vehicles.length > 0) {
    svg += generateVehicles(elements.vehicles);
  }
  if (elements.animals.length > 0) {
    svg += generateAnimals(elements.animals);
  }
  if (elements.foodItems.length > 0) {
    svg += generateFood(elements.foodItems);
  }

  // Add characters based on context
  svg += generateCharacters(elements.characters, elements.action, elements.emotion, elements.location);

  // Add objects
  if (elements.objects.length > 0) {
    svg += generateObjects(elements.objects);
  }

  svg += '</svg>';
  return svg;
};

/**
 * Extract key elements from a sentence with improved detection
 */
const extractElements = (sentence) => {
  if (!sentence || typeof sentence !== 'string') {
    sentence = '';
  }

  const lower = sentence.toLowerCase();

  // Determine time of day
  let timeOfDay = 'day';
  if (/\b(morning|sunrise|dawn|woke|breakfast)\b/.test(lower)) timeOfDay = 'morning';
  if (/\b(night|dark|moon|star|bed|sleep|dream)\b/.test(lower)) timeOfDay = 'night';
  if (/\b(evening|sunset|dinner|dusk)\b/.test(lower)) timeOfDay = 'evening';

  // Determine weather
  let weather = 'sunny';
  if (/\b(rain|rainy|wet|umbrella|storm)\b/.test(lower)) weather = 'rainy';
  if (/\b(snow|snowy|cold|winter|ice)\b/.test(lower)) weather = 'snowy';
  if (/\b(cloud|cloudy|overcast)\b/.test(lower)) weather = 'cloudy';
  if (/\b(wind|windy|breezy)\b/.test(lower)) weather = 'windy';

  // Determine location with expanded detection
  let location = 'outside';
  if (/\b(school|classroom|class|learn|teacher|student)\b/.test(lower)) location = 'school';
  if (/\b(park|playground|swing|slide|sandbox)\b/.test(lower)) location = 'park';
  if (/\b(home|house|room|bed|kitchen|door|window|inside|family)\b/.test(lower)) location = 'home';
  if (/\b(beach|ocean|water|sand|wave|swim)\b/.test(lower)) location = 'beach';
  if (/\b(library|book|read|story)\b/.test(lower)) location = 'library';
  if (/\b(store|shop|buy|market)\b/.test(lower)) location = 'store';
  if (/\b(hill|mountain|hike)\b/.test(lower)) location = 'hill';
  if (/\b(street|road|walk|neighborhood|block)\b/.test(lower)) location = 'street';
  if (/\b(garden|flower|plant|grow)\b/.test(lower)) location = 'garden';

  // Determine action with expanded detection
  let action = 'standing';
  if (/\b(jump|jumping|jumped|leap)\b/.test(lower)) action = 'jumping';
  if (/\b(run|running|ran|fast|race)\b/.test(lower)) action = 'running';
  if (/\b(walk|walking|walked|stroll)\b/.test(lower)) action = 'walking';
  if (/\b(sit|sitting|sat|bench|chair)\b/.test(lower)) action = 'sitting';
  if (/\b(play|playing|played|game|fun)\b/.test(lower)) action = 'playing';
  if (/\b(read|reading|book|story)\b/.test(lower)) action = 'reading';
  if (/\b(eat|eating|ate|food|breakfast|lunch|dinner|snack)\b/.test(lower)) action = 'eating';
  if (/\b(sleep|sleeping|slept|bed|dream|rest|nap)\b/.test(lower)) action = 'sleeping';
  if (/\b(ride|riding|rode|bike|bicycle)\b/.test(lower)) action = 'riding';
  if (/\b(sing|singing|sang|song|music)\b/.test(lower)) action = 'singing';
  if (/\b(wave|waving|waved|goodbye|hello)\b/.test(lower)) action = 'waving';
  if (/\b(hug|hugging|hugged)\b/.test(lower)) action = 'hugging';
  if (/\b(count|counting|counted|number)\b/.test(lower)) action = 'counting';
  if (/\b(write|writing|wrote|pencil|pen)\b/.test(lower)) action = 'writing';
  if (/\b(wash|washing|washed|clean)\b/.test(lower)) action = 'washing';
  if (/\b(look|looking|looked|see|watch)\b/.test(lower)) action = 'looking';
  if (/\b(call|calling|called|phone)\b/.test(lower)) action = 'calling';
  if (/\b(share|sharing|shared|gave|give)\b/.test(lower)) action = 'sharing';

  // Determine emotion
  let emotion = 'happy'; // Default to happy for children's stories
  if (/\b(happy|glad|joy|smile|excited|wonderful|amazing|great|best|fun|love)\b/.test(lower)) emotion = 'happy';
  if (/\b(sad|cry|upset|miss)\b/.test(lower)) emotion = 'sad';
  if (/\b(angry|mad|frustrated)\b/.test(lower)) emotion = 'angry';
  if (/\b(surprise|surprised|wow|amazing|what)\b/.test(lower)) emotion = 'surprised';
  if (/\b(tired|sleepy|yawn)\b/.test(lower)) emotion = 'tired';
  if (/\b(proud|accomplished)\b/.test(lower)) emotion = 'proud';

  // Extract characters
  const characters = extractCharacters(lower);

  // Extract animals
  const animals = [];
  const animalPatterns = {
    dog: /\b(dog|puppy|pup)\b/,
    cat: /\b(cat|kitten|kitty)\b/,
    bird: /\b(bird|birds|robin|sparrow)\b/,
    rabbit: /\b(rabbit|bunny|bunnies)\b/,
    duck: /\b(duck|ducks)\b/,
    fish: /\b(fish|goldfish)\b/,
    butterfly: /\b(butterfly|butterflies)\b/,
    bee: /\b(bee|bees)\b/,
    horse: /\b(horse|pony)\b/,
    cow: /\b(cow|cows)\b/
  };
  Object.entries(animalPatterns).forEach(([animal, pattern]) => {
    if (pattern.test(lower)) animals.push(animal);
  });

  // Extract vehicles
  const vehicles = [];
  const vehiclePatterns = {
    bike: /\b(bike|bicycle|biking)\b/,
    car: /\b(car|cars|drive|drove)\b/,
    bus: /\b(bus|buses)\b/,
    train: /\b(train|trains)\b/,
    truck: /\b(truck|trucks)\b/,
    boat: /\b(boat|boats|ship)\b/
  };
  Object.entries(vehiclePatterns).forEach(([vehicle, pattern]) => {
    if (pattern.test(lower)) vehicles.push(vehicle);
  });

  // Extract food items
  const foodItems = [];
  const foodPatterns = {
    apple: /\b(apple|apples)\b/,
    cake: /\b(cake|birthday cake|cupcake)\b/,
    icecream: /\b(ice cream|icecream|treat)\b/,
    sandwich: /\b(sandwich|lunch)\b/,
    cookie: /\b(cookie|cookies)\b/,
    pizza: /\b(pizza)\b/
  };
  Object.entries(foodPatterns).forEach(([food, pattern]) => {
    if (pattern.test(lower)) foodItems.push(food);
  });

  // Extract objects
  const objects = [];
  const objectPatterns = {
    ball: /\b(ball|balls)\b/,
    book: /\b(book|books)\b/,
    toy: /\b(toy|toys)\b/,
    flower: /\b(flower|flowers)\b/,
    tree: /\b(tree|trees)\b/,
    gift: /\b(gift|present|presents)\b/,
    balloon: /\b(balloon|balloons)\b/,
    phone: /\b(phone|call)\b/,
    bench: /\b(bench|seat)\b/,
    swing: /\b(swing|swings)\b/,
    kite: /\b(kite|kites)\b/,
    hat: /\b(hat|hats)\b/,
    backpack: /\b(backpack|bag)\b/,
    pencil: /\b(pencil|pen|write|writing)\b/,
    star: /\b(star|stars)\b/,
    sun: /\b(sun|sunny|sunshine)\b/,
    cloud: /\b(cloud|clouds)\b/
  };
  Object.entries(objectPatterns).forEach(([obj, pattern]) => {
    if (pattern.test(lower)) objects.push(obj);
  });

  return {
    location,
    weather,
    timeOfDay,
    action,
    emotion,
    characters,
    animals,
    vehicles,
    foodItems,
    objects
  };
};

/**
 * Extract character information from sentence
 */
const extractCharacters = (lower) => {
  const characters = [];

  // Check for specific character mentions
  const hasMom = /\b(mom|mother|mama)\b/.test(lower);
  const hasDad = /\b(dad|father|papa)\b/.test(lower);
  const hasFriend = /\b(friend|friends|buddy)\b/.test(lower);
  const hasTeacher = /\b(teacher)\b/.test(lower);
  const hasMany = /\b(everyone|all|many|both)\b/.test(lower);

  // Add characters based on mentions
  if (hasMom) {
    characters.push({ role: 'mom', skinTone: Math.floor(Math.random() * 3), isAdult: true });
  }
  if (hasDad) {
    characters.push({ role: 'dad', skinTone: Math.floor(Math.random() * 3), isAdult: true });
  }
  if (hasTeacher) {
    characters.push({ role: 'teacher', skinTone: Math.floor(Math.random() * 3), isAdult: true });
  }

  // Always add at least one child (the main character)
  characters.push({ role: 'child', skinTone: Math.floor(Math.random() * 3), isAdult: false });

  // Add friend if mentioned
  if (hasFriend || hasMany) {
    characters.push({ role: 'friend', skinTone: Math.floor(Math.random() * 3), isAdult: false });
  }

  // Add more for "everyone" or "many"
  if (hasMany && characters.length < 4) {
    characters.push({ role: 'friend2', skinTone: Math.floor(Math.random() * 3), isAdult: false });
  }

  return characters;
};

/**
 * Generate background based on location, weather, and time
 */
const generateBackground = (location, weather, timeOfDay) => {
  let sky = '';
  let ground = '';
  let extras = '';

  // Sky based on time of day and weather
  if (timeOfDay === 'night') {
    sky = '<rect width="400" height="130" fill="#1a1a3e"/>';
    extras += `
      <circle cx="350" cy="40" r="20" fill="#fffacd"/>
      ${[...Array(15)].map(() =>
        `<circle cx="${50 + Math.random() * 300}" cy="${20 + Math.random() * 60}" r="${1 + Math.random() * 2}" fill="#fff"/>`
      ).join('')}
    `;
  } else if (timeOfDay === 'evening') {
    sky = '<rect width="400" height="130" fill="url(#sunset)"/>';
    extras = `
      <defs>
        <linearGradient id="sunset" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ff7e5f"/>
          <stop offset="100%" style="stop-color:#feb47b"/>
        </linearGradient>
      </defs>
      <circle cx="350" cy="100" r="25" fill="#ff6b6b"/>
    `;
  } else if (weather === 'rainy') {
    sky = '<rect width="400" height="130" fill="#6b7b8c"/>';
    extras += `
      <ellipse cx="100" cy="40" rx="50" ry="25" fill="#4a5568"/>
      <ellipse cx="200" cy="50" rx="60" ry="30" fill="#4a5568"/>
      <ellipse cx="300" cy="35" rx="55" ry="25" fill="#4a5568"/>
      ${[...Array(20)].map((_, i) =>
        `<line x1="${20 + i * 20}" y1="${60 + (i % 3) * 10}" x2="${15 + i * 20}" y2="${80 + (i % 3) * 10}" stroke="#87ceeb" stroke-width="2" opacity="0.6"/>`
      ).join('')}
    `;
  } else if (weather === 'snowy') {
    sky = '<rect width="400" height="130" fill="#b8c6db"/>';
    extras += `
      ${[...Array(25)].map(() =>
        `<circle cx="${Math.random() * 400}" cy="${Math.random() * 130}" r="${2 + Math.random() * 3}" fill="#fff"/>`
      ).join('')}
    `;
  } else if (weather === 'cloudy') {
    sky = '<rect width="400" height="130" fill="#87ceeb"/>';
    extras += `
      <ellipse cx="80" cy="40" rx="45" ry="20" fill="#fff"/>
      <ellipse cx="110" cy="35" rx="35" ry="18" fill="#fff"/>
      <ellipse cx="250" cy="50" rx="50" ry="22" fill="#fff"/>
      <ellipse cx="290" cy="45" rx="40" ry="18" fill="#fff"/>
    `;
  } else if (timeOfDay === 'morning') {
    sky = '<rect width="400" height="130" fill="#87ceeb"/>';
    extras += `<circle cx="60" cy="50" r="30" fill="#fff44f"/>`;
  } else {
    // Default sunny day
    sky = '<rect width="400" height="130" fill="#87ceeb"/>';
    extras += `<circle cx="350" cy="45" r="28" fill="#ffd700"/>`;
  }

  // Ground and scene elements based on location
  switch (location) {
    case 'home':
      ground = '<rect x="0" y="130" width="400" height="70" fill="#90b77d"/>';
      extras += `
        <rect x="50" y="50" width="120" height="80" fill="#deb887"/>
        <polygon points="50,50 110,15 170,50" fill="#8b4513"/>
        <rect x="95" y="90" width="30" height="40" fill="#654321"/>
        <rect x="65" y="65" width="25" height="20" fill="#87ceeb"/>
        <rect x="130" y="65" width="25" height="20" fill="#87ceeb"/>
        <rect x="8" y="100" width="8" height="30" fill="#654321"/>
        <circle cx="12" cy="85" r="20" fill="#228b22"/>
      `;
      break;

    case 'park':
      ground = '<rect x="0" y="130" width="400" height="70" fill="#7ccd7c"/>';
      extras += `
        <rect x="50" y="90" width="10" height="40" fill="#8b4513"/>
        <circle cx="55" cy="75" r="28" fill="#228b22"/>
        <rect x="320" y="95" width="8" height="35" fill="#8b4513"/>
        <circle cx="324" cy="80" r="22" fill="#228b22"/>
        <path d="M150,145 Q200,135 250,145" fill="#90ee90"/>
      `;
      break;

    case 'school':
      ground = '<rect x="0" y="130" width="400" height="70" fill="#a9a9a9"/>';
      extras += `
        <rect x="100" y="40" width="200" height="90" fill="#f5deb3"/>
        <polygon points="100,40 200,5 300,40" fill="#cd5c5c"/>
        <rect x="185" y="90" width="30" height="40" fill="#654321"/>
        <rect x="120" y="55" width="35" height="25" fill="#add8e6"/>
        <rect x="245" y="55" width="35" height="25" fill="#add8e6"/>
        <rect x="340" y="50" width="4" height="80" fill="#333"/>
        <rect x="344" y="50" width="20" height="12" fill="#ff0000"/>
      `;
      break;

    case 'beach':
      ground = '<rect x="0" y="130" width="400" height="70" fill="#f4e4ba"/>';
      extras += `
        <rect x="0" y="100" width="400" height="30" fill="#4fb4d8"/>
        <path d="M0,115 Q50,105 100,115 Q150,125 200,115 Q250,105 300,115 Q350,125 400,115" fill="#4fb4d8"/>
        <circle cx="320" cy="160" r="12" fill="#ff6347"/>
        <line x1="100" y1="110" x2="100" y2="155" stroke="#8b4513" stroke-width="4"/>
        <path d="M70,110 Q100,90 130,110" fill="#ff6b6b"/>
      `;
      break;

    case 'library':
      ground = '<rect x="0" y="130" width="400" height="70" fill="#deb887"/>';
      extras += `
        <rect x="80" y="50" width="240" height="80" fill="#d2b48c"/>
        <rect x="185" y="90" width="30" height="40" fill="#654321"/>
        <rect x="100" y="60" width="30" height="25" fill="#add8e6"/>
        <rect x="270" y="60" width="30" height="25" fill="#add8e6"/>
        <rect x="90" y="55" width="5" height="75" fill="#8b4513"/>
        <rect x="95" y="58" width="80" height="8" fill="#8b4513"/>
        <rect x="95" y="70" width="80" height="8" fill="#8b4513"/>
      `;
      break;

    case 'store':
      ground = '<rect x="0" y="130" width="400" height="70" fill="#808080"/>';
      extras += `
        <rect x="100" y="45" width="200" height="85" fill="#f5f5dc"/>
        <rect x="180" y="90" width="40" height="40" fill="#4169e1"/>
        <rect x="120" y="50" width="160" height="30" fill="#ff6347"/>
        <text x="155" y="72" font-family="Arial" font-size="18" fill="#fff">STORE</text>
      `;
      break;

    case 'garden':
      ground = '<rect x="0" y="130" width="400" height="70" fill="#8fbc8f"/>';
      extras += `
        <circle cx="80" cy="140" r="8" fill="#ff69b4"/>
        <circle cx="100" cy="145" r="7" fill="#ffff00"/>
        <circle cx="120" cy="138" r="9" fill="#ff0000"/>
        <circle cx="280" cy="142" r="8" fill="#9370db"/>
        <circle cx="300" cy="148" r="7" fill="#ffa500"/>
        <circle cx="320" cy="140" r="9" fill="#ff1493"/>
        <line x1="80" y1="148" x2="80" y2="165" stroke="#228b22" stroke-width="2"/>
        <line x1="100" y1="152" x2="100" y2="168" stroke="#228b22" stroke-width="2"/>
        <line x1="120" y1="147" x2="120" y2="163" stroke="#228b22" stroke-width="2"/>
        <line x1="280" y1="150" x2="280" y2="166" stroke="#228b22" stroke-width="2"/>
        <line x1="300" y1="155" x2="300" y2="170" stroke="#228b22" stroke-width="2"/>
        <line x1="320" y1="149" x2="320" y2="165" stroke="#228b22" stroke-width="2"/>
      `;
      break;

    case 'hill':
      ground = `
        <path d="M0,200 L0,150 Q100,100 200,140 Q300,100 400,130 L400,200 Z" fill="#7ccd7c"/>
      `;
      break;

    case 'street':
      ground = `
        <rect x="0" y="130" width="400" height="70" fill="#696969"/>
        <rect x="0" y="160" width="400" height="5" fill="#fff" stroke-dasharray="20,15"/>
        <rect x="0" y="180" width="400" height="20" fill="#90b77d"/>
        <rect x="0" y="130" width="400" height="20" fill="#90b77d"/>
      `;
      break;

    default:
      // Generic outdoor scene
      ground = '<rect x="0" y="130" width="400" height="70" fill="#90ee90"/>';
  }

  return sky + ground + extras;
};

/**
 * Generate characters with diverse appearances and poses
 */
const generateCharacters = (characters, action, emotion, location) => {
  let svg = '';

  const skinTones = ['#ffe0bd', '#d4a574', '#8d5524'];
  const hairColors = ['#2c1810', '#4a3728', '#8b4513', '#daa520', '#cd853f'];
  const shirtColors = ['#4169e1', '#9932cc', '#ff6347', '#32cd32', '#ff8c00', '#20b2aa'];

  // Calculate positions based on number of characters
  const positions = [];
  const numChars = Math.min(characters.length, 4);
  const startX = 200 - (numChars - 1) * 35;

  for (let i = 0; i < numChars; i++) {
    positions.push({ x: startX + i * 70, y: 145 });
  }

  characters.forEach((char, index) => {
    if (index >= positions.length) return;

    const { x, y } = positions[index];
    const skin = skinTones[char.skinTone];
    const hair = hairColors[Math.floor(Math.random() * hairColors.length)];
    const shirt = shirtColors[index % shirtColors.length];
    const scale = char.isAdult ? 1.2 : 1;
    const yOffset = char.isAdult ? -15 : 0;

    // Adjust y position for actions
    let actionYOffset = 0;
    if (action === 'jumping') actionYOffset = -15;
    if (action === 'sitting') actionYOffset = 10;

    const finalY = y + yOffset + actionYOffset;

    svg += `<g transform="translate(${x}, ${finalY}) scale(${scale})">`;

    // Body
    svg += `<rect x="-12" y="-15" width="24" height="30" rx="3" fill="${shirt}"/>`;

    // Head
    svg += `<circle cx="0" cy="-30" r="14" fill="${skin}"/>`;

    // Hair based on character type
    if (char.role === 'mom' || char.role === 'friend2') {
      svg += `<path d="M-14,-35 Q-10,-50 0,-48 Q10,-50 14,-35" fill="${hair}"/>`;
      svg += `<ellipse cx="-10" cy="-32" rx="5" ry="8" fill="${hair}"/>`;
      svg += `<ellipse cx="10" cy="-32" rx="5" ry="8" fill="${hair}"/>`;
    } else {
      svg += `<ellipse cx="0" cy="-42" rx="12" ry="6" fill="${hair}"/>`;
    }

    // Face - eyes
    svg += `<circle cx="-5" cy="-32" r="2" fill="#000"/>`;
    svg += `<circle cx="5" cy="-32" r="2" fill="#000"/>`;

    // Face - mouth based on emotion
    if (emotion === 'happy' || emotion === 'proud') {
      svg += `<path d="M-6,-24 Q0,-20 6,-24" stroke="#000" stroke-width="1.5" fill="none"/>`;
    } else if (emotion === 'sad') {
      svg += `<path d="M-5,-22 Q0,-26 5,-22" stroke="#000" stroke-width="1.5" fill="none"/>`;
    } else if (emotion === 'surprised') {
      svg += `<ellipse cx="0" cy="-23" rx="4" ry="5" fill="none" stroke="#000" stroke-width="1.5"/>`;
    } else {
      svg += `<line x1="-4" y1="-23" x2="4" y2="-23" stroke="#000" stroke-width="1.5"/>`;
    }

    // Arms based on action
    if (action === 'waving') {
      svg += `<rect x="12" y="-20" width="8" height="5" rx="2" fill="${skin}" transform="rotate(-45 16 -18)"/>`;
      svg += `<rect x="-20" y="-10" width="8" height="5" rx="2" fill="${skin}"/>`;
    } else if (action === 'hugging' && index > 0) {
      svg += `<rect x="-25" y="-10" width="12" height="5" rx="2" fill="${skin}"/>`;
      svg += `<rect x="13" y="-10" width="12" height="5" rx="2" fill="${skin}"/>`;
    } else if (action === 'reading' || action === 'writing') {
      svg += `<rect x="-20" y="-5" width="8" height="5" rx="2" fill="${skin}"/>`;
      svg += `<rect x="12" y="-5" width="8" height="5" rx="2" fill="${skin}"/>`;
    } else {
      svg += `<rect x="-20" y="-10" width="8" height="5" rx="2" fill="${skin}"/>`;
      svg += `<rect x="12" y="-10" width="8" height="5" rx="2" fill="${skin}"/>`;
    }

    // Legs
    svg += `<rect x="-10" y="15" width="8" height="18" fill="#2c3e50"/>`;
    svg += `<rect x="2" y="15" width="8" height="18" fill="#2c3e50"/>`;

    // Feet
    svg += `<ellipse cx="-6" cy="35" rx="6" ry="3" fill="#2c3e50"/>`;
    svg += `<ellipse cx="6" cy="35" rx="6" ry="3" fill="#2c3e50"/>`;

    svg += `</g>`;

    // Add action-specific items
    if (action === 'reading' || action === 'writing') {
      svg += `<rect x="${x-10}" y="${finalY}" width="20" height="15" fill="#8b4513"/>`;
      svg += `<rect x="${x-8}" y="${finalY+2}" width="16" height="11" fill="#fff"/>`;
    }
    if (action === 'calling') {
      svg += `<rect x="${x+15}" y="${finalY-35}" width="8" height="14" rx="2" fill="#333"/>`;
    }
  });

  return svg;
};

/**
 * Generate animals
 */
const generateAnimals = (animals) => {
  let svg = '';
  const startX = animals.length === 1 ? 320 : 80;

  animals.forEach((animal, index) => {
    const x = startX + index * 200;
    const y = 155;

    switch (animal) {
      case 'dog':
        svg += `
          <g transform="translate(${x}, ${y})">
            <ellipse cx="0" cy="0" rx="20" ry="12" fill="#d2691e"/>
            <circle cx="-15" cy="-8" r="10" fill="#d2691e"/>
            <circle cx="-18" cy="-10" r="2" fill="#000"/>
            <ellipse cx="-15" cy="-5" rx="4" ry="3" fill="#000"/>
            <ellipse cx="-25" cy="-12" rx="4" ry="8" fill="#d2691e"/>
            <path d="M15,0 Q25,-5 20,5" stroke="#d2691e" stroke-width="4" fill="none"/>
          </g>
        `;
        break;
      case 'cat':
        svg += `
          <g transform="translate(${x}, ${y})">
            <ellipse cx="0" cy="0" rx="16" ry="10" fill="#ffa500"/>
            <circle cx="-10" cy="-6" r="8" fill="#ffa500"/>
            <circle cx="-12" cy="-8" r="2" fill="#000"/>
            <polygon points="-18,-12 -15,-5 -12,-10" fill="#ffa500"/>
            <polygon points="-5,-12 -8,-5 -2,-10" fill="#ffa500"/>
            <path d="M12,0 Q22,5 18,-8" stroke="#ffa500" stroke-width="3" fill="none"/>
          </g>
        `;
        break;
      case 'bird':
        svg += `
          <g transform="translate(${x}, ${y - 30})">
            <ellipse cx="0" cy="0" rx="12" ry="8" fill="#4169e1"/>
            <circle cx="-8" cy="-3" r="6" fill="#4169e1"/>
            <circle cx="-10" cy="-4" r="2" fill="#000"/>
            <polygon points="-14,-3 -20,-3 -16,-6" fill="#ffa500"/>
            <path d="M8,-5 L20,-15" stroke="#4169e1" stroke-width="3"/>
            <path d="M8,5 L18,12" stroke="#4169e1" stroke-width="3"/>
          </g>
        `;
        break;
      case 'rabbit':
        svg += `
          <g transform="translate(${x}, ${y})">
            <ellipse cx="0" cy="0" rx="14" ry="10" fill="#d3d3d3"/>
            <circle cx="-8" cy="-6" r="8" fill="#d3d3d3"/>
            <circle cx="-10" cy="-8" r="2" fill="#000"/>
            <ellipse cx="-15" cy="-20" rx="4" ry="12" fill="#d3d3d3"/>
            <ellipse cx="-5" cy="-20" rx="4" ry="12" fill="#d3d3d3"/>
            <circle cx="12" cy="3" r="5" fill="#fff"/>
          </g>
        `;
        break;
      case 'butterfly':
        svg += `
          <g transform="translate(${x}, ${y - 40})">
            <ellipse cx="0" cy="0" rx="3" ry="10" fill="#000"/>
            <ellipse cx="-10" cy="-5" rx="10" ry="12" fill="#ff69b4"/>
            <ellipse cx="10" cy="-5" rx="10" ry="12" fill="#ff69b4"/>
            <ellipse cx="-8" cy="8" rx="7" ry="9" fill="#ff1493"/>
            <ellipse cx="8" cy="8" rx="7" ry="9" fill="#ff1493"/>
          </g>
        `;
        break;
      case 'duck':
        svg += `
          <g transform="translate(${x}, ${y})">
            <ellipse cx="0" cy="0" rx="16" ry="12" fill="#ffd700"/>
            <circle cx="-12" cy="-8" r="9" fill="#ffd700"/>
            <circle cx="-14" cy="-10" r="2" fill="#000"/>
            <ellipse cx="-18" cy="-6" rx="6" ry="3" fill="#ffa500"/>
          </g>
        `;
        break;
    }
  });

  return svg;
};

/**
 * Generate vehicles
 */
const generateVehicles = (vehicles) => {
  let svg = '';

  vehicles.forEach((vehicle, index) => {
    const x = 100 + index * 180;
    const y = 155;

    switch (vehicle) {
      case 'bike':
        svg += `
          <g transform="translate(${x}, ${y})">
            <circle cx="-15" cy="10" r="12" fill="none" stroke="#333" stroke-width="3"/>
            <circle cx="15" cy="10" r="12" fill="none" stroke="#333" stroke-width="3"/>
            <line x1="-15" y1="10" x2="0" y2="-10" stroke="#e74c3c" stroke-width="3"/>
            <line x1="0" y1="-10" x2="15" y2="10" stroke="#e74c3c" stroke-width="3"/>
            <line x1="0" y1="-10" x2="5" y2="-20" stroke="#e74c3c" stroke-width="2"/>
            <rect x="0" y="-25" width="10" height="5" fill="#333"/>
          </g>
        `;
        break;
      case 'car':
        svg += `
          <g transform="translate(${x}, ${y})">
            <rect x="-30" y="-10" width="60" height="25" rx="5" fill="#e74c3c"/>
            <rect x="-20" y="-25" width="40" height="18" rx="5" fill="#e74c3c"/>
            <rect x="-15" y="-22" width="12" height="12" fill="#87ceeb"/>
            <rect x="3" y="-22" width="12" height="12" fill="#87ceeb"/>
            <circle cx="-18" cy="15" r="8" fill="#333"/>
            <circle cx="18" cy="15" r="8" fill="#333"/>
          </g>
        `;
        break;
      case 'bus':
        svg += `
          <g transform="translate(${x}, ${y})">
            <rect x="-40" y="-20" width="80" height="35" rx="3" fill="#f1c40f"/>
            <rect x="-35" y="-15" width="15" height="12" fill="#87ceeb"/>
            <rect x="-15" y="-15" width="15" height="12" fill="#87ceeb"/>
            <rect x="5" y="-15" width="15" height="12" fill="#87ceeb"/>
            <rect x="25" y="-15" width="10" height="12" fill="#87ceeb"/>
            <circle cx="-25" cy="15" r="8" fill="#333"/>
            <circle cx="25" cy="15" r="8" fill="#333"/>
          </g>
        `;
        break;
    }
  });

  return svg;
};

/**
 * Generate food items
 */
const generateFood = (foodItems) => {
  let svg = '';

  foodItems.forEach((food, index) => {
    const x = 280 + index * 40;
    const y = 140;

    switch (food) {
      case 'cake':
        svg += `
          <g transform="translate(${x}, ${y})">
            <rect x="-15" y="0" width="30" height="20" fill="#f4a460"/>
            <rect x="-18" y="-5" width="36" height="8" fill="#fff"/>
            <rect x="-2" y="-15" width="4" height="12" fill="#ff69b4"/>
            <ellipse cx="0" cy="-17" rx="3" ry="4" fill="#ffa500"/>
          </g>
        `;
        break;
      case 'icecream':
        svg += `
          <g transform="translate(${x}, ${y})">
            <polygon points="-8,5 8,5 0,25" fill="#deb887"/>
            <circle cx="0" cy="0" r="10" fill="#ffb6c1"/>
            <circle cx="0" cy="-10" r="8" fill="#98fb98"/>
          </g>
        `;
        break;
      case 'apple':
        svg += `
          <g transform="translate(${x}, ${y})">
            <circle cx="0" cy="5" r="10" fill="#ff0000"/>
            <line x1="0" y1="-5" x2="0" y2="-12" stroke="#8b4513" stroke-width="2"/>
            <ellipse cx="3" cy="-10" rx="5" ry="3" fill="#228b22"/>
          </g>
        `;
        break;
    }
  });

  return svg;
};

/**
 * Generate objects
 */
const generateObjects = (objects) => {
  let svg = '';

  objects.slice(0, 3).forEach((obj, index) => {
    const x = 60 + index * 50;
    const y = 165;

    switch (obj) {
      case 'ball':
        svg += `<circle cx="${x}" cy="${y}" r="12" fill="#ff6347"/>`;
        svg += `<path d="M${x-8},${y} Q${x},${y-6} ${x+8},${y}" stroke="#fff" stroke-width="2" fill="none"/>`;
        break;
      case 'book':
        svg += `<rect x="${x-12}" y="${y-8}" width="24" height="16" fill="#8b4513"/>`;
        svg += `<rect x="${x-10}" y="${y-6}" width="20" height="12" fill="#fff"/>`;
        svg += `<line x1="${x}" y1="${y-6}" x2="${x}" y2="${y+6}" stroke="#8b4513" stroke-width="1"/>`;
        break;
      case 'flower':
        svg += `<circle cx="${x}" cy="${y-10}" r="8" fill="#ff69b4"/>`;
        svg += `<circle cx="${x}" cy="${y-10}" r="4" fill="#ffd700"/>`;
        svg += `<line x1="${x}" y1="${y-2}" x2="${x}" y2="${y+10}" stroke="#228b22" stroke-width="3"/>`;
        break;
      case 'balloon':
        svg += `<ellipse cx="${x}" cy="${y-30}" rx="12" ry="15" fill="#ff6b6b"/>`;
        svg += `<line x1="${x}" y1="${y-15}" x2="${x}" y2="${y}" stroke="#333" stroke-width="1"/>`;
        break;
      case 'gift':
        svg += `<rect x="${x-10}" y="${y-15}" width="20" height="18" fill="#e74c3c"/>`;
        svg += `<rect x="${x-2}" y="${y-15}" width="4" height="18" fill="#f1c40f"/>`;
        svg += `<rect x="${x-10}" y="${y-10}" width="20" height="4" fill="#f1c40f"/>`;
        break;
      case 'swing':
        svg += `<line x1="${x-15}" y1="${y-60}" x2="${x-10}" y2="${y-20}" stroke="#8b4513" stroke-width="2"/>`;
        svg += `<line x1="${x+15}" y1="${y-60}" x2="${x+10}" y2="${y-20}" stroke="#8b4513" stroke-width="2"/>`;
        svg += `<rect x="${x-12}" y="${y-22}" width="24" height="4" fill="#deb887"/>`;
        break;
      case 'kite':
        svg += `<polygon points="${x},${y-50} ${x-15},${y-35} ${x},${y-20} ${x+15},${y-35}" fill="#9b59b6"/>`;
        svg += `<line x1="${x}" y1="${y-20}" x2="${x}" y2="${y}" stroke="#333" stroke-width="1"/>`;
        break;
      case 'star':
        svg += `<polygon points="${x},${y-20} ${x+3},${y-12} ${x+12},${y-12} ${x+5},${y-6} ${x+8},${y+3} ${x},${y-3} ${x-8},${y+3} ${x-5},${y-6} ${x-12},${y-12} ${x-3},${y-12}" fill="#ffd700"/>`;
        break;
    }
  });

  return svg;
};

/**
 * Convert SVG string to a data URL
 */
export const svgToDataURL = (svg) => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
