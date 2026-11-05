/**
 * Indoor rooms for the SVG illustrations (400 x 200 canvas).
 *
 * Each room has a background (drawn before the characters) and, where
 * something sits in front of them, a foreground: the bed's blanket covers a
 * child lying in bed, and the kitchen table hides the legs of people eating.
 * Groups carry a class so tests can check what was drawn.
 */

export const INDOOR_LOCATIONS = new Set(['bedroom', 'bathroom', 'kitchen', 'classroom']);

/** Where standing characters are centred, so they don't overlap furniture. */
export const ROOM_CHARACTER_CENTER = {
  bedroom: 285,
  bathroom: 160,
  kitchen: 200,
  classroom: 200,
};

const ROOM_COLORS = {
  bedroom: { wall: '#ebe3f7', floor: '#c99d6e', trim: '#b48a5f' },
  bathroom: { wall: 'url(#tiles)', floor: '#9cc3c9', trim: '#7fa9b0' },
  kitchen: { wall: '#fff3d6', floor: '#dcc7a4', trim: '#c4ad87' },
  classroom: { wall: '#f7eedb', floor: '#b98b5e', trim: '#9c7148' },
};

const WOOD = '#8d5a3b';

const windowSkyColor = (timeOfDay, weather) => {
  if (timeOfDay === 'night') return '#1a1a3e';
  if (timeOfDay === 'evening') return '#f6a26b';
  if (weather === 'rainy') return '#8a99a8';
  if (weather === 'snowy') return '#c9d6e3';
  return timeOfDay === 'morning' ? '#bfe3ff' : '#87ceeb';
};

/** A window showing the sky for the time of day. */
const drawWindow = (x, y, w, h, timeOfDay, weather) => {
  let view = '';
  if (timeOfDay === 'night') {
    view = `<circle cx="${x + w * 0.7}" cy="${y + h * 0.32}" r="8" fill="#fffacd"/>
      <circle cx="${x + w * 0.2}" cy="${y + h * 0.25}" r="1.5" fill="#fff"/>
      <circle cx="${x + w * 0.35}" cy="${y + h * 0.7}" r="1.5" fill="#fff"/>
      <circle cx="${x + w * 0.85}" cy="${y + h * 0.75}" r="1.5" fill="#fff"/>`;
  } else if (timeOfDay === 'evening') {
    view = `<circle cx="${x + w * 0.5}" cy="${y + h * 0.75}" r="10" fill="#ff7043"/>`;
  } else if (weather === 'rainy') {
    view = [0.2, 0.45, 0.7].map((f) => `<line x1="${x + w * f}" y1="${y + 8}" x2="${x + w * f - 4}" y2="${y + 20}" stroke="#d6e4f0" stroke-width="2"/>`).join('');
  } else {
    view = `<circle cx="${x + w * 0.3}" cy="${y + h * 0.35}" r="9" fill="#ffd54f"/>`;
  }
  return `<g class="window">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${windowSkyColor(timeOfDay, weather)}"/>
    ${view}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#ffffff" stroke-width="5"/>
    <line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="#ffffff" stroke-width="3"/>
    <line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="#ffffff" stroke-width="3"/>
  </g>`;
};

const roomShell = (location) => {
  const { wall, floor, trim } = ROOM_COLORS[location];
  const defs = location === 'bathroom'
    ? `<defs><pattern id="tiles" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#d9f1f4"/><path d="M20 0 L0 0 0 20" fill="none" stroke="#b7dde3" stroke-width="1"/>
      </pattern></defs>`
    : '';
  return `${defs}<rect width="400" height="140" fill="${wall}"/>
    <rect x="0" y="140" width="400" height="60" fill="${floor}"/>
    <rect x="0" y="136" width="400" height="6" fill="${trim}"/>`;
};

const drawBedroom = ({ timeOfDay, weather, roomProps }) => {
  const nightLight = timeOfDay === 'night' ? '<circle cx="220" cy="110" r="24" fill="#fff59d" opacity="0.35"/>' : '';
  const wardrobe = roomProps.includes('wardrobe')
    ? `<g class="wardrobe">
        <rect x="338" y="40" width="56" height="132" rx="3" fill="#a1887f"/>
        <line x1="366" y1="44" x2="366" y2="168" stroke="#795548" stroke-width="2"/>
        <circle cx="361" cy="105" r="2.5" fill="#5d4037"/><circle cx="371" cy="105" r="2.5" fill="#5d4037"/>
      </g>`
    : '';
  return `<g class="room-bedroom">
    ${roomShell('bedroom')}
    ${drawWindow(250, 22, 76, 58, timeOfDay, weather)}
    <rect x="240" y="16" width="12" height="72" rx="3" fill="#f48fb1"/>
    <rect x="324" y="16" width="12" height="72" rx="3" fill="#f48fb1"/>
    <ellipse cx="285" cy="184" rx="72" ry="9" fill="#f8bbd0"/>
    ${wardrobe}
    <g class="nightstand">
      ${nightLight}
      <rect x="205" y="136" width="30" height="34" rx="2" fill="#a1887f"/>
      <line x1="209" y1="152" x2="231" y2="152" stroke="#795548" stroke-width="1.5"/>
      <rect x="218" y="118" width="4" height="18" fill="#795548"/>
      <polygon points="208,118 232,118 227,104 213,104" fill="#fff59d"/>
    </g>
    <g class="bed">
      <rect x="26" y="92" width="14" height="80" rx="4" fill="${WOOD}"/>
      <rect x="36" y="146" width="156" height="16" fill="${WOOD}"/>
      <rect x="40" y="160" width="6" height="12" fill="${WOOD}"/>
      <rect x="182" y="160" width="6" height="12" fill="${WOOD}"/>
      <rect x="38" y="128" width="152" height="20" rx="4" fill="#ffffff" stroke="#e0e0e0"/>
      <ellipse cx="64" cy="126" rx="20" ry="9" fill="#ffffff" stroke="#d6d6d6"/>
    </g>
  </g>`;
};

const drawBathroom = ({ action }) => {
  const bubbles = action === 'washing'
    ? `<g class="bubbles">
        <circle cx="214" cy="96" r="5" fill="#ffffff" stroke="#b3e5fc"/>
        <circle cx="206" cy="86" r="3.5" fill="#ffffff" stroke="#b3e5fc"/>
        <circle cx="220" cy="80" r="3" fill="#ffffff" stroke="#b3e5fc"/>
      </g>`
    : '';
  return `<g class="room-bathroom">
    ${roomShell('bathroom')}
    <rect x="226" y="26" width="52" height="58" rx="8" fill="#cfeaf5" stroke="#90a4ae" stroke-width="3"/>
    <line x1="236" y1="38" x2="250" y2="52" stroke="#ffffff" stroke-width="3"/>
    <line x1="40" y1="70" x2="110" y2="70" stroke="#90a4ae" stroke-width="4" stroke-linecap="round"/>
    <rect x="50" y="70" width="50" height="46" rx="3" fill="#f48fb1"/>
    <rect x="50" y="104" width="50" height="5" fill="#f8bbd0"/>
    <g class="sink">
      <rect x="246" y="94" width="8" height="12" fill="#90a4ae"/>
      <rect x="246" y="94" width="18" height="4" fill="#90a4ae"/>
      <path d="M206,106 L294,106 Q290,128 250,128 Q210,128 206,106 Z" fill="#ffffff" stroke="#b0bec5" stroke-width="2"/>
      <rect x="240" y="126" width="20" height="48" fill="#ffffff" stroke="#b0bec5"/>
    </g>
    ${bubbles}
  </g>`;
};

const drawKitchen = ({ timeOfDay, weather }) => `<g class="room-kitchen">
    ${roomShell('kitchen')}
    ${drawWindow(28, 20, 78, 56, timeOfDay, weather)}
    <rect x="0" y="96" width="130" height="44" fill="#bcaaa4"/>
    <rect x="0" y="92" width="134" height="8" fill="#8d6e63"/>
    <rect x="8" y="104" width="52" height="30" fill="none" stroke="#a1887f" stroke-width="2"/>
    <rect x="68" y="104" width="52" height="30" fill="none" stroke="#a1887f" stroke-width="2"/>
    <g class="fridge">
      <rect x="334" y="34" width="58" height="106" rx="6" fill="#eceff1" stroke="#b0bec5" stroke-width="2"/>
      <line x1="334" y1="72" x2="392" y2="72" stroke="#b0bec5" stroke-width="2"/>
      <rect x="340" y="44" width="4" height="20" rx="2" fill="#90a4ae"/>
      <rect x="340" y="80" width="4" height="30" rx="2" fill="#90a4ae"/>
      <circle cx="372" cy="54" r="4" fill="#ff8a65"/>
    </g>
    <line x1="200" y1="0" x2="200" y2="26" stroke="#795548" stroke-width="2"/>
    <path d="M186,40 Q200,22 214,40 Z" fill="#ffb74d"/>
  </g>`;

const drawClassroom = () => `<g class="room-classroom">
    ${roomShell('classroom')}
    <g class="chalkboard">
      <rect x="36" y="18" width="214" height="80" rx="3" fill="${WOOD}"/>
      <rect x="42" y="24" width="202" height="68" fill="#2f5d3a"/>
      <text x="62" y="52" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">A B C</text>
      <text x="62" y="82" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#fff59d">1 2 3</text>
      <rect x="42" y="92" width="202" height="4" fill="#6d4c41"/>
    </g>
    <circle cx="330" cy="40" r="17" fill="#ffffff" stroke="#5d4037" stroke-width="3"/>
    <line x1="330" y1="40" x2="330" y2="29" stroke="#333" stroke-width="2"/>
    <line x1="330" y1="40" x2="338" y2="44" stroke="#333" stroke-width="2"/>
    <g class="bookshelf">
      <rect x="300" y="80" width="80" height="56" fill="#a1887f"/>
      <line x1="300" y1="108" x2="380" y2="108" stroke="#795548" stroke-width="3"/>
      ${['#e57373', '#64b5f6', '#81c784', '#ffd54f', '#ba68c8'].map((c, i) => `<rect x="${306 + i * 14}" y="86" width="10" height="20" fill="${c}"/>`).join('')}
      ${['#4db6ac', '#ff8a65', '#9575cd', '#f06292'].map((c, i) => `<rect x="${310 + i * 16}" y="113" width="12" height="21" fill="${c}"/>`).join('')}
    </g>
  </g>`;

/**
 * Draw an indoor room behind the characters.
 * @param {string} location - one of INDOOR_LOCATIONS
 * @param {{ timeOfDay: string, weather: string, action: string, roomProps?: string[] }} options
 */
export const drawRoom = (location, { timeOfDay, weather, action, roomProps = [] }) => {
  switch (location) {
    case 'bedroom': return drawBedroom({ timeOfDay, weather, roomProps });
    case 'bathroom': return drawBathroom({ action });
    case 'kitchen': return drawKitchen({ timeOfDay, weather });
    case 'classroom': return drawClassroom();
    default: return '';
  }
};

const drawMeal = (meal) => {
  if (meal === 'dinner') {
    return `<g class="meal-dinner">${[140, 200, 260].map((x) => `
      <ellipse cx="${x}" cy="144" rx="20" ry="5" fill="#ffffff" stroke="#cfd8dc"/>
      <ellipse cx="${x - 5}" cy="141" rx="7" ry="4" fill="#a1662f"/>
      <circle cx="${x + 5}" cy="141" r="2" fill="#7cb342"/><circle cx="${x + 9}" cy="142" r="2" fill="#7cb342"/><circle cx="${x + 7}" cy="139" r="2" fill="#7cb342"/>`).join('')}
    </g>`;
  }
  return `<g class="meal-breakfast">${[150, 250].map((x) => `
      <path d="M${x - 16},140 Q${x},156 ${x + 16},140 Z" fill="#4fc3f7"/>
      <circle cx="${x - 7}" cy="139" r="3" fill="#ffcc80"/><circle cx="${x}" cy="138" r="3" fill="#ffcc80"/><circle cx="${x + 7}" cy="139" r="3" fill="#ffcc80"/>`).join('')}
      <rect x="193" y="128" width="14" height="18" rx="2" fill="#ffb74d" stroke="#ffffff" stroke-width="2"/>
    </g>`;
};

/**
 * Draw anything that sits in front of the characters.
 * @param {string} location
 * @param {{ meal?: 'breakfast'|'dinner'|null }} options
 */
export const drawRoomForeground = (location, { meal } = {}) => {
  if (location === 'bedroom') {
    return `<g class="blanket">
      <rect x="78" y="120" width="112" height="30" rx="9" fill="#6fa8dc"/>
      <rect x="78" y="120" width="112" height="7" rx="3" fill="#9fc5e8"/>
      <rect x="186" y="116" width="10" height="56" rx="3" fill="${WOOD}"/>
    </g>`;
  }
  if (location === 'kitchen') {
    // The cloth reaches the floor so it hides the legs and feet of people sitting behind it
    const stripes = [115, 145, 175, 205, 235, 265].map((x) => `<rect x="${x}" y="152" width="12" height="44" fill="#ffcdd2"/>`).join('');
    return `<g class="table">
      <rect x="100" y="146" width="200" height="8" rx="2" fill="#ffffff"/>
      <rect x="100" y="152" width="200" height="48" fill="#ef9a9a"/>
      ${stripes}
      <rect x="100" y="194" width="200" height="6" fill="#e57373"/>
      ${drawMeal(meal)}
    </g>`;
  }
  if (location === 'classroom') {
    return `<g class="desk">
      <rect x="292" y="146" width="90" height="7" fill="#a1887f"/>
      <rect x="298" y="153" width="6" height="32" fill="#8d6e63"/>
      <rect x="370" y="153" width="6" height="32" fill="#8d6e63"/>
      <circle cx="360" cy="140" r="6" fill="#e53935"/>
      <line x1="360" y1="134" x2="361" y2="130" stroke="#5d4037" stroke-width="2"/>
    </g>`;
  }
  return '';
};

/**
 * The child lying in bed, in two layers around the blanket.
 * @param {{ skin: string, hair: string, longHair: boolean }} look
 * @param {'awake'|'asleep'} state
 * @returns {{ behind: string, front: string }}
 */
export const drawChildInBed = (look, state) => {
  const hair = look.longHair
    ? `<ellipse cx="55" cy="119" rx="11" ry="14" fill="${look.hair}"/>`
    : `<ellipse cx="57" cy="113" rx="8" ry="10" fill="${look.hair}"/>`;
  const eyes = state === 'asleep'
    ? `<path d="M57,113 Q60,116 63,113" stroke="#000" stroke-width="1.5" fill="none"/>
       <path d="M65,113 Q68,116 71,113" stroke="#000" stroke-width="1.5" fill="none"/>`
    : `<circle cx="60" cy="113" r="2" fill="#000"/><circle cx="68" cy="113" r="2" fill="#000"/>`;
  const behind = `<g class="in-bed ${state}">
    ${hair}
    <circle cx="64" cy="115" r="12" fill="${look.skin}"/>
    ${eyes}
    <path d="M59,119 Q64,123 69,119" stroke="#000" stroke-width="1.5" fill="none"/>
  </g>`;
  const front = state === 'asleep'
    ? `<g class="zzz" font-family="Arial, sans-serif" font-weight="bold" fill="#5c6bc0">
        <text x="84" y="104" font-size="12">z</text><text x="94" y="92" font-size="16">Z</text>
      </g>`
    : `<g class="hands"><circle cx="86" cy="121" r="4.5" fill="${look.skin}"/><circle cx="99" cy="121" r="4.5" fill="${look.skin}"/></g>`;
  return { behind, front };
};
