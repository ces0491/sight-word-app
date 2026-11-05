import { generateIllustration, svgToDataURL, extractElements } from '../imageGeneration';

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
