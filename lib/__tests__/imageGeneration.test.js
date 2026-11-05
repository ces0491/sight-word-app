import {
  generateIllustration,
  svgToDataURL,
  extractElements,
  createCast,
  planIllustrations,
  getStorySeed,
} from '../imageGeneration';
import { SCENE_ILLUSTRATIONS } from '../sceneIllustrations';
import { sceneLibrary } from '../storyScenes';
import { composeStory } from '../storyComposer';

/** Fill colour of the sky rectangle, the first element of every illustration. */
const skyFill = (svg) => svg.match(/<rect width="400" height="130" fill="([^"]+)"/)?.[1];

/** Number of positioned groups (characters, animals, vehicles, objects). */
const groupCount = (svg) => (svg.match(/<g transform=/g) || []).length;

// Skin tones and star positions use Math.random; fix it so output is repeatable.
beforeEach(() => {
  jest.spyOn(Math, 'random').mockReturnValue(0.5);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('extractElements', () => {
  it.each(['dog', 'cat', 'bird', 'rabbit', 'duck', 'fish', 'butterfly', 'bee', 'horse', 'cow'])(
    'detects the animal "%s"',
    (animal) => {
      expect(extractElements(`I saw a ${animal}`).animals).toContain(animal);
    }
  );

  it.each(['bike', 'car', 'bus', 'train', 'truck', 'boat'])('detects the vehicle "%s"', (vehicle) => {
    expect(extractElements(`I saw a ${vehicle}`).vehicles).toContain(vehicle);
  });

  it.each([
    ['It was a rainy day', 'rainy'],
    ['It was a snowy day', 'snowy'],
    ['It was cloudy outside', 'cloudy'],
    ['It was windy today', 'windy'],
    ['We played together', 'sunny'],
  ])('reads the weather in "%s" as %s', (sentence, weather) => {
    expect(extractElements(sentence).weather).toBe(weather);
  });

  it.each([
    ['It was night time', 'night'],
    ['We ate breakfast', 'morning'],
    ['We watched the sunset', 'evening'],
    ['We played together', 'day'],
  ])('reads the time of day in "%s" as %s', (sentence, timeOfDay) => {
    expect(extractElements(sentence).timeOfDay).toBe(timeOfDay);
  });

  it.each([
    ['We went to school', 'school'],
    ['We played at the park', 'park'],
    ['We went to the beach', 'beach'],
    ['We went to the store', 'store'],
    ['I like to jump', 'outside'],
  ])('reads the location in "%s" as %s', (sentence, location) => {
    expect(extractElements(sentence).location).toBe(location);
  });

  it('reads emotions', () => {
    expect(extractElements('The sad boy cried').emotion).toBe('sad');
    expect(extractElements('The child stood still').emotion).toBe('happy');
  });

  it('detects several elements in one sentence', () => {
    const elements = extractElements('The happy dog ran to the park on a rainy day');

    expect(elements.animals).toContain('dog');
    expect(elements.location).toBe('park');
    expect(elements.weather).toBe('rainy');
    expect(elements.action).toBe('running');
  });

  it('is case-insensitive', () => {
    expect(extractElements('The DOG ran').animals).toContain('dog');
    expect(extractElements('The Dog Ran').animals).toContain('dog');
  });

  it('always includes a child and adds named adults', () => {
    const roles = extractElements('Mom and I went home').characters.map((c) => c.role);

    expect(roles).toContain('child');
    expect(roles).toContain('mom');
  });

  it.each([null, undefined, ''])('returns defaults for %p', (input) => {
    const elements = extractElements(input);

    expect(elements.location).toBe('outside');
    expect(elements.animals).toEqual([]);
    expect(elements.vehicles).toEqual([]);
  });
});

describe('generateIllustration', () => {
  it('generates valid SVG markup', () => {
    const svg = generateIllustration('The dog ran to the park');

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 400 200"');
  });

  it('is repeatable for the same sentence and random seed', () => {
    expect(generateIllustration('The dog ran')).toBe(generateIllustration('The dog ran'));
  });

  it('draws a different sky for rain, snow and night', () => {
    const sunny = skyFill(generateIllustration('We played together'));

    expect(sunny).toBeDefined();
    expect(skyFill(generateIllustration('It was a rainy day'))).not.toBe(sunny);
    expect(skyFill(generateIllustration('It was a snowy day'))).not.toBe(sunny);
    expect(skyFill(generateIllustration('It was night time'))).not.toBe(sunny);
  });

  it('draws animals and vehicles when the sentence mentions them', () => {
    const plain = groupCount(generateIllustration('The child stood'));

    expect(groupCount(generateIllustration('The dog stood'))).toBeGreaterThan(plain);
    expect(groupCount(generateIllustration('The child saw a car'))).toBeGreaterThan(
      groupCount(generateIllustration('The child saw a thing'))
    );
  });

  it('always includes a background', () => {
    const svg = generateIllustration('Hello');

    expect(skyFill(svg)).toBeDefined();
  });

  it('generates valid SVG for minimal sentences', () => {
    const svg = generateIllustration('I go');

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('viewBox="0 0 400 200"');
  });

  it('generates illustrations quickly', () => {
    const startTime = Date.now();
    for (let i = 0; i < 100; i++) {
      generateIllustration('The happy dog ran to the park on a rainy day');
    }
    // 100 illustrations in under a second
    expect(Date.now() - startTime).toBeLessThan(1000);
  });

  it.each([null, undefined, ''])('handles %p input', (input) => {
    const svg = generateIllustration(input);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('handles very long sentences', () => {
    const longSentence =
      'The dog and cat and bird and fish and horse and cow went to the school and park and beach on a rainy snowy cloudy day';
    const svg = generateIllustration(longSentence);

    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('does not copy sentence text into the SVG', () => {
    const svg = generateIllustration('The dog\'s ball! "Wow," she said. <Amazing>');

    expect(svg).not.toContain('<Amazing>');
    expect(svg).toContain('</svg>');
  });
});

describe('svgToDataURL', () => {
  it('converts SVG to a data URL', () => {
    const dataUrl = svgToDataURL('<svg><rect /></svg>');

    expect(dataUrl).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
    expect(dataUrl).toContain('svg');
  });

  it('encodes special characters', () => {
    const dataUrl = svgToDataURL('<svg><text>Test & "quotes"</text></svg>');

    expect(dataUrl).not.toContain('&');
    expect(dataUrl).not.toContain('"');
  });

  it('handles generated illustrations', () => {
    const dataUrl = svgToDataURL(generateIllustration('The happy dog ran to the park'));

    expect(dataUrl).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
    expect(dataUrl.length).toBeGreaterThan(100);
  });
});

/** Fill colour of the first standing character's head. */
const firstHeadFill = (svg) => svg.match(/<circle cx="0" cy="-30" r="14" fill="([^"]+)"\/>/)?.[1];

const KNOWN_LOCATIONS = [
  'bedroom', 'bathroom', 'kitchen', 'classroom', 'home', 'street', 'park', 'garden', 'hill', 'store', 'outside',
];
const KNOWN_ROLES = ['child', 'mom', 'dad', 'teacher', 'friend', 'friend2'];

describe('story cast', () => {
  it('gives each role a fixed look for a given seed', () => {
    expect(createCast(42)).toEqual(createCast(42));
  });

  it('gives each role a different shirt', () => {
    const shirts = Object.values(createCast('story')).map((look) => look.shirt);
    expect(new Set(shirts).size).toBe(shirts.length);
  });

  it('draws the child the same way on every page of a story', () => {
    const storySeed = 1234;
    const heads = ['Mia ran to the park.', 'Mia saw a dog.', 'Mia was happy.'].map((sentence) =>
      firstHeadFill(generateIllustration(sentence, { storySeed }))
    );

    expect(heads[0]).toBeDefined();
    expect(new Set(heads).size).toBe(1);
  });

  it('does not use Math.random', () => {
    generateIllustration('It was night time and it was snowy', { storySeed: 7 });
    expect(Math.random).not.toHaveBeenCalled();
  });

  it('keeps the same seed when a story is saved', () => {
    const draft = { title: 'A Day Out', content: ['One morning, Mia woke up.'] };
    expect(getStorySeed({ ...draft, _id: 'abc', createdAt: '2026-01-01' })).toBe(getStorySeed(draft));
  });
});

describe('scene illustrations', () => {
  it('has a spec for every scene in the story library', () => {
    const missing = sceneLibrary.map((scene) => scene.id).filter((id) => !SCENE_ILLUSTRATIONS[id]);
    expect(missing).toEqual([]);
  });

  it.each(Object.entries(SCENE_ILLUSTRATIONS))('%s uses known locations and roles', (id, spec) => {
    if (spec.location) expect(KNOWN_LOCATIONS).toContain(spec.location);
    expect(spec.characters.length).toBeGreaterThan(0);
    spec.characters.forEach((role) => expect(KNOWN_ROLES).toContain(role));
  });

  it.each([
    ['morning_wake', ['room-bedroom', 'in-bed awake']],
    ['sleep_happy', ['room-bedroom', 'in-bed asleep', 'zzz']],
    ['get_dressed', ['room-bedroom', 'wardrobe']],
    ['wash_up', ['room-bathroom', 'bubbles']],
    ['eat_breakfast', ['room-kitchen', 'meal-breakfast']],
    ['dinner_time', ['room-kitchen', 'meal-dinner']],
    ['learn_new', ['room-classroom', 'chalkboard']],
    ['sit_rest', ['bench']],
    ['sing_song', ['music-notes']],
  ])('draws %s', (scene, classes) => {
    const svg = generateIllustration('Any sentence.', { storySeed: 1, scene });
    classes.forEach((name) => expect(svg).toContain(`class="${name}"`));
  });

  it('draws a sleeping child in bed from keywords alone', () => {
    const svg = generateIllustration('Mia went to sleep in her bed.', { storySeed: 1 });
    expect(svg).toContain('class="in-bed asleep"');
  });

  it('ignores an unknown scene id and falls back to keywords', () => {
    const svg = generateIllustration('We played at the park', { storySeed: 1, scene: 'no_such_scene' });
    expect(svg).toContain('</svg>');
    expect(svg).not.toContain('class="room-');
  });
});

describe('planIllustrations', () => {
  it('uses one seed for every page', () => {
    const plan = planIllustrations({ title: 'T', content: ['a', 'b'], scenes: [] });
    expect(new Set(plan.map((page) => page.storySeed)).size).toBe(1);
  });

  it('keeps an activity scene where the previous page was', () => {
    const plan = planIllustrations({
      title: 'T',
      content: ['At the park...', 'A friend came over.'],
      scenes: ['arrive_park', 'meet_friend'],
    });
    expect(plan.map((page) => page.location)).toEqual(['park', 'park']);
  });

  it('moves an activity scene outdoors after a room in the house', () => {
    const plan = planIllustrations({
      title: 'T',
      content: ['Breakfast.', 'Eat.', 'A friend came over.'],
      scenes: ['eat_breakfast', 'eat_breakfast', 'meet_friend'],
    });
    expect(plan[2].location).toBe('park');
  });

  it('carries the setting forward for sentences that name no place', () => {
    const plan = planIllustrations({
      title: 'T',
      content: ['We had breakfast in the kitchen.', 'It was very good.', 'Then we went to the park.'],
    });
    expect(plan.map((page) => page.location)).toEqual(['kitchen', 'kitchen', 'park']);
  });

  it('lines up with a composed Classic story, extra sentences included', () => {
    const composed = composeStory(['the', 'dog', 'eight', 'because', 'round'], 'Mia');
    const plan = planIllustrations({ title: composed.title, content: composed.sentences, scenes: composed.sentenceScenes });

    expect(composed.sentenceScenes).toHaveLength(composed.sentences.length);
    expect(plan).toHaveLength(composed.sentences.length);
    composed.sentenceScenes.forEach((scene, index) => {
      if (scene === null) return;
      const sceneSentences = sceneLibrary.find((s) => s.id === scene).sentences.map((t) => t.replace(/{name}/g, 'Mia'));
      expect(sceneSentences).toContain(composed.sentences[index]);
    });
  });
});

describe('extractElements location detection', () => {
  it('reports whether the sentence named a place', () => {
    expect(extractElements('We went to the park').hasLocation).toBe(true);
    expect(extractElements('I like to jump').hasLocation).toBe(false);
  });

  it.each([
    ['Mia went to sleep in her bed', 'bedroom'],
    ['Before bed, Mom read a story', 'bedroom'],
    ['We ate breakfast together', 'kitchen'],
    ['Mia brushed her teeth at the sink', 'bathroom'],
    ['The teacher wrote on the chalkboard', 'classroom'],
  ])('reads "%s" as %s', (sentence, location) => {
    expect(extractElements(sentence).location).toBe(location);
  });
});
