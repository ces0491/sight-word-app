/**
 * SVG illustrations for story sentences, drawn in code (no image APIs).
 *
 * - Classic stories pass the scene each sentence came from, and the page is
 *   drawn from that scene's spec (lib/sceneIllustrations.js).
 * - Other sentences (AI stories, extra sentences) are read for keywords.
 * - A story seed fixes the cast's looks and all other randomness, so every
 *   page shows the same people and a story renders the same way each time.
 */

import { createRandom, hashString, pick, shuffle } from './seededRandom.js';
import { SCENE_ILLUSTRATIONS } from './sceneIllustrations.js';
import {
  INDOOR_LOCATIONS,
  ROOM_CHARACTER_CENTER,
  drawRoom,
  drawRoomForeground,
  drawChildInBed,
} from './illustrationRooms.js';

const SKIN_TONES = ['#ffe0bd', '#f1c27d', '#d4a574', '#a0662f', '#8d5524'];
const HAIR_COLORS = ['#2c1810', '#4a3728', '#8b4513', '#daa520', '#cd853f'];
const SHIRT_COLORS = ['#4169e1', '#9932cc', '#ff6347', '#32cd32', '#ff8c00', '#20b2aa'];
const CAST_ROLES = ['child', 'mom', 'dad', 'teacher', 'friend', 'friend2'];
const ADULT_ROLES = new Set(['mom', 'dad', 'teacher']);
const HOME_ROOMS = new Set(['bedroom', 'bathroom', 'kitchen']);

/**
 * The look of each role in a story, fixed by the story seed.
 * @param {number|string} seed
 * @returns {Record<string, { skin: string, hair: string, longHair: boolean, shirt: string }>}
 */
export const createCast = (seed) => {
  const random = createRandom(`cast|${seed}`);
  const shirts = shuffle(random, SHIRT_COLORS);
  return Object.fromEntries(
    CAST_ROLES.map((role, index) => [
      role,
      {
        skin: pick(random, SKIN_TONES),
        hair: pick(random, HAIR_COLORS),
        longHair: role === 'mom' ? true : role === 'dad' ? false : random() < 0.5,
        shirt: shirts[index % shirts.length],
      },
    ])
  );
};

/** Seed for a story's illustrations; the same before and after saving. */
export const getStorySeed = (story) => hashString(`${story?.title ?? ''}|${story?.content?.[0] ?? ''}`);

const toCharacter = (role) => ({ role, isAdult: ADULT_ROLES.has(role) });

/**
 * Work out the drawing options for each page of a story. Pages whose scene
 * or text names no place stay where the previous page was; activity scenes
 * that name no place move outdoors (to the park) rather than staying in a
 * room of the house.
 * @param {{ title?: string, content?: string[], scenes?: (string|null)[] }} story
 * @returns {{ storySeed: number, scene: string|null, location: string }[]}
 */
export const planIllustrations = (story) => {
  const content = Array.isArray(story?.content) ? story.content : [];
  const scenes = Array.isArray(story?.scenes) ? story.scenes : [];
  const storySeed = getStorySeed(story);
  let previous = null;

  return content.map((sentence, index) => {
    const scene = SCENE_ILLUSTRATIONS[scenes[index]] ? scenes[index] : null;
    const spec = scene ? SCENE_ILLUSTRATIONS[scene] : null;
    let location;
    if (spec?.location) {
      location = spec.location;
    } else if (spec) {
      location = previous && !HOME_ROOMS.has(previous) ? previous : 'park';
    } else {
      const detected = extractElements(sentence);
      location = detected.hasLocation ? detected.location : previous ?? 'outside';
    }
    previous = location;
    return { storySeed, scene, location };
  });
};

/** Elements for a scene-driven page. */
const elementsFromSpec = (spec) => ({
  location: spec.location ?? 'park',
  weather: spec.weather ?? 'sunny',
  timeOfDay: spec.timeOfDay ?? 'day',
  action: spec.action ?? 'standing',
  emotion: spec.emotion ?? 'happy',
  characters: spec.characters.map(toCharacter),
  animals: spec.animals ?? [],
  vehicles: spec.vehicles ?? [],
  foodItems: spec.foodItems ?? [],
  objects: spec.objects ?? [],
  inBed: spec.inBed ?? null,
  roomProps: spec.roomProps ?? [],
});

/**
 * Generate an SVG illustration for one sentence.
 * @param {string} sentence - The sentence to illustrate
 * @param {object} [options]
 * @param {number|string} [options.storySeed] - Fixes the cast and other randomness for a story
 * @param {string|null} [options.scene] - Scene id from lib/storyScenes.js
 * @param {string} [options.location] - Location chosen by planIllustrations
 * @returns {string} - Complete SVG code
 */
export const generateIllustration = (sentence, options = {}) => {
  const text = typeof sentence === 'string' ? sentence : '';
  const storySeed = options.storySeed ?? text;
  const random = createRandom(`${storySeed}|${text}`);
  const cast = createCast(storySeed);

  const spec = options.scene ? SCENE_ILLUSTRATIONS[options.scene] : null;
  const elements = spec ? elementsFromSpec(spec) : { ...extractElements(text), inBed: null, roomProps: [] };
  const location = options.location ?? elements.location;
  const { action, timeOfDay, weather } = elements;
  const indoor = INDOOR_LOCATIONS.has(location);

  // A sleeping child in a bedroom is drawn in bed even without a scene spec.
  const inBed = elements.inBed ?? (location === 'bedroom' && action === 'sleeping' ? 'asleep' : null);
  const childInBed = inBed && location === 'bedroom' ? drawChildInBed(cast.child, inBed) : null;
  const standing = childInBed ? elements.characters.filter((c) => c.role !== 'child') : elements.characters;
  const meal = location === 'kitchen' ? (timeOfDay === 'evening' || timeOfDay === 'night' ? 'dinner' : 'breakfast') : null;
  const riding = action === 'riding' && elements.vehicles.includes('bike');
  const center = riding ? 200 : ROOM_CHARACTER_CENTER[location] ?? 200;
  // A sitting character sits on the bench rather than beside it
  const benchUnderCharacter = action === 'sitting' && elements.objects.includes('bench');
  const objects = benchUnderCharacter ? elements.objects.filter((o) => o !== 'bench') : elements.objects;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200">`;
  svg += indoor
    ? drawRoom(location, { timeOfDay, weather, action, roomProps: elements.roomProps })
    : generateBackground(location, weather, timeOfDay, random);

  if (elements.vehicles.length > 0) {
    svg += generateVehicles(elements.vehicles, riding ? 200 : 100);
  }
  if (elements.animals.length > 0) {
    svg += generateAnimals(elements.animals);
  }
  if (childInBed) {
    svg += childInBed.behind;
  }

  if (benchUnderCharacter) {
    svg += drawBench(center, 165);
  }

  svg += generateCharacters(standing, action, elements.emotion, cast, center);

  if (indoor) {
    svg += drawRoomForeground(location, { meal });
  }
  if (childInBed) {
    svg += childInBed.front;
  }
  if (elements.foodItems.length > 0 && location !== 'kitchen') {
    svg += generateFood(elements.foodItems);
  }
  if (objects.length > 0) {
    svg += generateObjects(objects);
  }

  svg += '</svg>';
  return svg;
};

/**
 * Extract key elements from a sentence with improved detection
 */
export const extractElements = (sentence) => {
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
  // Not "cold" or "ice": a cold drink or an ice cream isn't snow
  if (/\b(snow|snowy|snowman|winter|freezing)\b/.test(lower)) weather = 'snowy';
  if (/\b(cloud|cloudy|overcast)\b/.test(lower)) weather = 'cloudy';
  if (/\b(wind|windy|breezy)\b/.test(lower)) weather = 'windy';

  // Determine location; later matches take precedence
  let location = null;
  if (/\b(school|class|learn|student)\b/.test(lower)) location = 'school';
  if (/\b(classroom|teacher|desk|lesson|chalkboard)\b/.test(lower)) location = 'classroom';
  if (/\b(park|playground|swing|slide|sandbox)\b/.test(lower)) location = 'park';
  if (/\b(home|house|room|door|window|inside|family)\b/.test(lower)) location = 'home';
  if (/\b(beach|ocean|water|sand|wave|swim)\b/.test(lower)) location = 'beach';
  if (/\b(library|book|read|story)\b/.test(lower)) location = 'library';
  if (/\b(kitchen|breakfast|lunch|dinner|table|cook|cooked)\b/.test(lower)) location = 'kitchen';
  if (/\b(bed|bedroom|pillow|blanket|asleep|sleep|nap|dream|dreams)\b/.test(lower)) location = 'bedroom';
  if (/\b(bath|bathroom|sink|toothbrush|teeth)\b/.test(lower)) location = 'bathroom';
  if (/\b(store|shop|buy|market)\b/.test(lower)) location = 'store';
  if (/\b(hill|mountain|hike)\b/.test(lower)) location = 'hill';
  if (/\b(street|road|walk|neighborhood|block)\b/.test(lower)) location = 'street';
  if (/\b(garden|flower|plant|grow)\b/.test(lower)) location = 'garden';
  const hasLocation = location !== null;
  location ??= 'outside';

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
    hasLocation,
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
    characters.push(toCharacter('mom'));
  }
  if (hasDad) {
    characters.push(toCharacter('dad'));
  }
  if (hasTeacher) {
    characters.push(toCharacter('teacher'));
  }

  // Always add at least one child (the main character)
  characters.push(toCharacter('child'));

  // Add friend if mentioned
  if (hasFriend || hasMany) {
    characters.push(toCharacter('friend'));
  }

  // Add more for "everyone" or "many"
  if (hasMany && characters.length < 4) {
    characters.push(toCharacter('friend2'));
  }

  return characters;
};

/**
 * Generate background based on location, weather, and time
 */
const generateBackground = (location, weather, timeOfDay, random) => {
  let sky = '';
  let ground = '';
  let extras = '';

  // Sky based on time of day and weather
  if (timeOfDay === 'night') {
    sky = '<rect width="400" height="130" fill="#1a1a3e"/>';
    extras += `
      <circle cx="350" cy="40" r="20" fill="#fffacd"/>
      ${[...Array(15)].map(() =>
        `<circle cx="${50 + random() * 300}" cy="${20 + random() * 60}" r="${1 + random() * 2}" fill="#fff"/>`
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
        `<circle cx="${random() * 400}" cy="${random() * 130}" r="${2 + random() * 3}" fill="#fff"/>`
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
        <ellipse cx="300" cy="186" rx="90" ry="8" fill="#e6d3a3"/>
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
      extras += `
        <rect x="58" y="96" width="8" height="36" fill="#8b4513"/>
        <circle cx="62" cy="88" r="22" fill="#2e8b57"/>
        <rect x="336" y="100" width="8" height="32" fill="#8b4513"/>
        <circle cx="340" cy="92" r="19" fill="#3cb371"/>
      `;
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

/** Two music notes, for singing. */
const drawMusicNotes = (x, y) => `<g class="music-notes" fill="#5c6bc0" stroke="#5c6bc0">
    <ellipse cx="${x}" cy="${y}" rx="4" ry="3"/><line x1="${x + 3.5}" y1="${y}" x2="${x + 3.5}" y2="${y - 14}" stroke-width="2"/>
    <ellipse cx="${x + 14}" cy="${y - 8}" rx="4" ry="3"/><line x1="${x + 17.5}" y1="${y - 8}" x2="${x + 17.5}" y2="${y - 22}" stroke-width="2"/>
    <line x1="${x + 3.5}" y1="${y - 14}" x2="${x + 17.5}" y2="${y - 22}" stroke-width="3"/>
  </g>`;

/**
 * Draw standing characters, each with the look the story's cast gives them.
 * @param {{ role: string, isAdult: boolean }[]} characters
 * @param {string} action
 * @param {string} emotion
 * @param {ReturnType<typeof createCast>} cast
 * @param {number} [center] - x position the group is centred on
 */
const generateCharacters = (characters, action, emotion, cast, center = 200) => {
  let svg = '';

  // Calculate positions based on number of characters
  const positions = [];
  const numChars = Math.min(characters.length, 4);
  const startX = center - (numChars - 1) * 35;

  for (let i = 0; i < numChars; i++) {
    positions.push({ x: startX + i * 70, y: 145 });
  }

  characters.forEach((char, index) => {
    if (index >= positions.length) return;

    const { x, y } = positions[index];
    const look = cast[char.role] ?? cast.friend;
    const { skin, hair, shirt } = look;
    const scale = char.isAdult ? 1.2 : 1;
    const yOffset = char.isAdult ? -15 : 0;

    // Adjust y position for actions
    let actionYOffset = 0;
    if (action === 'jumping') actionYOffset = -15;
    if (action === 'sitting') actionYOffset = 10;
    if (action === 'eating') actionYOffset = 12;
    if (action === 'riding') actionYOffset = -14;

    const finalY = y + yOffset + actionYOffset;

    // Shadow on the ground, unless the character is off the ground or behind a table
    if (!['jumping', 'eating', 'riding'].includes(action)) {
      svg += `<ellipse cx="${x}" cy="${y + 36}" rx="${16 * scale}" ry="3.5" fill="#000" opacity="0.15"/>`;
    }
    if (action === 'singing' && index === 0) {
      svg += drawMusicNotes(x + 18, finalY - 48 * scale);
    }

    svg += `<g transform="translate(${x}, ${finalY}) scale(${scale})">`;

    // Body
    svg += `<rect x="-12" y="-15" width="24" height="30" rx="3" fill="${shirt}"/>`;

    // Head
    svg += `<circle cx="0" cy="-30" r="14" fill="${skin}"/>`;

    // Hair: long or short, fixed per role by the story's cast
    if (look.longHair) {
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

/** Kinds the generators below can draw. Others are detected but have no picture. */
export const DRAWN_ANIMALS = ['dog', 'cat', 'bird', 'rabbit', 'butterfly', 'duck'];
export const DRAWN_VEHICLES = ['bike', 'car', 'bus'];
export const DRAWN_OBJECTS = ['ball', 'book', 'flower', 'balloon', 'gift', 'swing', 'kite', 'bench', 'coin', 'star'];

/**
 * Generate animals
 */
const generateAnimals = (animals) => {
  let svg = '';
  // Only animals with a drawing below take a place, so a fish doesn't leave a gap
  const shown = animals.filter((animal) => DRAWN_ANIMALS.includes(animal)).slice(0, 4);

  shown.forEach((animal, index) => {
    // One animal sits to the right; several spread across the picture
    const x = shown.length === 1 ? 320 : 60 + index * (280 / (shown.length - 1));
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
const generateVehicles = (vehicles, startX = 100) => {
  let svg = '';

  // Two at most, 150 apart, so they stay inside the 400-wide picture
  const shown = vehicles.filter((vehicle) => DRAWN_VEHICLES.includes(vehicle)).slice(0, 2);
  shown.forEach((vehicle, index) => {
    const x = startX + index * 150;
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
      case 'cookie':
        svg += `
          <g transform="translate(${x}, ${y})">
            <circle cx="0" cy="5" r="11" fill="#d7a35f"/>
            <circle cx="-4" cy="2" r="2" fill="#5d4037"/>
            <circle cx="4" cy="6" r="2" fill="#5d4037"/>
            <circle cx="-2" cy="10" r="1.5" fill="#5d4037"/>
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

/** A park bench whose seat is centred on x. */
const drawBench = (x, y) => `<g class="bench">
    <rect x="${x - 30}" y="${y - 30}" width="60" height="5" rx="2" fill="#8d5a3b"/>
    <rect x="${x - 30}" y="${y - 14}" width="60" height="6" rx="2" fill="#8d5a3b"/>
    <rect x="${x - 26}" y="${y - 8}" width="5" height="16" fill="#6d4c41"/>
    <rect x="${x + 21}" y="${y - 8}" width="5" height="16" fill="#6d4c41"/>
  </g>`;

/**
 * Generate objects
 */
const generateObjects = (objects) => {
  let svg = '';

  // Only objects with a drawing below take one of the three places
  objects.filter((obj) => DRAWN_OBJECTS.includes(obj)).slice(0, 3).forEach((obj, index) => {
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
      case 'bench':
        svg += drawBench(x, y);
        break;
      case 'coin':
        svg += `<circle cx="${x}" cy="${y + 8}" r="7" fill="#ffd54f" stroke="#f9a825" stroke-width="2"/>`;
        svg += `<path d="M${x + 10},${y - 2} l3,-3 M${x + 12},${y + 6} l4,0 M${x - 10},${y - 2} l-3,-3" stroke="#f9a825" stroke-width="2"/>`;
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
