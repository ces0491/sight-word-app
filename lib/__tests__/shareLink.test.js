import { makeShareLink, readShareLink, SHARED_STORY_PATH } from '../shareLink';
import { STORY_LIMITS } from '../limits';

const ORIGIN = 'https://sightwords.example';

const story = {
  id: 'library-id',
  createdAt: '2026-11-10T08:00:00.000Z',
  title: 'The Dog Can Run',
  content: ['The dog can run.', 'I see the dog.'],
  scenes: ['park-run', null],
  words: ['the', 'can', 'see', 'jump'],
  usedWords: ['jump'],
  format: 'bold',
  includeImages: false,
  grade: 2,
  learningNeeds: { dyslexia: true, adhd: true },
  timestamp: '2026-11-10T08:00:00.000Z',
};

const hashOf = (link) => new URL(link).hash;

/** Compress text as share links do, for links the app wouldn't make. */
const pack = async (text) => {
  const stream = new CompressionStream('deflate-raw');
  const writer = stream.writable.getWriter();
  writer.write(new TextEncoder().encode(text));
  writer.close();
  const chunks = [];
  const reader = stream.readable.getReader();
  for (let next = await reader.read(); !next.done; next = await reader.read()) chunks.push(Buffer.from(next.value));
  return `#1.${Buffer.concat(chunks).toString('base64url')}`;
};

/** Letters from a fixed sequence, so the long-story test is the same every run. */
const letters = (count, seed) => {
  let state = seed;
  return Array.from({ length: count }, () => {
    state = (state * 1103515245 + 12345) % 2 ** 31;
    return String.fromCharCode(97 + (state % 26));
  }).join('');
};

describe('makeShareLink and readShareLink', () => {
  it('carry the story in the fragment, without learning needs or library fields', async () => {
    const link = await makeShareLink(story, ORIGIN);

    expect(link.startsWith(`${ORIGIN}${SHARED_STORY_PATH}#1.`)).toBe(true);
    expect(await readShareLink(hashOf(link))).toEqual({
      title: 'The Dog Can Run',
      content: ['The dog can run.', 'I see the dog.'],
      scenes: ['park-run', null],
      words: ['the', 'can', 'see', 'jump'],
      // Worked out from the text again, not taken from the link
      usedWords: ['the', 'can', 'see'],
      format: 'bold',
      includeImages: false,
      grade: 2,
    });
  });

  it('keep accented letters and emoji', async () => {
    const link = await makeShareLink({ ...story, title: 'Café time 🐶', content: ['Le café est là.'] }, ORIGIN);
    const read = await readShareLink(hashOf(link));
    expect(read.title).toBe('Café time 🐶');
    expect(read.content).toEqual(['Le café est là.']);
  });

  it('fit the longest story allowed into a link they can read back', async () => {
    const longest = {
      ...story,
      title: letters(STORY_LIMITS.maxTitleLength, 1),
      content: Array.from({ length: STORY_LIMITS.maxSentences }, (_, i) => letters(STORY_LIMITS.maxSentenceLength, i + 2)),
      scenes: [],
      words: Array.from({ length: STORY_LIMITS.maxWords }, (_, i) => letters(STORY_LIMITS.maxWordLength, i + 100)),
    };
    const link = await makeShareLink(longest, ORIGIN);

    // readShareLink refuses data over 100,000 characters
    expect(hashOf(link).length).toBeLessThan(100_000);
    expect((await readShareLink(hashOf(link))).content).toEqual(longest.content);
  });

  it("won't make a link for something that isn't a story", async () => {
    await expect(makeShareLink({ ...story, title: '' }, ORIGIN)).rejects.toThrow();
  });
});

describe('readShareLink', () => {
  it.each([
    ['nothing', ''],
    ['an empty fragment', '#'],
    ['no data', '#1.'],
    ['an unknown format', '#2.abc'],
    ['characters outside base64url', '#1.abc+/='],
    ['data that isn’t compressed', '#1.aGVsbG8gd29ybGQ'],
  ])('returns null for %s', async (_, hash) => {
    expect(await readShareLink(hash)).toBeNull();
  });

  it('returns null for a link cut short', async () => {
    const hash = hashOf(await makeShareLink(story, ORIGIN));
    expect(await readShareLink(hash.slice(0, -12))).toBeNull();
  });

  it('returns null for a link that holds something other than a story', async () => {
    expect(await readShareLink(await pack('{"title":5}'))).toBeNull();
    expect(await readShareLink(await pack('not json'))).toBeNull();
  });

  it('returns null for a link that unpacks to far more than any story', async () => {
    // A megabyte of one letter compresses to almost nothing
    const hash = await pack(JSON.stringify({ ...story, title: 'a'.repeat(1_000_000) }));
    expect(hash.length).toBeLessThan(10_000);
    expect(await readShareLink(hash)).toBeNull();
  });

  it('returns null for data longer than any story makes', async () => {
    expect(await readShareLink(`#1.${'A'.repeat(100_001)}`)).toBeNull();
  });
});
