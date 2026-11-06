import { splitBySightWords, findUsedWords, normalizeWordInput, findWords } from '../sightWords';
import { STORY_LIMITS } from '../limits';

describe('splitBySightWords', () => {
  it('marks whole-word matches, ignoring case', () => {
    expect(splitBySightWords('The cat sat on the mat.', ['the', 'cat'])).toEqual([
      { text: 'The', isMatch: true },
      { text: ' ', isMatch: false },
      { text: 'cat', isMatch: true },
      { text: ' sat on ', isMatch: false },
      { text: 'the', isMatch: true },
      { text: ' mat.', isMatch: false },
    ]);
  });

  it('does not match inside longer words', () => {
    const segments = splitBySightWords('There is the theme', ['the']);

    expect(segments.filter((s) => s.isMatch).map((s) => s.text)).toEqual(['the']);
  });

  it('treats regex characters in words literally instead of throwing', () => {
    expect(() => splitBySightWords('Look (here)', ['(', 'a)', '[x'])).not.toThrow();
    expect(splitBySightWords('a.b and axb', ['a.b']).filter((s) => s.isMatch)).toEqual([
      { text: 'a.b', isMatch: true },
    ]);
  });

  it('keeps markup-like text as plain text', () => {
    const text = '<img src=x onerror=alert(1)> the end';
    const segments = splitBySightWords(text, ['the']);

    expect(segments.map((s) => s.text).join('')).toBe(text);
  });

  it('returns the text unchanged when there are no words', () => {
    expect(splitBySightWords('Hello', [])).toEqual([{ text: 'Hello', isMatch: false }]);
    expect(splitBySightWords('', ['a'])).toEqual([]);
    expect(splitBySightWords(undefined, ['a'])).toEqual([]);
  });
});

describe('findUsedWords', () => {
  it('returns the words that appear, in input order and spelling', () => {
    expect(findUsedWords(['The dog ran.', 'It was fun!'], ['fun', 'Dog', 'cat'])).toEqual(['fun', 'Dog']);
  });

  it('lists each word once', () => {
    expect(findUsedWords(['the the the'], ['the', 'The'])).toEqual(['the']);
  });

  it("doesn't count a word that is only part of a contraction or compound", () => {
    expect(findUsedWords(["I can't stop.", "It's a well-known tune."], ['can', 'it', 'well'])).toEqual([]);
  });

  it('matches curly and straight apostrophes', () => {
    expect(findUsedWords(['Don’t stop!'], ["don't"])).toEqual(["don't"]);
  });

  it('matches a phrase as consecutive words', () => {
    expect(findUsedWords(['We had ice cream.'], ['ice cream', 'cream ice'])).toEqual(['ice cream']);
  });

  it('handles empty and invalid input', () => {
    expect(findUsedWords([], ['a'])).toEqual([]);
    expect(findUsedWords(['a'], [])).toEqual([]);
    expect(findUsedWords(null, null)).toEqual([]);
  });
});

describe('normalizeWordInput', () => {
  it('splits on spaces, commas and new lines and lower-cases', () => {
    expect(normalizeWordInput('The, Cat\nsat;ON')).toEqual(['the', 'cat', 'sat', 'on']);
  });

  it('keeps curly apostrophes and letters from other languages', () => {
    expect(normalizeWordInput('don’t café José')).toEqual(["don't", 'café', 'josé']);
  });

  it('drops words with digits and repeats', () => {
    expect(normalizeWordInput('the 2 the a1')).toEqual(['the']);
  });

  it('strips punctuation but keeps inner apostrophes and hyphens', () => {
    expect(normalizeWordInput("dog. can't (hi) well-known 'quoted'")).toEqual([
      'dog',
      "can't",
      'hi',
      'well-known',
      'quoted',
    ]);
  });

  it('drops empty tokens and words over the length limit', () => {
    const tooLong = 'a'.repeat(STORY_LIMITS.maxWordLength + 1);
    expect(normalizeWordInput(`... ${tooLong} ok`)).toEqual(['ok']);
  });

  it('returns an empty list for non-string input', () => {
    expect(normalizeWordInput(undefined)).toEqual([]);
  });
});

describe('findWords', () => {
  it('treats apostrophes and hyphens inside a word as part of it', () => {
    expect(findWords(`"Don’t," said Zoë. It's well-known!`).map((w) => w.key)).toEqual([
      "don't",
      'said',
      'zoë',
      "it's",
      'well-known',
    ]);
  });
});
